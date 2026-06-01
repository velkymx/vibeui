import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBreakpoints } from '../../src/composables/useBreakpoints'

describe('useBreakpoints', () => {
  const listeners: Record<string, Function> = {}

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: query.includes('576px') ? false : false, // Default
      addEventListener: (event: string, cb: Function) => {
        listeners[query] = cb
      },
      removeEventListener: vi.fn(),
    })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    for (const key in listeners) delete listeners[key]
  })

  it('initializes with default values', () => {
    const { isXs, isSm } = useBreakpoints()
    expect(isXs.value).toBe(true)
    expect(isSm.value).toBe(false)
  })

  it('updates reactively when matchMedia changes', () => {
    const { isSm } = useBreakpoints()
    
    // Simulate media query match
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: query.includes('576px'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))

    // Trigger the listener for SM
    if (listeners['(min-width: 576px)']) {
      listeners['(min-width: 576px)']()
    }

    expect(isSm.value).toBe(true)
  })
})
