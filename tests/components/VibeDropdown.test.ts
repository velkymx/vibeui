import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDropdown from '../../src/components/VibeDropdown.vue'
import * as bootstrap from 'bootstrap'
import type { DropdownItem } from '../../src/types'

describe('VibeDropdown', () => {
  const mockItems: DropdownItem[] = [
    { text: 'Action 1', href: '#action1' },
    { text: 'Action 2', href: '#action2', active: true }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Dropdown Menu',
        items: mockItems
      }
    })

    expect(wrapper.find('.dropdown').exists()).toBe(true)
    expect(wrapper.find('.dropdown-toggle').text()).toContain('Dropdown Menu')
  })

  it('initializes bootstrap dropdown on mount', async () => {
    mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Dropdown).toHaveBeenCalled()
  })

  it('provides programmatic control via expose', async () => {
    const wrapper = mount(VibeDropdown, {
      props: {
        id: 'test-dropdown',
        text: 'Menu',
        items: mockItems
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Dropdown).mock.results[0].value

    wrapper.vm.show()
    expect(mockInstance.show).toHaveBeenCalled()

    wrapper.vm.hide()
    expect(mockInstance.hide).toHaveBeenCalled()

    wrapper.vm.toggle()
    expect(mockInstance.toggle).toHaveBeenCalled()
  })
})
