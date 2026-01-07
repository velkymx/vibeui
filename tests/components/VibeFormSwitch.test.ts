import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormSwitch from '../../src/components/VibeFormSwitch.vue'

describe('VibeFormSwitch', () => {
  it('renders switch with correct structure', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'test-switch'
      }
    })

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('.form-check').exists()).toBe(true)
    expect(wrapper.find('.form-switch').exists()).toBe(true)
    expect(wrapper.find('.form-check-input').exists()).toBe(true)
  })

  it('sets role attribute to switch', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch'
      }
    })

    expect(wrapper.find('input').attributes('role')).toBe('switch')
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'notifications',
        label: 'Enable notifications'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Enable notifications')
    expect(label.attributes('for')).toBe('notifications')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        label: 'Toggle',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        disabled: true
      }
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('input').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('input').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        helpText: 'Toggle to enable feature'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Toggle to enable feature')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        validationState: 'invalid',
        validationMessage: 'You must toggle this switch'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('You must toggle this switch')
  })

  it('is checked when modelValue is true', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        modelValue: true
      }
    })

    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('is not checked when modelValue is false', () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        modelValue: false
      }
    })

    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(false)
  })

  it('emits update:modelValue with boolean when toggled', async () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch',
        modelValue: false
      }
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe(true)
  })

  it('emits change event', async () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch'
      }
    })

    await wrapper.find('input').trigger('change')

    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch'
      }
    })

    await wrapper.find('input').trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('emits focus event', async () => {
    const wrapper = mount(VibeFormSwitch, {
      props: {
        id: 'switch'
      }
    })

    await wrapper.find('input').trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })
})
