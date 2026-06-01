import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeNavbarBrand from '../../src/components/VibeNavbarBrand.vue'

describe('VibeNavbarBrand', () => {
  it('renders as span when no href or to', () => {
    const wrapper = mount(VibeNavbarBrand, { slots: { default: 'Brand' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('navbar-brand')
  })

  it('renders as a when href provided', () => {
    const wrapper = mount(VibeNavbarBrand, {
      props: { href: '/home' }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/home')
  })

  // Security: safeHref must strip javascript: URLs from the brand link.
  it('strips javascript: URL from href — renders span not a', () => {
    const wrapper = mount(VibeNavbarBrand, {
      props: { href: 'javascript:alert(document.cookie)' }
    })
    // safeHref returns undefined → tag falls back to span (no href → not an <a>)
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('preserves safe https:// href', () => {
    const wrapper = mount(VibeNavbarBrand, {
      props: { href: 'https://example.com' }
    })
    expect(wrapper.attributes('href')).toBe('https://example.com')
  })
})
