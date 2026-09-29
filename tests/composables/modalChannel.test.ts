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

  it('the dispatcher survives resetEventBusForSSR (#115)', () => {
    const open = vi.fn()
    registerModal('m1', { open, close: vi.fn() })
    resetEventBusForSSR()
    emitEvent('modal:open', { id: 'm1' })
    expect(open).toHaveBeenCalledTimes(1)
  })
})
