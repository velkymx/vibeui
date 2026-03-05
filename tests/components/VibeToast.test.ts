import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeToast from '../../src/components/VibeToast.vue'
import * as bootstrap from 'bootstrap'

describe('VibeToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeToast, {
      props: {
        title: 'Toast Title',
        teleport: false
      },
      slots: {
        default: 'Toast Body'
      }
    })

    expect(wrapper.find('.toast').exists()).toBe(true)
    expect(wrapper.find('.toast-header').text()).toContain('Toast Title')
    expect(wrapper.find('.toast-body').text()).toBe('Toast Body')
  })

  it('initializes bootstrap toast on mount', async () => {
    mount(VibeToast, {
      props: {
        id: 'test-toast',
        teleport: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Toast).toHaveBeenCalled()
  })

  it('shows when modelValue is true on mount', async () => {
    mount(VibeToast, {
      props: {
        modelValue: true,
        teleport: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Toast).mock.results[0].value
    expect(mockInstance.show).toHaveBeenCalled()
  })

  it('toggles when modelValue changes', async () => {
    const wrapper = mount(VibeToast, {
      props: {
        modelValue: false,
        teleport: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Toast).mock.results[0].value

    await wrapper.setProps({ modelValue: true })
    expect(mockInstance.show).toHaveBeenCalled()

    // Simulate show event
    wrapper.find('.toast').element.dispatchEvent(new Event('show.bs.toast'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })
})
