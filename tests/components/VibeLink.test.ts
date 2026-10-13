import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeLink from '../../src/components/VibeLink.vue'

describe('VibeLink', () => {
  it('renders correctly as <a> by default', () => {
    const wrapper = mount(VibeLink, {
      props: { href: '#' },
      slots: { default: 'Link' }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.text()).toBe('Link')
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeLink, {
      props: { variant: 'primary' }
    })
    expect(wrapper.classes()).toContain('link-primary')
  })

  it('applies link-underline-opacity-0 when underline is false', () => {
    const wrapper = mount(VibeLink, {
      props: { underline: false }
    })
    expect(wrapper.classes()).toContain('link-underline-opacity-0')
  })

  it('applies offset class', () => {
    const wrapper = mount(VibeLink, {
      props: { offset: 2 }
    })
    expect(wrapper.classes()).toContain('link-offset-2')
  })

  it('applies focus-ring class', () => {
    const wrapper = mount(VibeLink, {
      props: { focusRing: true }
    })
    expect(wrapper.classes()).toContain('focus-ring')
  })

  // Security: safeHref must strip javascript: / data: URLs from the rendered href attribute.
  it('strips javascript: URL from href — renders no href attribute', () => {
    const wrapper = mount(VibeLink, {
      props: { href: 'javascript:alert(document.cookie)' }
    })
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('strips data: URL from href', () => {
    const wrapper = mount(VibeLink, {
      props: { href: 'data:text/html,<script>alert(1)</script>' }
    })
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('preserves safe https:// href', () => {
    const wrapper = mount(VibeLink, {
      props: { href: 'https://example.com' }
    })
    expect(wrapper.attributes('href')).toBe('https://example.com')
  })

  // #237 P3: href wins over to (matching linkBindings plus VibeButton);
  // target blank gets automatic noopener.
  describe('href precedence (#237)', () => {
    it('href plus to renders the external anchor, not router-link', () => {
      const wrapper = mount(VibeLink, {
        props: { href: 'https://external.example/x', to: '/internal' },
        slots: { default: 'go' }
      })
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.attributes('href')).toBe('https://external.example/x')
      expect(wrapper.attributes('to')).toBeUndefined()
      wrapper.unmount()
    })

    it('to-only still renders router-link', () => {
      const wrapper = mount(VibeLink, {
        props: { to: '/internal' },
        slots: { default: 'go' }
      })
      expect(wrapper.element.tagName).toBe('ROUTER-LINK')
      wrapper.unmount()
    })

    it('target blank adds noopener unless rel is explicit', () => {
      const wrapper = mount(VibeLink, {
        props: { href: 'https://external.example/x', target: '_blank' },
        slots: { default: 'go' }
      })
      expect(wrapper.attributes('rel')).toBe('noopener')
      wrapper.unmount()
    })

    it('explicit rel wins over the automatic noopener', () => {
      const wrapper = mount(VibeLink, {
        props: { href: 'https://external.example/x', target: '_blank', rel: 'opener' },
        slots: { default: 'go' }
      })
      expect(wrapper.attributes('rel')).toBe('opener')
      wrapper.unmount()
    })
  })
})
