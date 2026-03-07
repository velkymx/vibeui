import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useColorMode, _resetColorMode } from '../../src/composables/useColorMode'

describe('useColorMode', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetColorMode()
  })

  // --- defaults ---

  it('defaults to auto mode', () => {
    const { colorMode } = useColorMode()
    expect(colorMode.value).toBe('auto')
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
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('auto')
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

  // --- SSR guard ---

  it('is a no-op when document is undefined', () => {
    vi.stubGlobal('document', undefined)
    try {
      const { setColorMode } = useColorMode()
      expect(() => setColorMode('dark')).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
