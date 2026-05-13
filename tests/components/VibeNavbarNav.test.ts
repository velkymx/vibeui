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
})
