import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from 'vue'
import VibeUI from '../../src/index'
import { initColorModeEager, _resetColorMode } from '../../src/composables/useColorMode'

// #132: the module import has no DOM side effect. The eager apply (data-bs-theme +
// OS theme listener) runs from initColorModeEager(), which the VibeUI plugin
// install() calls, so FOUC prevention still happens during app.use() before mount.

describe('useColorMode eager init (#132)', () => {
  beforeEach(() => {
    _resetColorMode()
    document.documentElement.removeAttribute('data-bs-theme')
  })

  it('initColorModeEager applies data-bs-theme and is idempotent', () => {
    initColorModeEager()
    const applied = document.documentElement.getAttribute('data-bs-theme')
    expect(applied === 'light' || applied === 'dark').toBe(true)
    // Second call is a no-op (does not throw, attribute stays).
    initColorModeEager()
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe(applied)
  })

  it('the VibeUI plugin install applies the color mode', () => {
    expect(document.documentElement.getAttribute('data-bs-theme')).toBeNull()
    const app = createApp({ render: () => null })
    app.use(VibeUI)
    app.mount(document.createElement('div'))
    const applied = document.documentElement.getAttribute('data-bs-theme')
    expect(applied === 'light' || applied === 'dark').toBe(true)
    app.unmount()
  })
})
