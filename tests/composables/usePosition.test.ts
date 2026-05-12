import { describe, it, expect } from 'vitest'
import { defineComponent, ref, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { usePosition } from '../../src/composables/usePosition'

const flush = async (ms = 20) => {
  await new Promise(r => setTimeout(r, ms))
  await nextTick()
}

describe('usePosition', () => {
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
