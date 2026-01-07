import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDropdown from '../../src/components/VibeDropdown.vue'
import type { DropdownItem } from '../../src/types'

describe('VibeDropdown', () => {
  const mockItems: DropdownItem[] = [
    { text: 'Action 1', href: '#action1' },
    { text: 'Action 2', href: '#action2', active: true },
    { divider: true },
    { text: 'Header 1', header: true },
    { text: 'Action 3', href: '#action3', disabled: true }
  ]

  it('renders dropdown with correct structure', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Dropdown Menu',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown').exists()).toBe(true)
    expect(wrapper.find('.dropdown-toggle').exists()).toBe(true)
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
  })

  it('renders button with correct text', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Custom Text',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown-toggle').text()).toContain('Custom Text')
  })

  it('applies variant class to button', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        variant: 'danger',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown-toggle').classes()).toContain('btn-danger')
  })

  it('applies size class to button', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        size: 'lg',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown-toggle').classes()).toContain('btn-lg')
  })

  it('renders dropdown items correctly', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    expect(wrapper.findAll('.dropdown-item')).toHaveLength(3) // Excludes divider and header
  })

  it('renders divider correctly', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown-divider').exists()).toBe(true)
  })

  it('renders header correctly', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown-header').exists()).toBe(true)
    expect(wrapper.find('.dropdown-header').text()).toBe('Header 1')
  })

  it('marks active item correctly', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    const items = wrapper.findAll('.dropdown-item')
    expect(items[1].classes()).toContain('active')
  })

  it('marks disabled item correctly', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    const items = wrapper.findAll('.dropdown-item')
    expect(items[2].classes()).toContain('disabled')
  })

  it('applies direction class', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        direction: 'up',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropup').exists()).toBe(true)
  })

  it('applies menuEnd class', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        menuEnd: true,
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown-menu').classes()).toContain('dropdown-menu-end')
  })

  it('emits item-click event when item is clicked', async () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    await wrapper.findAll('.dropdown-item')[0].trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
  })

  it('does not emit item-click for disabled items', async () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    const disabledItem = wrapper.findAll('.dropdown-item')[2]
    await disabledItem.trigger('click')

    // Disabled items should not emit click events
    expect(wrapper.emitted('item-click')).toBeFalsy()
  })
})
