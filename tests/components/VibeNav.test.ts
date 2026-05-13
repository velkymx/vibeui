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
})
