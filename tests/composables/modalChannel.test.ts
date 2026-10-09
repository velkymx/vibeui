import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerModal, __resetModalRegistry } from '../../src/composables/modalChannel'
import { useEventBus, emitEvent, resetEventBusForSSR } from '../../src/composables/useEventBus'

describe('modalChannel registry + dispatcher (#98)', () => {
  beforeEach(() => {
    __resetModalRegistry()
  })

  it('routes modal:open to the controller registered for that id', () => {
    const open = vi.fn()
    const close = vi.fn()
    registerModal('m1', { open, close })
    emitEvent('modal:open', { id: 'm1', payload: { foo: 1 } })
    expect(open).toHaveBeenCalledWith({ foo: 1 })
    expect(close).not.toHaveBeenCalled()
  })

  it('routes modal:close to the controller for that id', () => {
    const open = vi.fn()
    const close = vi.fn()
    registerModal('m1', { open, close })
    emitEvent('modal:close', { id: 'm1' })
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('publishes error:unhandled for modal:open to an unknown id', () => {
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('modal:open', { id: 'ghost' })
    off()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'modal:open', id: 'ghost' })
  })

  it('stops routing after unregister', () => {
    const open = vi.fn()
    const unregister = registerModal('m1', { open, close: vi.fn() })
    unregister()
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('modal:open', { id: 'm1' })
    off()
    expect(open).not.toHaveBeenCalled()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
  })

  // #231 overrides the old #115 expectation: the registry is per-request
  // state, so the SSR reset clears it. The persistent dispatcher survives and
  // reports error:unhandled for the now-unknown id instead of routing into a
  // disposed controller from a previous request.
  it('resetEventBusForSSR clears the registry; the dispatcher reports unhandled (#231)', () => {
    const open = vi.fn()
    registerModal('m1', { open, close: vi.fn() })
    resetEventBusForSSR()
    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('modal:open', { id: 'm1' })
    off()
    expect(open).not.toHaveBeenCalled()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
  })

  it('warns when registering a duplicate id (#117)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerModal('dup', { open: vi.fn(), close: vi.fn() })
    registerModal('dup', { open: vi.fn(), close: vi.fn() })
    expect(warn).toHaveBeenCalled()
    expect(String(warn.mock.calls[0][0])).toContain('dup')
    warn.mockRestore()
  })
})
