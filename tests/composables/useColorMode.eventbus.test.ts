import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useColorMode, _resetColorMode } from '../../src/composables/useColorMode'
import { emitThemeSet, onThemeChanged } from '../../src/composables/eventHelpers'

// Note: the bus is NOT reset here. useColorMode registers its theme:set handler
// once at module load; clearing bus handlers would remove it. Mode state is
// reset via _resetColorMode, and each test unsubscribes its own listener.
describe('theme channel over the event bus (#99)', () => {
  beforeEach(() => {
    _resetColorMode()
  })

  it('publishes theme:changed with the resolved theme when the mode changes', () => {
    const onChanged = vi.fn()
    const off = onThemeChanged(onChanged)
    useColorMode().setColorMode('dark')
    off()
    expect(onChanged).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('does not fire theme:changed when the resolved theme is unchanged', () => {
    useColorMode().setColorMode('light')
    const onChanged = vi.fn()
    const off = onThemeChanged(onChanged)
    useColorMode().setColorMode('light')
    off()
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('theme:set command changes the color mode', () => {
    emitThemeSet({ theme: 'dark' })
    expect(useColorMode().colorMode.value).toBe('dark')
    expect(useColorMode().resolvedMode.value).toBe('dark')
  })

  it('theme:set also results in a theme:changed lifecycle event', () => {
    useColorMode().setColorMode('light')
    const onChanged = vi.fn()
    const off = onThemeChanged(onChanged)
    emitThemeSet({ theme: 'dark' })
    off()
    expect(onChanged).toHaveBeenCalledWith({ theme: 'dark' })
  })
})
