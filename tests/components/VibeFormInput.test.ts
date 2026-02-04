import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormInput from '../../src/components/VibeFormInput.vue'

describe('VibeFormInput', () => {
  it('renders input with correct structure', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'test-input'
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('.form-control').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'email',
        label: 'Email Address'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Email Address')
    expect(label.attributes('for')).toBe('email')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'name',
        label: 'Name',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets input type', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'password',
        type: 'password'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('sets placeholder', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'email',
        placeholder: 'Enter your email'
      }
    })

    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your email')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'disabled-input',
        disabled: true
      }
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('sets readonly attribute', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'readonly-input',
        readonly: true
      }
    })

    expect(wrapper.find('input').attributes('readonly')).toBeDefined()
  })

  it('applies size class', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'large-input',
        size: 'lg'
      }
    })

    expect(wrapper.find('input').classes()).toContain('form-control-lg')
  })

  it('applies plaintext class', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'plaintext-input',
        plaintext: true
      }
    })

    expect(wrapper.find('input').classes()).toContain('form-control-plaintext')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormInput, {
      props: {
        id: 'valid-input',
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('input').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormInput, {
      props: {
        id: 'invalid-input',
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('input').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'email',
        helpText: 'We will never share your email'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('We will never share your email')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'input',
        validationState: 'invalid',
        validationMessage: 'This field is required'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('This field is required')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'input',
        modelValue: ''
      }
    })

    await wrapper.find('input').setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe('test value')
  })

  it('emits input event', async () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'input'
      }
    })

    await wrapper.find('input').trigger('input')

    expect(wrapper.emitted('input')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'input'
      }
    })

    await wrapper.find('input').trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('emits focus event', async () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        id: 'input'
      }
    })

    await wrapper.find('input').trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })
})
