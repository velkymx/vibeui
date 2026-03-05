import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeAccordion from '../../src/components/VibeAccordion.vue'
import * as bootstrap from 'bootstrap'

describe('VibeAccordion', () => {
  const mockItems = [
    { id: 'item1', title: 'Title 1', content: 'Content 1' },
    { id: 'item2', title: 'Title 2', content: 'Content 2' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    expect(wrapper.find('.accordion').exists()).toBe(true)
    expect(wrapper.findAll('.accordion-item')).toHaveLength(2)
  })

  it('initializes bootstrap collapse for each item', async () => {
    mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Collapse).toHaveBeenCalledTimes(2)
  })

  it('shows item when show property is true', async () => {
    mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: [
          { id: 'item1', title: 'T1', content: 'C1', show: true },
          { id: 'item2', title: 'T2', content: 'C2', show: false }
        ]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Check first instance (item1)
    const mockInstance1 = vi.mocked(bootstrap.Collapse).mock.results[0].value
    expect(mockInstance1.show).toHaveBeenCalled()
    
    // Check second instance (item2)
    const mockInstance2 = vi.mocked(bootstrap.Collapse).mock.results[1].value
    expect(mockInstance2.show).not.toHaveBeenCalled()
  })
})
