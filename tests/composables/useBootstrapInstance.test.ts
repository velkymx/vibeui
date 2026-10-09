import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useBootstrapInstance } from '../../src/composables/useBootstrapInstance'

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
})
