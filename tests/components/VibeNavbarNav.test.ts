import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeNavbarNav from '../../src/components/VibeNavbarNav.vue'
import * as bootstrap from 'bootstrap'

describe('VibeNavbarNav', () => {
  const itemsWithDropdown = [
    {
      text: 'Products',
      children: [
        { text: 'Item 1', href: '/item1' },
        { text: 'Item 2', href: '/item2' }
      ]
    },
    { text: 'About', href: '/about' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navbar nav items', () => {
    const wrapper = mount(VibeNavbarNav, {
      props: { items: itemsWithDropdown }
    })
    expect(wrapper.find('.navbar-nav').exists()).toBe(true)
    expect(wrapper.findAll('.nav-item')).toHaveLength(2)
  })

  it('renders dropdown toggle for items with children', () => {
    const wrapper = mount(VibeNavbarNav, {
      props: { items: itemsWithDropdown }
    })
    expect(wrapper.find('[data-bs-toggle="dropdown"]').exists()).toBe(true)
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
  })

  it('initializes Bootstrap Dropdown for items with children', async () => {
    mount(VibeNavbarNav, {
      props: { items: itemsWithDropdown }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Dropdown).toHaveBeenCalled()
  })

  it('re-initializes dropdowns when the items array is replaced (idiomatic update)', async () => {
    const wrapper = mount(VibeNavbarNav, {
      props: { items: [{ text: 'Home', href: '/' }] }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    vi.clearAllMocks()

    // Replace the array with one that now contains a dropdown — identity change must
    // trigger the watcher even with deep: false.
    await wrapper.setProps({ items: itemsWithDropdown })
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Dropdown).toHaveBeenCalled()
    expect(wrapper.find('[data-bs-toggle="dropdown"]').exists()).toBe(true)
  })

  // Security: item and dropdown-child hrefs are sanitized with the same rules as
  // every other link-bearing component.
  describe('href sanitization', () => {
    it('strips a javascript: URL from an item href', () => {
      const wrapper = mount(VibeNavbarNav, {
        props: { items: [{ text: 'XSS', href: 'javascript:alert(1)' }] }
      })

      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.html()).not.toContain('javascript:alert(1)')
    })

    it('strips a protocol-relative URL from an item href', () => {
      const wrapper = mount(VibeNavbarNav, {
        props: { items: [{ text: 'XSS', href: '//evil.example.com' }] }
      })

      expect(wrapper.find('a').exists()).toBe(false)
    })

    it('preserves a safe item href', () => {
      const wrapper = mount(VibeNavbarNav, {
        props: { items: [{ text: 'Safe', href: 'https://example.com' }] }
      })

      expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    })

    it('strips a javascript: URL from a dropdown child href', () => {
      const wrapper = mount(VibeNavbarNav, {
        props: {
          items: [{ text: 'Menu', children: [{ text: 'XSS', href: 'javascript:alert(1)' }] }]
        }
      })

      expect(wrapper.find('.dropdown-item').element.tagName).not.toBe('A')
      expect(wrapper.html()).not.toContain('javascript:alert(1)')
    })
  })
})
