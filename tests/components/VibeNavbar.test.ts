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

describe('VibeNavbar follows page color mode by default (issue #72)', () => {
  it('a navbar with no variant does not pin data-bs-theme (inherits the page)', () => {
    const w = mount(VibeNavbar)
    expect(w.attributes('data-bs-theme')).toBeUndefined()
    expect(w.classes().some(c => c.startsWith('bg-'))).toBe(false)
  })
  it('an explicit variant still pins a contrast-correct theme', () => {
    const w = mount(VibeNavbar, { props: { variant: 'primary' } })
    expect(w.attributes('data-bs-theme')).toBe('dark')
    expect(w.classes()).toContain('bg-primary')
  })
})
