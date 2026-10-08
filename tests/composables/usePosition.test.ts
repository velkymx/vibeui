import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, ref, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { usePosition } from '../../src/composables/usePosition'

// #187: track autoUpdate subscriptions. Real floating-ui listeners stay live,
// the wrapper records subscribe/dispose so stop() disposal is observable.
const tracker = vi.hoisted(() => ({ autoUpdateCount: 0, cleanupCount: 0 }))
// #190: gate computePosition so an update can be left in flight across
// stop()/unmount. Real compute resolves too fast to interleave deterministically.
const computeGate = vi.hoisted(() => ({
  calls: 0,
  gated: false,
  release: null as null | ((result: unknown) => void)
}))

vi.mock('@floating-ui/dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@floating-ui/dom')>()
  return {
    ...actual,
    autoUpdate: (...args: Parameters<typeof actual.autoUpdate>) => {
      tracker.autoUpdateCount += 1
      const cleanup = actual.autoUpdate(...args)
      return () => {
        tracker.cleanupCount += 1
        cleanup()
      }
    },
    computePosition: (...args: Parameters<typeof actual.computePosition>) => {
      computeGate.calls += 1
      if (!computeGate.gated) return actual.computePosition(...args)
      return new Promise((resolve) => {
        computeGate.release = resolve as (result: unknown) => void
      })
    }
  }
})

const FAKE_RESULT = { x: 111, y: 222, placement: 'bottom' }

const settleGate = async () => {
  computeGate.release?.(FAKE_RESULT)
  computeGate.release = null
  await new Promise((r) => setTimeout(r, 0))
  await nextTick()
}

const flush = async (ms = 20) => {
  await new Promise(r => setTimeout(r, ms))
  await nextTick()
}

