import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeAlert from '../../src/components/VibeAlert.vue'

describe('VibeAlert', () => {
  it('renders alert with correct structure', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Alert message'
      }
    })

    expect(wrapper.find('.alert').exists()).toBe(true)
    expect(wrapper.text()).toContain('Alert message')
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test',
        variant: 'danger'
      }
    })

    expect(wrapper.find('.alert').classes()).toContain('alert-danger')
  })

  it('renders dismissable alert', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test',
        dismissable: true
      }
    })

    expect(wrapper.find('.btn-close').exists()).toBe(true)
  })

  it('emits update:modelValue when dismissed', async () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test',
        dismissable: true,
        modelValue: true
      }
    })

    await wrapper.find('.btn-close').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe(false)
  })

  it('hides when modelValue is false', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test',
        modelValue: false
      }
    })

    expect(wrapper.find('.alert').exists()).toBe(false)
  })

  it('shows when modelValue is true', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Visible alert',
        modelValue: true
      }
    })

    expect(wrapper.find('.alert').exists()).toBe(true)
  })

  it('renders slot content over message prop', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Default message'
      },
      slots: {
        default: 'Custom content'
      }
    })

    expect(wrapper.text()).toContain('Custom content')
  })
})
