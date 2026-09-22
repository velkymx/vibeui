import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeNavbar from '../../src/components/VibeNavbar.vue'

describe('VibeNavbar data-bs-theme derivation', () => {
  it('dark variants derive data-bs-theme="dark" for readable text', () => {
    for (const v of ['primary', 'secondary', 'success', 'danger', 'dark'] as const) {
      const w = mount(VibeNavbar, { props: { variant: v } })
      expect(w.attributes('data-bs-theme')).toBe('dark')
    }
  })

  it('light variants derive data-bs-theme="light"', () => {
    for (const v of ['light', 'info', 'warning'] as const) {
      const w = mount(VibeNavbar, { props: { variant: v } })
      expect(w.attributes('data-bs-theme')).toBe('light')
    }
  })

  it('an explicit theme prop overrides the derived value', () => {
    const w = mount(VibeNavbar, { props: { variant: 'primary', theme: 'light' } })
    expect(w.attributes('data-bs-theme')).toBe('light')
  })
})
