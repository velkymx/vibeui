import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useBootstrapInstance, useBootstrapInstanceMap } from '../../src/composables/useBootstrapInstance'

interface FakeInstance {
  el: HTMLElement
  dispose: ReturnType<typeof vi.fn>
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const setupHarness = () => {
  const el1 = document.createElement('div')
  const el2 = document.createElement('div')
  let currentEl: HTMLElement | null = el1
  const created: FakeInstance[] = []
  const create = vi.fn((_el: HTMLElement) => {
    const inst: FakeInstance = { el: _el, dispose: vi.fn() }
    created.push(inst)
    return inst
  })
  const onError = vi.fn()
  const handler = vi.fn()
  let api!: ReturnType<typeof useBootstrapInstance<FakeInstance>>
  const Comp = defineComponent({
    setup() {
      api = useBootstrapInstance<FakeInstance>({
        resolveElement: () => currentEl,
        create,
        disposeInstance: (inst) => inst.dispose(),
        events: { 'test.bs.event': handler as EventListener },
        componentName: 'Harness',
        onError
      })
      return () => h('div')
    }
  })
  const wrapper = mount(Comp)
  return {
    wrapper,
    get api() {
      return api
    },
    el1,
    el2,
    create,
    created,
    onError,
    handler,
    setEl: (el: HTMLElement | null) => {
      currentEl = el
    }
  }
}

describe('useBootstrapInstance', () => {
  it('constructs against the resolved element and returns the instance', async () => {
    const { wrapper, api, el1, create, created } = setupHarness()
    const inst = await api.init()
    await settle()

    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0]).toBe(el1)
    expect(inst).toBe(created[0])
    expect(api.get()).toBe(created[0])
    wrapper.unmount()
  })