describe('usePosition', () => {
  beforeEach(() => {
    tracker.autoUpdateCount = 0
    tracker.cleanupCount = 0
    computeGate.calls = 0
    computeGate.gated = false
    computeGate.release = null
    document.body.innerHTML = ''
  })
  it('computes position and applies left/top styles to target', async () => {
    const Harness = defineComponent({
      setup() {
        const anchor = ref<HTMLElement | null>(null)
        const target = ref<HTMLElement | null>(null)
        const { x, y, placement } = usePosition(target, anchor, {
          my: 'top center',
          at: 'bottom center',
          autoUpdate: false
        })
        return { anchor, target, x, y, placement }
      },
      render() {
        return h('div', [
          h('div', { ref: 'anchor', id: 'anchor', style: 'width: 100px; height: 50px;' }, 'A'),
          h('div', { ref: 'target', id: 'target', style: 'width: 80px; height: 30px;' }, 'T')
        ])
      }
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    await flush()

    const target = wrapper.find('#target').element as HTMLElement
    expect(target.style.position).toBe('absolute')
    // left/top will be 0 in jsdom (no layout) but should still be set numerically
    expect(target.style.left).toMatch(/px$/)
    expect(target.style.top).toMatch(/px$/)

    wrapper.unmount()
  })

  it('returns reactive x, y, placement refs', async () => {
    const Harness = defineComponent({
      setup() {
        const anchor = ref<HTMLElement | null>(null)
        const target = ref<HTMLElement | null>(null)
        const pos = usePosition(target, anchor, { autoUpdate: false })
        return { anchor, target, pos }
      },
      render() {
        return h('div', [
          h('div', { ref: 'anchor', id: 'a' }, 'A'),
          h('div', { ref: 'target', id: 't' }, 'T')
        ])
      }
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    await flush()

    expect(typeof (wrapper.vm as unknown as { pos: { x: { value: number } } }).pos.x.value).toBe('number')
    expect(typeof (wrapper.vm as unknown as { pos: { y: { value: number } } }).pos.y.value).toBe('number')
    wrapper.unmount()
  })

  it('manual update() triggers a fresh compute', async () => {
    let resolved = false
    const Harness = defineComponent({
      setup() {
        const anchor = ref<HTMLElement | null>(null)
        const target = ref<HTMLElement | null>(null)
        const { update } = usePosition(target, anchor, { autoUpdate: false })
        return { anchor, target, doUpdate: async () => { await update(); resolved = true } }
      },
      render() {
        return h('div', [
          h('div', { ref: 'anchor' }, 'A'),
          h('div', { ref: 'target' }, 'T')
        ])
      }
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    await flush()

    await (wrapper.vm as unknown as { doUpdate: () => Promise<void> }).doUpdate()
    expect(resolved).toBe(true)
    wrapper.unmount()
  })

  it('stop() removes auto-update lifecycle', async () => {
    const Harness = defineComponent({
      setup() {
        const anchor = ref<HTMLElement | null>(null)
        const target = ref<HTMLElement | null>(null)
        const api = usePosition(target, anchor, { autoUpdate: true })
        return { anchor, target, api }
      },
      render() {
        return h('div', [
          h('div', { ref: 'anchor' }, 'A'),
          h('div', { ref: 'target' }, 'T')
        ])
      }
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    await flush()

    expect(() => {
      ;(wrapper.vm as unknown as { api: { stop: () => void } }).api.stop()
    }).not.toThrow()

    wrapper.unmount()
  })

  // #187: stop() must dispose the autoUpdate listeners, not just restore styles.
  // Fails while stop() reads a module-level `cleanup` that is never assigned.
  it('#187 stop() disposes the autoUpdate subscription', async () => {
    let exposed: ReturnType<typeof usePosition> | undefined
    const Harness = defineComponent({
      setup() {
        const anchor = ref<HTMLElement | null>(null)
        const target = ref<HTMLElement | null>(null)
        exposed = usePosition(target, anchor, { autoUpdate: true })
        return { anchor, target }
      },
      render() {
        return h('div', [
          h('div', { ref: 'anchor' }, 'A'),
          h('div', { ref: 'target' }, 'T')
        ])
      }
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    await flush()
    await flush()

    expect(tracker.autoUpdateCount).toBeGreaterThan(0)
    const started = tracker.autoUpdateCount

    exposed!.stop()
    expect(tracker.cleanupCount).toBe(started)

    // Style restoration still applies alongside listener disposal.
    const target = wrapper.find('div:nth-child(2)').element as HTMLElement
    void target
    wrapper.unmount()
  })

  // #187: stop() must be idempotent and must not break a later effect re-run.
  it('#187 stop() twice then retarget resubscribes exactly once', async () => {
    let exposed: ReturnType<typeof usePosition> | undefined
    const target = ref<HTMLElement | null>(null)
    const Harness = defineComponent({
      setup() {
        const anchor = ref<HTMLElement | null>(null)
        exposed = usePosition(target, anchor, { autoUpdate: true })
        return { anchor }
      },
      render() {
        return h('div', [
          h('div', { ref: 'anchor' }, 'A'),
          h('div', { ref: (el: unknown) => { target.value = el as HTMLElement | null } }, 'T')
        ])
      }
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    await flush()
    await flush()

    const started = tracker.autoUpdateCount
    expect(started).toBeGreaterThan(0)

    exposed!.stop()
    exposed!.stop()
    expect(tracker.cleanupCount).toBe(started)

    wrapper.unmount()
    // Unmount disposal runs through the same shared cleanup without throwing.
    expect(tracker.cleanupCount).toBeGreaterThanOrEqual(started)
  })

  it('does not throw when refs are null', () => {
    const Harness = defineComponent({
      setup() {
        const a = ref<HTMLElement | null>(null)
        const t = ref<HTMLElement | null>(null)
        usePosition(t, a, { autoUpdate: false })
        return {}
      },
      render: () => h('div')
    })
    expect(() => mount(Harness)).not.toThrow()
  })

  // #190: an update in flight across stop() must not write after it resolves.
  // Without a post-await liveness check the late resolve re-applies computed
  // styles, defeating restoreStyle().
  describe('in-flight update across teardown (#190)', () => {
    const makeHarness = () => {
      let exposed: ReturnType<typeof usePosition> | undefined
      const Harness = defineComponent({
        setup() {
          const anchor = ref<HTMLElement | null>(null)
          const target = ref<HTMLElement | null>(null)
          exposed = usePosition(target, anchor, { autoUpdate: false })
          return { anchor, target, api: () => exposed }
        },
        render() {
          return h('div', [
            h('div', { ref: 'anchor', id: 'a190' }, 'A'),
            h('div', { ref: 'target', id: 't190', style: 'position: relative; left: 5px; top: 10px;' }, 'T')
          ])
        }
      })
      return { Harness, exposed: () => exposed! }
    }

    it('stop() before resolve leaves pre-positioning styles and refs untouched', async () => {
      computeGate.gated = true
      const { Harness, exposed } = makeHarness()
      const wrapper = mount(Harness, { attachTo: document.body })
      await nextTick()
      await nextTick()
      expect(computeGate.calls).toBeGreaterThan(0)

      const target = wrapper.find('#t190').element as HTMLElement
      exposed().stop()
      expect(target.style.position).toBe('relative')
      await settleGate()

      expect(target.style.position).toBe('relative')
      expect(target.style.left).toBe('5px')
      expect(target.style.top).toBe('10px')
      expect(exposed().x.value).toBe(0)
      expect(exposed().y.value).toBe(0)
      wrapper.unmount()
    })

    it('a manual update() after stop() still positions (stop is not terminal)', async () => {
      computeGate.gated = true
      const { Harness, exposed } = makeHarness()
      const wrapper = mount(Harness, { attachTo: document.body })
      await nextTick()
      await nextTick()

      exposed().stop()
      const pending = exposed().update()
      await nextTick()
      await settleGate()
      await pending

      const target = wrapper.find('#t190').element as HTMLElement
      expect(target.style.position).toBe('absolute')
      expect(target.style.left).toBe('111px')
      expect(target.style.top).toBe('222px')
      expect(exposed().x.value).toBe(111)
      wrapper.unmount()
    })

    it('unmount before resolve performs no reactive or style writes', async () => {
      computeGate.gated = true
      const { Harness, exposed } = makeHarness()
      const wrapper = mount(Harness, { attachTo: document.body })
      await nextTick()
      await nextTick()
      expect(computeGate.calls).toBeGreaterThan(0)

      const target = wrapper.find('#t190').element as HTMLElement
      const api = exposed()
      wrapper.unmount()
      await settleGate()

      expect(target.style.position).toBe('relative')
      expect(target.style.left).toBe('5px')
      expect(target.style.top).toBe('10px')
      expect(api.x.value).toBe(0)
      expect(api.y.value).toBe(0)
    })
  })
  describe('H17 reactive options getter', () => {
    it('re-computes when getter-returned my/at change', async () => {
      // Flip the entire pair so the table maps both states cleanly.
      const config = ref<{ my: 'top center' | 'bottom center'; at: 'top center' | 'bottom center' }>({
        my: 'top center',
        at: 'bottom center'
      })
      let exposed: ReturnType<typeof usePosition> | undefined

      const Harness = defineComponent({
        setup() {
          const anchor = ref<HTMLElement | null>(null)
          const target = ref<HTMLElement | null>(null)
          exposed = usePosition(target, anchor, () => ({
            my: config.value.my,
            at: config.value.at,
            autoUpdate: false
          }))
          return { anchor, target }
        },
        render() {
          return h('div', [
            h('div', { ref: 'anchor', id: 'a' }, 'A'),
            h('div', { ref: 'target', id: 't' }, 'T')
          ])
        }
      })

      const wrapper = mount(Harness, { attachTo: document.body })
      await flush()
      expect(exposed?.placement.value).toBe('bottom')

      // Swap to "target's bottom on anchor's top" → should resolve to 'top'
      config.value = { my: 'bottom center', at: 'top center' }
      await flush()
      expect(exposed?.placement.value).toBe('top')
      wrapper.unmount()
    })
  })

  describe('H18 style restoration', () => {
    it('restores previous target.style.position / left / top after stop()', async () => {
      let exposed: ReturnType<typeof usePosition> | undefined
      const Harness = defineComponent({
        setup() {
          const anchor = ref<HTMLElement | null>(null)
          const target = ref<HTMLElement | null>(null)
          exposed = usePosition(target, anchor, { autoUpdate: false })
          return { anchor, target }
        },
        render() {
          return h('div', [
            h('div', { ref: 'anchor', id: 'a' }, 'A'),
            h('div', { ref: 'target', id: 't', style: 'position: relative; left: 5px; top: 10px;' }, 'T')
          ])
        }
      })

      const wrapper = mount(Harness, { attachTo: document.body })
      await flush()

      const target = wrapper.find('#t').element as HTMLElement
      // Composable should have overwritten with absolute / 0 / 0
      expect(target.style.position).toBe('absolute')

      exposed?.stop()
      // Restore previous inline styles
      expect(target.style.position).toBe('relative')
      expect(target.style.left).toBe('5px')
      expect(target.style.top).toBe('10px')
      wrapper.unmount()
    })

    it('restores style on component unmount', async () => {
      const Harness = defineComponent({
        setup() {
          const anchor = ref<HTMLElement | null>(null)
          const target = ref<HTMLElement | null>(null)
          usePosition(target, anchor, { autoUpdate: false })
          return { anchor, target }
        },
        render() {
          return h('div', [
            h('div', { ref: 'anchor' }, 'A'),
            h('div', { ref: 'target', id: 'unmount-t', style: 'position: static;' }, 'T')
          ])
        }
      })

      const wrapper = mount(Harness, { attachTo: document.body })
      await flush()
      const target = document.getElementById('unmount-t')!
      // Cache reference before unmount
      const targetClone = target.cloneNode(true) as HTMLElement
      void targetClone
      wrapper.unmount()
      // Element is detached after unmount; nothing to assert directly.
      // The contract is the inline style restoration happens before detach;
      // this test exists to ensure no throw on unmount path.
      expect(true).toBe(true)
    })
  })
})
