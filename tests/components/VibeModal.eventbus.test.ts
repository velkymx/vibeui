import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as bootstrap from 'bootstrap'
import VibeModal from '../../src/components/VibeModal.vue'
import { useEventBus } from '../../src/composables/useEventBus'
import { __resetModalRegistry } from '../../src/composables/modalChannel'
import {
  emitModalOpen,
  emitModalClose,
  onModalOpened,
  onModalClosed,
} from '../../src/composables/eventHelpers'

const lastModal = () => {
  const m = vi.mocked(bootstrap.Modal)
  return m.mock.results[m.mock.results.length - 1].value as { show: ReturnType<typeof vi.fn>; hide: ReturnType<typeof vi.fn> }
}

describe('VibeModal over the event bus (#98)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetModalRegistry()
  })

  it('opens the modal with the matching id on modal:open', async () => {
    mount(VibeModal, { props: { id: 'm1', teleport: false } })
    await flushPromises()
    emitModalOpen({ id: 'm1' })
    expect(lastModal().show).toHaveBeenCalledTimes(1)
  })

  it('closes the modal with the matching id on modal:close', async () => {
    mount(VibeModal, { props: { id: 'm1', teleport: false } })
    await flushPromises()
    emitModalClose({ id: 'm1' })
    expect(lastModal().hide).toHaveBeenCalledTimes(1)
  })

  it('a modal:beforeOpen handler can veto the open', async () => {
    const bus = useEventBus()
    const off = bus.on('modal:beforeOpen', ({ cancel }) => cancel())
    mount(VibeModal, { props: { id: 'm1', teleport: false } })
    await flushPromises()
    emitModalOpen({ id: 'm1' })
    off()
    expect(lastModal().show).not.toHaveBeenCalled()
  })

  it('publishes modal:opened / modal:closed on the bootstrap lifecycle events', async () => {
    const wrapper = mount(VibeModal, { props: { id: 'm1', teleport: false } })
    await flushPromises()
    const opened = vi.fn()
    const closed = vi.fn()
    const offO = onModalOpened(opened)
    const offC = onModalClosed(closed)
    const el = wrapper.find('.modal').element
    el.dispatchEvent(new Event('shown.bs.modal'))
    el.dispatchEvent(new Event('hidden.bs.modal'))
    offO()
    offC()
    expect(opened).toHaveBeenCalledWith({ id: 'm1' })
    expect(closed).toHaveBeenCalledWith({ id: 'm1' })
  })

  it('exposes the open payload to the default slot', async () => {
    const wrapper = mount(VibeModal, {
      props: { id: 'm1', teleport: false },
      slots: { default: `<template #default="{ payload }">val:{{ payload && payload.label }}</template>` },
    })
    await flushPromises()
    emitModalOpen({ id: 'm1', payload: { label: 'hello' } })
    await flushPromises()
    expect(wrapper.text()).toContain('val:hello')
  })

  it('stops responding after unmount', async () => {
    const wrapper = mount(VibeModal, { props: { id: 'm1', teleport: false } })
    await flushPromises()
    wrapper.unmount()
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitModalOpen({ id: 'm1' })
    off()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
  })

  it('re-registers when the id changes after mount (#119)', async () => {
    const wrapper = mount(VibeModal, { props: { id: 'a', teleport: false } })
    await flushPromises()
    await wrapper.setProps({ id: 'b' })
    await flushPromises()

    // the old id is now unknown
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitModalOpen({ id: 'a' })
    off()
    expect(onUnhandled).toHaveBeenCalledTimes(1)

    // the new id opens this modal
    emitModalOpen({ id: 'b' })
    expect(lastModal().show).toHaveBeenCalledTimes(1)
  })
})
