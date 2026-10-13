import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as bootstrap from 'bootstrap'
import VibeOffcanvas from '../../src/components/VibeOffcanvas.vue'
import { useEventBus } from '../../src/composables/useEventBus'
import { __resetOffcanvasRegistry } from '../../src/composables/offcanvasChannel'
import {
  emitOffcanvasOpen,
  emitOffcanvasToggle,
  emitLayoutSidebarToggle,
  onOffcanvasOpened,
  onOffcanvasClosed,
  onLayoutSidebarToggled,
} from '../../src/composables/eventHelpers'

const lastOffcanvas = () => {
  const m = vi.mocked(bootstrap.Offcanvas)
  return m.mock.results[m.mock.results.length - 1].value as { show: ReturnType<typeof vi.fn>; hide: ReturnType<typeof vi.fn> }
}

describe('VibeOffcanvas over the event bus (#100)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetOffcanvasRegistry()
  })

  it('opens the offcanvas with the matching id on offcanvas:open', async () => {
    mount(VibeOffcanvas, { props: { id: 'oc1', teleport: false } })
    await flushPromises()
    emitOffcanvasOpen({ id: 'oc1' })
    expect(lastOffcanvas().show).toHaveBeenCalledTimes(1)
  })

  it('toggles (shows when hidden) on offcanvas:toggle', async () => {
    mount(VibeOffcanvas, { props: { id: 'oc1', teleport: false } })
    await flushPromises()
    emitOffcanvasToggle({ id: 'oc1' })
    expect(lastOffcanvas().show).toHaveBeenCalledTimes(1)
  })

  it('publishes offcanvas:opened / closed on the bootstrap lifecycle events', async () => {
    const wrapper = mount(VibeOffcanvas, { props: { id: 'oc1', teleport: false } })
    await flushPromises()
    const opened = vi.fn()
    const closed = vi.fn()
    const offO = onOffcanvasOpened(opened)
    const offC = onOffcanvasClosed(closed)
    const el = wrapper.find('.offcanvas').element
    el.dispatchEvent(new Event('shown.bs.offcanvas'))
    el.dispatchEvent(new Event('hidden.bs.offcanvas'))
    offO()
    offC()
    expect(opened).toHaveBeenCalledWith({ id: 'oc1' })
    expect(closed).toHaveBeenCalledWith({ id: 'oc1' })
  })

  it('a sidebar offcanvas responds to layout:sidebar-toggle and emits layout:sidebar-toggled', async () => {
    const wrapper = mount(VibeOffcanvas, { props: { id: 'side', sidebar: true, teleport: false } })
    await flushPromises()
    const toggled = vi.fn()
    const off = onLayoutSidebarToggled(toggled)
    emitLayoutSidebarToggle()
    expect(lastOffcanvas().show).toHaveBeenCalledTimes(1)
    // lifecycle fires from the bootstrap shown event
    wrapper.find('.offcanvas').element.dispatchEvent(new Event('shown.bs.offcanvas'))
    off()
    expect(toggled).toHaveBeenCalledWith({ open: true })
  })

  it('stops responding after unmount', async () => {
    const wrapper = mount(VibeOffcanvas, { props: { id: 'oc1', teleport: false } })
    await flushPromises()
    wrapper.unmount()
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitOffcanvasOpen({ id: 'oc1' })
    off()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
  })
})
