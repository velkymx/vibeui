import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCollapse from '../../src/components/VibeCollapse.vue'
import * as bootstrap from 'bootstrap'

describe('VibeCollapse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeCollapse, {
      props: {
        id: 'test-collapse'
      },
      slots: {
        default: 'Content'
      }
    })

    expect(wrapper.find('.collapse').exists()).toBe(true)
    expect(wrapper.text()).toBe('Content')
  })

  it('initializes bootstrap collapse on mount', async () => {
    mount(VibeCollapse, {
      props: {
        id: 'test-collapse'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Collapse).toHaveBeenCalled()
  })

  it('shows when modelValue is true on mount', async () => {
    mount(VibeCollapse, {
      props: {
        id: 'test-collapse',
        modelValue: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Collapse).mock.results[0].value
    expect(mockInstance.show).toHaveBeenCalled()
  })

  it('toggles when modelValue changes', async () => {
    const wrapper = mount(VibeCollapse, {
      props: {
        id: 'test-collapse',
        modelValue: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Collapse).mock.results[0].value

    await wrapper.setProps({ modelValue: true })
    expect(mockInstance.show).toHaveBeenCalled()

    // Simulate show event
    wrapper.find('.collapse').element.dispatchEvent(new Event('show.bs.collapse'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })
})
