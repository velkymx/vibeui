import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormRadio from '../../src/components/VibeFormRadio.vue'

describe('VibeFormRadio', () => {
  it('renders radio with correct structure', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'test-radio',
        name: 'test-group',
        value: 'option1'
      }
    })

    expect(wrapper.find('input[type="radio"]').exists()).toBe(true)
    expect(wrapper.find('.form-check').exists()).toBe(true)
    expect(wrapper.find('.form-check-input').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        label: 'Option 1'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Option 1')
    expect(label.attributes('for')).toBe('radio1')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        label: 'Option',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets name attribute', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'color-choice',
        value: 'red'
      }
    })

    expect(wrapper.find('input').attributes('name')).toBe('color-choice')
  })

  it('sets value attribute', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1'
      }
    })

    expect(wrapper.find('input').attributes('value')).toBe('option1')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        disabled: true
      }
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('applies inline class', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        inline: true
      }
    })

    expect(wrapper.find('.form-check').classes()).toContain('form-check-inline')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('input').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio2',
        name: 'group',
        value: 'option2',
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('input').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        helpText: 'Select this option'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Select this option')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        validationState: 'invalid',
        validationMessage: 'Please select an option'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('Please select an option')
  })

  it('is checked when modelValue matches value', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        modelValue: 'option1'
      }
    })

    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('is not checked when modelValue does not match', () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        modelValue: 'option2'
      }
    })

    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(false)
  })

  it('emits update:modelValue with value when checked', async () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1',
        modelValue: undefined
      }
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe('option1')
  })

  it('emits change event', async () => {
    const wrapper = mount(VibeFormRadio, {
      props: {
        id: 'radio1',
        name: 'group',
        value: 'option1'
      }
    })

    await wrapper.find('input').trigger('change')

    expect(wrapper.emitted('change')).toBeTruthy()
  })
})
