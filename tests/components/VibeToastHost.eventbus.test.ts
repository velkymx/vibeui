import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VibeToastHost from '../../src/components/VibeToastHost.vue'
import { useEventBus, resetEventBusForSSR } from '../../src/composables/useEventBus'
import { __toastStore, __resetToastStoreForTests } from '../../src/composables/useToast'
import {
  emitNotificationShow,
  emitNotificationDismiss,
  onNotificationShown,
  onNotificationDismissed,
} from '../../src/composables/eventHelpers'

describe('notification channel over the event bus (#97)', () => {
  beforeEach(() => {
    // Clear per-app handler state but keep the supported-event registry that
    // useToast registered at import time.
    resetEventBusForSSR()
    __resetToastStoreForTests()
  })

  it('shows a toast when notification:show is emitted and a host is mounted', async () => {
    mount(VibeToastHost)
    emitNotificationShow({ message: 'Saved', type: 'success' })
    await flushPromises()
    expect(__toastStore.toasts).toHaveLength(1)
    expect(__toastStore.toasts[0].body).toBe('Saved')
    expect(__toastStore.toasts[0].variant).toBe('success')
  })

  it("maps type 'error' to the danger variant", async () => {
    mount(VibeToastHost)
    emitNotificationShow({ message: 'Nope', type: 'error' })
    await flushPromises()
    expect(__toastStore.toasts[0].variant).toBe('danger')
  })

  it('publishes notification:shown when a toast is created', async () => {
    mount(VibeToastHost)
    const onShown = vi.fn()
    onNotificationShown(onShown)
    emitNotificationShow({ message: 'Hi', type: 'info' })
    await flushPromises()
    expect(onShown).toHaveBeenCalledTimes(1)
    expect(onShown.mock.calls[0][0].id).toBe(__toastStore.toasts[0].id)
  })

  it('dismisses a toast on notification:dismiss and publishes notification:dismissed', async () => {
    mount(VibeToastHost)
    const onDismissed = vi.fn()
    onNotificationDismissed(onDismissed)
    emitNotificationShow({ message: 'Bye soon', type: 'info' })
    await flushPromises()
    const id = __toastStore.toasts[0].id
    emitNotificationDismiss({ id })
    await flushPromises()
    expect(__toastStore.toasts).toHaveLength(0)
    expect(onDismissed).toHaveBeenCalledWith({ id })
  })

  it('publishes error:unhandled when notification:show is emitted with no host mounted', () => {
    const onUnhandled = vi.fn()
    useEventBus().on('error:unhandled', onUnhandled)
    emitNotificationShow({ message: 'orphan', type: 'info' })
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'notification:show' })
  })

  it('stops handling after the host unmounts (auto-cleanup)', async () => {
    const wrapper = mount(VibeToastHost)
    wrapper.unmount()
    const onUnhandled = vi.fn()
    useEventBus().on('error:unhandled', onUnhandled)
    emitNotificationShow({ message: 'after unmount', type: 'info' })
    await flushPromises()
    expect(__toastStore.toasts).toHaveLength(0)
    expect(onUnhandled).toHaveBeenCalledTimes(1)
  })
})