  it('returns null and constructs nothing when no element resolves', async () => {
    const { wrapper, api, create, setEl } = setupHarness()
    setEl(null)

    expect(await api.init()).toBeNull()
    expect(create).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('constructs nothing and reports no error when unmounted mid-import', async () => {
    const { wrapper, api, create, onError } = setupHarness()
    const pending = api.init()
    wrapper.unmount()
    await pending
    await settle()

    expect(create).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('serves a reinit queued while the import is in flight', async () => {
    const { wrapper, api, create, created } = setupHarness()
    const first = api.init()
    const second = api.init()
    await first
    await second
    await settle()
    await settle()

    expect(create).toHaveBeenCalledTimes(2)
    expect(api.get()).toBe(created[1])
    wrapper.unmount()
  })

  it('builds against the fresh element when it swaps mid-import', async () => {
    const { wrapper, api, create, created, el2, setEl } = setupHarness()
    const pending = api.init()
    setEl(el2)
    await pending
    await settle()

    expect(create).toHaveBeenCalledTimes(1)
    expect(created[0].el).toBe(el2)
    wrapper.unmount()
  })

  it('attaches events to the live element and detaches on re-init', async () => {
    const { wrapper, api, el1, el2, handler, setEl } = setupHarness()
    await api.init()
    await settle()
    el1.dispatchEvent(new Event('test.bs.event'))
    expect(handler).toHaveBeenCalledTimes(1)

    setEl(el2)
    await api.init()
    await settle()
    el1.dispatchEvent(new Event('test.bs.event'))
    expect(handler).toHaveBeenCalledTimes(1)
    el2.dispatchEvent(new Event('test.bs.event'))
    expect(handler).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('destroy disposes once, detaches events, and nulls the instance', async () => {
    const { wrapper, api, el1, created, handler } = setupHarness()
    await api.init()
    await settle()

    api.destroy()
    api.destroy()
    expect(created[0].dispose).toHaveBeenCalledTimes(1)
    expect(api.get()).toBeNull()
    el1.dispatchEvent(new Event('test.bs.event'))
    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('unmount disposes the live instance', async () => {
    const { wrapper, api, created } = setupHarness()
    await api.init()
    await settle()

    wrapper.unmount()
    expect(created[0].dispose).toHaveBeenCalledTimes(1)
  })

  it('reports load failure and allows a later retry', async () => {
    const { wrapper, api, create, onError } = setupHarness()
    create.mockImplementationOnce(() => {
      throw new Error('nope')
    })
    await api.init()
    await settle()

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toMatchObject({ componentName: 'Harness' })
    expect(api.get()).toBeNull()

    await api.init()
    await settle()
    expect(create).toHaveBeenCalledTimes(2)
    expect(api.get()).not.toBeNull()
    wrapper.unmount()
  })

  // #247 multi-owner follow-ups: manual teardown plus a keyed map.
  describe('manual teardown (#247)', () => {
    const setupManual = () => {
      const el = document.createElement('div')
      const created: FakeInstance[] = []
      const create = vi.fn((_el: HTMLElement) => {
        const inst: FakeInstance = { el: _el, dispose: vi.fn() }
        created.push(inst)
        return inst
      })
      const onError = vi.fn()
      let api!: ReturnType<typeof useBootstrapInstance<FakeInstance>>
      const Comp = defineComponent({
        setup() {
          api = useBootstrapInstance<FakeInstance>({
            resolveElement: () => el,
            create,
            disposeInstance: (inst) => inst.dispose(),
            componentName: 'Manual',
            onError,
            manualTeardown: true
          })
          return () => h('div')
        }
      })
      const wrapper = mount(Comp)
      return { wrapper, api, el, create, created, onError }
    }

    it('skips the automatic unmount teardown, teardown() disposes', async () => {
      const { wrapper, api, created } = setupManual()
      await api.init()
      await settle()
      wrapper.unmount()
      expect(created[0].dispose).not.toHaveBeenCalled()
      api.teardown()
      expect(created[0].dispose).toHaveBeenCalledTimes(1)
      expect(api.get()).toBeNull()
    })

    it('teardown() invalidates an in-flight init', async () => {
      const { wrapper, api, create, onError } = setupManual()
      const pending = api.init()
      api.teardown()
      await pending
      await settle()
      expect(create).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
      // Post-teardown init stays dead (owner spent).
      expect(await api.init()).toBeNull()
      wrapper.unmount()
    })
  })

  describe('useBootstrapInstanceMap (#247)', () => {
    const setupMap = () => {
      const created: FakeInstance[] = []
      const create = vi.fn((_el: HTMLElement) => {
        const inst: FakeInstance = { el: _el, dispose: vi.fn() }
        created.push(inst)
        return inst
      })
      const onError = vi.fn()
      const handler = vi.fn()
      let api!: ReturnType<typeof useBootstrapInstanceMap<FakeInstance>>
      const Comp = defineComponent({
        setup() {
          api = useBootstrapInstanceMap<FakeInstance>({
            create,
            disposeInstance: (inst) => inst.dispose(),
            events: { 'test.bs.event': handler as EventListener },
            componentName: 'Map',
            onError
          })
          return () => h('div')
        }
      })
      const wrapper = mount(Comp)
      return { wrapper, api, create, created, onError, handler }
    }

    it('constructs one instance per element, reuses live ones', async () => {
      const { wrapper, api, create, created } = setupMap()
      const a = document.createElement('div')
      const b = document.createElement('div')
      const first = await api.ensure(a)
      const same = await api.ensure(a)
      const second = await api.ensure(b)
      await settle()
      expect(create).toHaveBeenCalledTimes(2)
      expect(first).toBe(created[0])
      expect(same).toBe(created[0])
      expect(second).toBe(created[1])
      expect(api.get(a)).toBe(created[0])
      expect(api.has(b)).toBe(true)
      expect(api.instances.size).toBe(2)
      wrapper.unmount()
    })

    it('returns null for a null element', async () => {
      const { wrapper, api, create } = setupMap()
      expect(await api.ensure(null)).toBeNull()
      expect(create).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('attaches events per element and detaches on disposeEl', async () => {
      const { wrapper, api, handler } = setupMap()
      const a = document.createElement('div')
      await api.ensure(a)
      await settle()
      a.dispatchEvent(new Event('test.bs.event'))
      expect(handler).toHaveBeenCalledTimes(1)
      api.disposeEl(a)
      expect(api.has(a)).toBe(false)
      a.dispatchEvent(new Event('test.bs.event'))
      expect(handler).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('disposeAll clears everything but stays usable', async () => {
      const { wrapper, api, create, created } = setupMap()
      const a = document.createElement('div')
      await api.ensure(a)
      await settle()
      api.disposeAll()
      expect(created[0].dispose).toHaveBeenCalledTimes(1)
      expect(api.instances.size).toBe(0)
      await api.ensure(a)
      await settle()
      expect(create).toHaveBeenCalledTimes(2)
      wrapper.unmount()
    })

    it('unmount tears down all entries and blocks later ensure', async () => {
      const { wrapper, api, create, created } = setupMap()
      const a = document.createElement('div')
      await api.ensure(a)
      await settle()
      wrapper.unmount()
      expect(created[0].dispose).toHaveBeenCalledTimes(1)
      expect(await api.ensure(a)).toBeNull()
      expect(create).toHaveBeenCalledTimes(1)
    })

    it('teardown mid-flight constructs nothing', async () => {
      const { wrapper, api, create, onError } = setupMap()
      const a = document.createElement('div')
      const pending = api.ensure(a)
      wrapper.unmount()
      await pending
      await settle()
      expect(create).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  // #271: disposing a Bootstrap instance mid-transition nulls props its queued
  // emulated-duration callback still dereferences (uncaught throw on the
  // detached element). Skipping dispose entirely leaks, Bootstrap keeps
  // instances in a strong element Map that only dispose() clears. So teardown
  // defers dispose until the transition settles.
  describe('transition-aware dispose (#271)', () => {
    interface TransitioningInstance extends FakeInstance {
      _isTransitioning: boolean
    }
    const setupTransitioning = () => {
      const el = document.createElement('div')
      const created: TransitioningInstance[] = []
      const create = vi.fn((_el: HTMLElement) => {
        const inst: TransitioningInstance = {
          el: _el,
          dispose: vi.fn(),
          _isTransitioning: false
        }
        created.push(inst)
        return inst
      })
      let api!: ReturnType<typeof useBootstrapInstance<TransitioningInstance>>
      const Comp = defineComponent({
        setup() {
          api = useBootstrapInstance<TransitioningInstance>({
            resolveElement: () => el,
            create,
            disposeInstance: (inst) => inst.dispose(),
            componentName: 'Transition',
            onError: vi.fn()
          })
          return () => h('div')
        }
      })
      const wrapper = mount(Comp)
      return { wrapper, api, created }
    }

    it('disposes synchronously when the instance is not transitioning', async () => {
      const { wrapper, api, created } = setupTransitioning()
      await api.init()
      await settle()

      api.destroy()
      expect(created[0].dispose).toHaveBeenCalledTimes(1)
      expect(api.get()).toBeNull()
      wrapper.unmount()
    })

    it('defers dispose while transitioning, then disposes once it settles', async () => {
      const { wrapper, api, created } = setupTransitioning()
      await api.init()
      await settle()
      const inst = created[0]
      inst._isTransitioning = true

      vi.useFakeTimers()
      try {
        api.destroy()
        // Detached and dropped from our ref, but NOT disposed mid-transition.
        expect(inst.dispose).not.toHaveBeenCalled()
        expect(api.get()).toBeNull()

        // Transition completes: dispose now runs so Data.remove clears the registry.
        inst._isTransitioning = false
        vi.advanceTimersByTime(50)
        expect(inst.dispose).toHaveBeenCalledTimes(1)

        // Timer cleared, no further disposes.
        vi.advanceTimersByTime(2000)
        expect(inst.dispose).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
      wrapper.unmount()
    })

    it('disposes at the capped fallback if the transition never settles', async () => {
      const { wrapper, api, created } = setupTransitioning()
      await api.init()
      await settle()
      const inst = created[0]
      inst._isTransitioning = true

      vi.useFakeTimers()
      try {
        api.destroy()
        expect(inst.dispose).not.toHaveBeenCalled()

        // Flag never clears, but the cap forces a single dispose so nothing leaks.
        vi.advanceTimersByTime(1000)
        expect(inst.dispose).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(2000)
        expect(inst.dispose).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
      wrapper.unmount()
    })

    it('reinit waits out the transition, then replaces the instance', async () => {
      const { wrapper, api, created } = setupTransitioning()
      await api.init()
      await settle()
      const old = created[0]
      old._isTransitioning = true

      vi.useFakeTimers()
      try {
        const second = api.init()
        // The reinit suspends on the settle wait: nothing created or disposed
        // synchronously (no setTimeout-based settle() under fake timers here;
        // the async preamble runs sync up to the first await).
        await Promise.resolve()
        expect(created).toHaveLength(1)
        expect(old.dispose).not.toHaveBeenCalled()

        // Transition settles: old disposed once, then the new instance lands.
        old._isTransitioning = false
        vi.advanceTimersByTime(50)
        await second
        expect(old.dispose).toHaveBeenCalledTimes(1)
        expect(created).toHaveLength(2)
        expect(api.get()).toBe(created[1])
      } finally {
        vi.useRealTimers()
      }
      wrapper.unmount()
    })
  })
})
