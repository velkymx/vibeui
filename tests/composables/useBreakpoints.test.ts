import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useBreakpoints } from '../../src/composables/useBreakpoints'

// Run a composable inside a real component setup so getCurrentInstance() is truthy —
// this mirrors normal usage (no "outside component context" warning) and wires the
// composable's onUnmounted cleanup to the returned unmount().
function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  let result!: T
  const wrapper = mount(
    defineComponent({
      setup() {
        result = composable()
        return () => null
      }
    })
  )
  return { result, unmount: () => wrapper.unmount() }
}

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
    // Assert no "outside component context" warning when used correctly (in setup).
    // A negative assertion is deterministic — it fails on regression without relying
    // on reading stderr.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result: { isXs, isSm }, unmount } = withSetup(() => useBreakpoints())
    expect(isXs.value).toBe(true)
    expect(isSm.value).toBe(false)
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('Called outside component context'))

    unmount()
    warnSpy.mockRestore()
  })

  it('updates reactively when matchMedia changes', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result: { isSm }, unmount } = withSetup(() => useBreakpoints())

    // Flip the cached MQL object's matches and fire its listeners
    const smQuery = '(min-width: 576px)'
    if (mqMocks[smQuery]) {
      mqMocks[smQuery].matches = true
      mqMocks[smQuery].listeners.forEach(cb => cb())
    }

    expect(isSm.value).toBe(true)
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('Called outside component context'))

    unmount()
    warnSpy.mockRestore()
  })

  it('cleanup() removes all matchMedia listeners', () => {
    const addSpy = vi.fn()
    const removeSpy = vi.fn()
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: addSpy,
      removeEventListener: removeSpy,
    })))

    // Calling outside a component setup is exactly the case cleanup() exists for;
    // the composable warns to remind the caller to invoke cleanup() manually.
    // Spy so that expected warning is asserted instead of leaking to test output.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { cleanup } = useBreakpoints()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Called outside component context'))

    const addCalls = addSpy.mock.calls.length // should be 5 (one per breakpoint)
    cleanup()

    // removeEventListener called once per listener registered
    expect(removeSpy.mock.calls.length).toBe(addCalls)
    warnSpy.mockRestore()
  })
})
