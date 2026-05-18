import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBreakpoints } from '../../src/composables/useBreakpoints'

describe('useBreakpoints', () => {
  // Store mutable mock MQL objects so tests can flip .matches and fire listeners
  const mqMocks: Record<string, { matches: boolean; listeners: Function[] }> = {}

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => {
      if (!mqMocks[query]) {
        mqMocks[query] = { matches: false, listeners: [] }
      }
      const mock = mqMocks[query]
      return {
        get matches() { return mock.matches },
        addEventListener: (_event: string, cb: Function) => {
          mock.listeners.push(cb)
        },
        removeEventListener: vi.fn(),
      }
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    for (const key in mqMocks) delete mqMocks[key]
  })

  it('initializes with default values', () => {
    const { isXs, isSm } = useBreakpoints()
    expect(isXs.value).toBe(true)
    expect(isSm.value).toBe(false)
  })

  it('updates reactively when matchMedia changes', () => {
    const { isSm } = useBreakpoints()

    // Flip the cached MQL object's matches and fire its listeners
    const smQuery = '(min-width: 576px)'
    if (mqMocks[smQuery]) {
      mqMocks[smQuery].matches = true
      mqMocks[smQuery].listeners.forEach(cb => cb())
    }

    expect(isSm.value).toBe(true)
  })

  it('cleanup() removes all matchMedia listeners', () => {
    const addSpy = vi.fn()
    const removeSpy = vi.fn()
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: addSpy,
      removeEventListener: removeSpy,
    })))

    const { cleanup } = useBreakpoints()
    const addCalls = addSpy.mock.calls.length // should be 5 (one per breakpoint)
    cleanup()

    // removeEventListener called once per listener registered
    expect(removeSpy.mock.calls.length).toBe(addCalls)
  })
})
