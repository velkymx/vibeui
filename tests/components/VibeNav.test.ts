import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeNav from '../../src/components/VibeNav.vue'
import * as bootstrap from 'bootstrap'

describe('VibeNav', () => {
  const mockItems = [
    { text: 'Link 1', href: '#pane1' },
    { text: 'Link 2', href: '#pane2' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems
      }
    })

    expect(wrapper.find('.nav').exists()).toBe(true)
    expect(wrapper.findAll('.nav-link')).toHaveLength(2)
  })

  it('renders custom item content via the #item slot (scope: item, index)', () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems },
      slots: {
        item: '<template #item="{ item, index }"><span class="custom-item">{{ index }}:{{ item.text }}</span></template>'
      }
    })
    const custom = wrapper.findAll('.custom-item')
    expect(custom).toHaveLength(2)
    expect(custom[0].text()).toBe('0:Link 1')
    expect(custom[1].text()).toBe('1:Link 2')
  })

  it('initializes bootstrap tab for nav links with href starting with #', async () => {
    mount(VibeNav, {
      props: {
        items: mockItems,
        tabs: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Both items have #href, so both should be initialized as tabs
    expect(bootstrap.Tab).toHaveBeenCalledTimes(2)
  })

  it('does not initialize bootstrap tab for external links', async () => {
    mount(VibeNav, {
      props: {
        items: [
          { text: 'External', href: 'https://google.com' }
        ],
        tabs: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Tab).not.toHaveBeenCalled()
  })

  it('applies nav-underline class', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems,
        underline: true
      }
    })

    expect(wrapper.find('.nav').classes()).toContain('nav-underline')
  })

  it('initializes bootstrap tab for router-link items with target field', async () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: [
          { text: 'Route Tab', to: '/some-route', target: '#pane1' }
        ],
        tabs: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Tab).toHaveBeenCalledTimes(1)

    const link = wrapper.find('.nav-link')
    expect(link.attributes('data-bs-toggle')).toBe('tab')
    expect(link.attributes('data-bs-target')).toBe('#pane1')
  })

  it('initializes bootstrap tab for items with to starting with #', async () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: [
          { text: 'Hash Tab', to: '#pane1' }
        ],
        tabs: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Tab).toHaveBeenCalledTimes(1)

    const link = wrapper.find('.nav-link')
    expect(link.attributes('data-bs-toggle')).toBe('tab')
    expect(link.attributes('data-bs-target')).toBe('#pane1')
  })

  it('disposes old Tab instances when items change', async () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems, tabs: true }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const firstCallCount = vi.mocked(bootstrap.Tab).mock.results.length
    const firstInstances = vi.mocked(bootstrap.Tab).mock.results.slice(0, firstCallCount).map(r => r.value)

    await wrapper.setProps({ items: [
      { text: 'New 1', href: '#newpane1' },
      { text: 'New 2', href: '#newpane2' }
    ]})
    await new Promise(resolve => setTimeout(resolve, 0))

    // Old instances should have been disposed when items changed
    firstInstances.forEach(instance => {
      expect(instance.dispose).toHaveBeenCalled()
    })
  })

  it('cleans up Tab instances on unmount', async () => {
    const wrapper = mount(VibeNav, {
      props: { items: [{ text: 'Tab 1', href: '#t1', tabs: true }], tabs: true }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    wrapper.unmount()
    vi.mocked(bootstrap.Tab).mock.results.forEach(r => {
      expect(r.value.dispose).toHaveBeenCalled()
    })
  })

  // Regression: VibeNav had no initInFlight guard and no isUnmounted flag.
  // Bootstrap Tab constructor must not run after unmount.
  it('does not construct Tab instances after component unmounts during async init', async () => {
    const wrapper = mount(VibeNav, {
      props: { items: [{ text: 'Tab 1', href: '#t1' }], tabs: true }
    })

    wrapper.unmount()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Tab).not.toHaveBeenCalled()
  })

  // Security: safeHref must strip javascript: URLs from nav item links.
  it('strips javascript: URL from nav item href', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: [{ text: 'XSS', href: 'javascript:alert(1)' }]
      }
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(false)
  })

  it('preserves safe https:// href on nav item', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: [{ text: 'Safe', href: 'https://example.com' }]
      }
    })
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })
})
