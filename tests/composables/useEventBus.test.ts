import { describe, it, expect, vi, beforeEach } from 'vitest'
import { effectScope } from 'vue'
import {
  useEventBus,
  emitEvent,
  onPersistent,
  registerSupportedEvent,
  resetEventBusForSSR,
  __resetEventBusForTests,
} from '../../src/composables/useEventBus'

describe('useEventBus', () => {
  beforeEach(() => {
    __resetEventBusForTests()
  })

  it('returns the same eager singleton on every call', () => {
    expect(useEventBus()).toBe(useEventBus())
  })

  it('delivers an emitted payload to a subscriber', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    bus.on('cart:add', fn)
    bus.emit('cart:add', { id: 1 })
    expect(fn).toHaveBeenCalledWith({ id: 1 })
  })

  it('on() returns an unsubscribe that stops delivery', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    const off = bus.on('x', fn)
    off()
    bus.emit('x', 1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('once() fires at most once', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    bus.once('x', fn)
    bus.emit('x', 1)
    bus.emit('x', 2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('off(event, handler) removes a specific handler', () => {
    const bus = useEventBus()
    const a = vi.fn()
    const b = vi.fn()
    bus.on('x', a)
    bus.on('x', b)
    bus.off('x', a)
    bus.emit('x', 1)
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('clear() removes all handlers', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    bus.on('x', fn)
    bus.clear()
    bus.emit('x', 1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('delivers to every subscriber of an event', () => {
    const bus = useEventBus()
    const a = vi.fn()
    const b = vi.fn()
    bus.on('x', a)
    bus.on('x', b)
    bus.emit('x', 1)
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('isolates a throwing handler: other handlers still run and the error surfaces on error:component', () => {
    const bus = useEventBus()
    const boom = () => { throw new Error('bad handler') }
    const after = vi.fn()
    const onError = vi.fn()
    bus.on('error:component', onError)
    bus.on('x', boom)
    bus.on('x', after)
    expect(() => bus.emit('x', 1)).not.toThrow()
    expect(after).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toMatchObject({ componentName: 'EventBus' })
  })

  it('does not recurse when an error:component handler throws', () => {
    const bus = useEventBus()
    let calls = 0
    bus.on('error:component', () => { calls++; throw new Error('error handler threw') })
    // publish an error by making a normal handler throw
    bus.on('x', () => { throw new Error('boom') })
    expect(() => bus.emit('x', 1)).not.toThrow()
    // the error handler ran once and its own throw did not re-enter the error channel
    expect(calls).toBe(1)
  })

  it('publishes error:unhandled when a supported event has no handler', () => {
    const bus = useEventBus()
    registerSupportedEvent('notification:show')
    const onUnhandled = vi.fn()
    bus.on('error:unhandled', onUnhandled)
    bus.emit('notification:show', { message: 'hi' })
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'notification:show' })
  })

  it('does not publish error:unhandled for a supported event that has a handler', () => {
    const bus = useEventBus()
    registerSupportedEvent('notification:show')
    const onUnhandled = vi.fn()
    bus.on('error:unhandled', onUnhandled)
    bus.on('notification:show', () => {})
    bus.emit('notification:show', { message: 'hi' })
    expect(onUnhandled).not.toHaveBeenCalled()
  })

  it('does not publish error:unhandled for an unsupported (app) event with no handler', () => {
    const bus = useEventBus()
    const onUnhandled = vi.fn()
    bus.on('error:unhandled', onUnhandled)
    bus.emit('app:whatever', 1)
    expect(onUnhandled).not.toHaveBeenCalled()
  })

  it('auto-unsubscribes when the surrounding effect scope stops', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    const scope = effectScope()
    scope.run(() => {
      bus.on('x', fn)
    })
    scope.stop()
    bus.emit('x', 1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('framework can publish via emitEvent without calling useEventBus()', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    bus.on('theme:changed', fn)
    emitEvent('theme:changed', { theme: 'dark' })
    expect(fn).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('resetEventBusForSSR clears handlers', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    bus.on('x', fn)
    resetEventBusForSSR()
    bus.emit('x', 1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('resetEventBusForSSR keeps persistent handlers but drops per-app handlers (#115)', () => {
    const bus = useEventBus()
    const normal = vi.fn()
    const persistent = vi.fn()
    bus.on('x', normal)
    onPersistent('x', persistent)
    resetEventBusForSSR()
    bus.emit('x', 1)
    expect(normal).not.toHaveBeenCalled()
    expect(persistent).toHaveBeenCalledWith(1)
  })

  it('onPersistent returns an unsubscribe and delivers like on()', () => {
    const bus = useEventBus()
    const fn = vi.fn()
    const off = onPersistent('y', fn)
    bus.emit('y', 1)
    off()
    bus.emit('y', 2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('supports nested emit from within a handler', () => {
    const bus = useEventBus()
    const inner = vi.fn()
    bus.on('inner', inner)
    bus.on('outer', () => bus.emit('inner', 42))
    bus.emit('outer', 0)
    expect(inner).toHaveBeenCalledWith(42)
  })

  it('a handler added during dispatch does not fire in the same emit', () => {
    const bus = useEventBus()
    const late = vi.fn()
    bus.on('x', () => { bus.on('x', late) })
    bus.emit('x', 1)
    expect(late).not.toHaveBeenCalled()
    bus.emit('x', 2)
    expect(late).toHaveBeenCalledTimes(1)
  })

  it('handlers live at emit-time all run even if one is removed mid-dispatch (snapshot), and are gone next emit', () => {
    const bus = useEventBus()
    const b = vi.fn()
    let offB: () => void = () => {}
    bus.on('x', () => offB()) // removes b during this dispatch
    offB = bus.on('x', b)
    bus.emit('x', 1)
    expect(b).toHaveBeenCalledTimes(1) // snapshot: b was live when emit started
    bus.emit('x', 2)
    expect(b).toHaveBeenCalledTimes(1) // and removed for subsequent emits
  })
})
