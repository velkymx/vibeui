import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeAlert from '../../src/components/VibeAlert.vue'
import * as bootstrap from 'bootstrap'

describe('VibeAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Success alert',
        variant: 'success'
      }
    })

    expect(wrapper.find('.alert-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Success alert')
  })

  it('initializes bootstrap alert on mount', async () => {
    mount(VibeAlert, {
      props: {
        message: 'Test'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Alert).toHaveBeenCalled()
  })

  it('closes via bootstrap instance when modelValue changes to false', async () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test',
        modelValue: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Alert).mock.results[0].value

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.close).toHaveBeenCalled()
  })

  it('removes element from DOM when closed event fires', async () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Simulate Bootstrap's 'closed.bs.alert' event
    await wrapper.find('.alert').element.dispatchEvent(new Event('closed.bs.alert'))
    
    expect(wrapper.find('.alert').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
