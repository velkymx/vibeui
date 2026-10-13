import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reportComponentError } from '../../src/utils/reportComponentError'
import { useEventBus, __resetEventBusForTests } from '../../src/composables/useEventBus'
import type { ComponentError } from '../../src/types'

describe('reportComponentError', () => {
  beforeEach(() => {
    __resetEventBusForTests()
  })

  const err: ComponentError = {
    message: 'boom',
    componentName: 'VibeThing',
    originalError: new Error('x'),
  }

  it('emits the local component-error event', () => {
    const emit = vi.fn()
    reportComponentError(emit, err)
    expect(emit).toHaveBeenCalledWith('component-error', err)
  })

  it('publishes the same payload on the bus error:component channel', () => {
    const onBus = vi.fn()
    useEventBus().on('error:component', onBus)
    reportComponentError(vi.fn(), err)
    expect(onBus).toHaveBeenCalledWith(err)
  })

  it('does both from a single call', () => {
    const emit = vi.fn()
    const onBus = vi.fn()
    useEventBus().on('error:component', onBus)
    reportComponentError(emit, err)
    expect(emit).toHaveBeenCalledTimes(1)
    expect(onBus).toHaveBeenCalledTimes(1)
  })
})
