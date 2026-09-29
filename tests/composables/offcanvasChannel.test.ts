import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerOffcanvas, __resetOffcanvasRegistry } from '../../src/composables/offcanvasChannel'
import { useEventBus, emitEvent } from '../../src/composables/useEventBus'

const controller = () => ({ open: vi.fn(), close: vi.fn(), toggle: vi.fn() })

describe('offcanvasChannel registry + dispatcher (#100)', () => {
  beforeEach(() => {
    __resetOffcanvasRegistry()
  })

  it('routes offcanvas:open / close / toggle to the controller for that id', () => {
    const c = controller()
    registerOffcanvas('oc1', c, false)
    emitEvent('offcanvas:open', { id: 'oc1' })
    emitEvent('offcanvas:close', { id: 'oc1' })
    emitEvent('offcanvas:toggle', { id: 'oc1' })
    expect(c.open).toHaveBeenCalledTimes(1)
    expect(c.close).toHaveBeenCalledTimes(1)
    expect(c.toggle).toHaveBeenCalledTimes(1)
  })

  it('publishes error:unhandled for a command to an unknown id', () => {
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('offcanvas:open', { id: 'ghost' })
    off()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'offcanvas:open', id: 'ghost' })
  })

  it('layout:sidebar-toggle toggles the offcanvas registered as the sidebar', () => {
    const other = controller()
    const sidebar = controller()
    registerOffcanvas('oc1', other, false)
    registerOffcanvas('side', sidebar, true)
    emitEvent('layout:sidebar-toggle', undefined)
    expect(sidebar.toggle).toHaveBeenCalledTimes(1)
    expect(other.toggle).not.toHaveBeenCalled()
  })

  it('layout:sidebar-toggle with no sidebar registered publishes error:unhandled', () => {
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('layout:sidebar-toggle', undefined)
    off()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'layout:sidebar-toggle' })
  })

  it('stops routing after unregister', () => {
    const c = controller()
    const unregister = registerOffcanvas('oc1', c, true)
    unregister()
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('offcanvas:open', { id: 'oc1' })
    emitEvent('layout:sidebar-toggle', undefined)
    off()
    expect(c.open).not.toHaveBeenCalled()
    expect(onUnhandled).toHaveBeenCalledTimes(2)
  })
})
