import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useColorMode, _resetColorMode } from '../../src/composables/useColorMode'

describe('useColorMode', () => {
  beforeEach(() => {
    _resetColorMode()
  })

  // --- defaults ---

  it('defaults to auto mode', () => {
    const { colorMode } = useColorMode()
    expect(colorMode.value).toBe('auto')
  })

  it('_resetColorMode syncs data-bs-theme to auto', () => {
    const { setColorMode } = useColorMode()
    setColorMode('dark')
    _resetColorMode()
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
  })

  // --- setColorMode ---

  it('updates the reactive ref', () => {
    const { colorMode, setColorMode } = useColorMode()
    setColorMode('dark')
    expect(colorMode.value).toBe('dark')
  })

  it('applies data-bs-theme to <html>', () => {
    const { setColorMode } = useColorMode()
    setColorMode('dark')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
  })

  it('persists to localStorage', () => {
    const { setColorMode } = useColorMode()
    setColorMode('light')
    expect(localStorage.getItem('vibe-color-mode')).toBe('light')
  })

  it('overwrites previous localStorage value', () => {
    const { setColorMode } = useColorMode()
    setColorMode('light')
    setColorMode('dark')
    expect(localStorage.getItem('vibe-color-mode')).toBe('dark')
  })

  it('ignores invalid mode values at runtime', () => {
    const { colorMode, setColorMode } = useColorMode()
    setColorMode('light')
    // @ts-expect-error intentional invalid input
    setColorMode('invalid')
    expect(colorMode.value).toBe('light')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
  })

  // --- toggleColorMode ---

  it('cycles light → dark → auto → light', () => {
    const { colorMode, setColorMode, toggleColorMode } = useColorMode()

    setColorMode('light')
    toggleColorMode()
    expect(colorMode.value).toBe('dark')

    toggleColorMode()
    expect(colorMode.value).toBe('auto')

    toggleColorMode()
    expect(colorMode.value).toBe('light')
  })

  it('falls back to auto if colorMode ref is somehow corrupted', () => {
    const { colorMode, toggleColorMode } = useColorMode()
    // @ts-expect-error simulating corrupted state
    colorMode.value = 'corrupted'
    toggleColorMode()
    expect(colorMode.value).toBe('auto')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
  })

  // --- initColorMode ---

  it('restores saved preference from localStorage', () => {
    localStorage.setItem('vibe-color-mode', 'dark')
    const { colorMode, initColorMode } = useColorMode()
    initColorMode()
    expect(colorMode.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
  })

  it('defaults to auto when nothing is stored', () => {
    const { colorMode, initColorMode } = useColorMode()
    initColorMode()
    expect(colorMode.value).toBe('auto')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
  })

  it('ignores invalid stored values', () => {
    localStorage.setItem('vibe-color-mode', 'invalid-value')
    const { colorMode, initColorMode } = useColorMode()
    initColorMode()
    expect(colorMode.value).toBe('auto')
  })

  it('second call is a no-op regardless of localStorage state', () => {
    const { colorMode, setColorMode, initColorMode } = useColorMode()
    initColorMode()
    setColorMode('dark')
    initColorMode()
    expect(colorMode.value).toBe('dark')
  })

  // --- clearColorMode ---

  it('resets mode to auto and removes localStorage entry', () => {
    const { colorMode, setColorMode, clearColorMode } = useColorMode()
    setColorMode('dark')
    clearColorMode()
    expect(colorMode.value).toBe('auto')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
    expect(localStorage.getItem('vibe-color-mode')).toBeNull()
  })

  // Regression: clearColorMode detached system listener but never re-attached it.
  // After clear, OS theme changes must still update data-bs-theme when mode is auto.
  it('re-attaches system theme listener after clearColorMode so auto mode stays reactive', () => {
    const listeners: Array<(e: { matches: boolean }) => void> = []
    const mockMql = {
      matches: false,
      addEventListener: vi.fn((_: string, fn: (e: { matches: boolean }) => void) => {
        listeners.push(fn)
      }),
      removeEventListener: vi.fn((_: string, fn: unknown) => {
        const idx = listeners.indexOf(fn as (e: { matches: boolean }) => void)
        if (idx !== -1) listeners.splice(idx, 1)
      })
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMql as unknown as MediaQueryList)

    const { clearColorMode } = useColorMode()
    clearColorMode()

    // After clearColorMode, a listener must be registered for auto-mode reactivity
    expect(mockMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(listeners.length).toBeGreaterThan(0)

    // Simulate OS switching to dark — data-bs-theme must update
    mockMql.matches = true
    listeners.forEach(fn => fn({ matches: true }))
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')

    vi.restoreAllMocks()
  })

  it('allows initColorMode to run again after clearColorMode', () => {
    const { colorMode, initColorMode, clearColorMode } = useColorMode()
    initColorMode()
    clearColorMode()
    localStorage.setItem('vibe-color-mode', 'light')
    initColorMode()
    expect(colorMode.value).toBe('light')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
  })

  it('still resets ref and DOM even if localStorage.removeItem throws', () => {
    const { colorMode, setColorMode, clearColorMode } = useColorMode()
    setColorMode('dark')
    vi.spyOn(localStorage, 'removeItem').mockImplementationOnce(() => {
      throw new Error('storage error')
    })
    expect(() => clearColorMode()).not.toThrow()
    expect(colorMode.value).toBe('auto')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
  })

  // --- SSR guard ---

  it('does not write DOM or localStorage when both are undefined', () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('localStorage', undefined)
    try {
      const { colorMode, setColorMode } = useColorMode()
      expect(() => setColorMode('dark')).not.toThrow()
      // Reactive ref still updates — SSR can read current mode
      expect(colorMode.value).toBe('dark')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
