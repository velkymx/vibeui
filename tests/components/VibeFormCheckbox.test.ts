import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormCheckbox from '../../src/components/VibeFormCheckbox.vue'

describe('VibeFormCheckbox', () => {
  it('renders checkbox with correct structure', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'test-checkbox'
      }
    })

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('.form-check').exists()).toBe(true)
    expect(wrapper.find('.form-check-input').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'agree',
        label: 'I agree to terms'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('I agree to terms')
    expect(label.attributes('for')).toBe('agree')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'agree',
        label: 'Agree',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        disabled: true
      }
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('sets indeterminate property', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        indeterminate: true
      }
    })

    // indeterminate is a DOM property, not an HTML attribute
    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.indeterminate).toBe(true)
  })

  it('applies inline class', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        inline: true
      }
    })

    expect(wrapper.find('.form-check').classes()).toContain('form-check-inline')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('input').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('input').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        helpText: 'Check this box'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Check this box')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        validationState: 'invalid',
        validationMessage: 'You must check this box'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('You must check this box')
  })

  it('handles boolean model value', async () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        modelValue: false
      }
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe(true)
  })

  it('handles array model value', async () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        modelValue: [],
        value: 'option1'
      }
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toEqual(['option1'])
  })

  it('adds value to array when checked', async () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        modelValue: ['option2'],
        value: 'option1'
      }
    })

    await wrapper.find('input').setValue(true)

    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toEqual(['option2', 'option1'])
  })

  it('removes value from array when unchecked', async () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox',
        modelValue: ['option1', 'option2'],
        value: 'option1'
      }
    })

    const input = wrapper.find('input')
    await input.setValue(false)

    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toEqual(['option2'])
  })

  it('emits change event', async () => {
    const wrapper = mount(VibeFormCheckbox, {
      props: {
        id: 'checkbox'
      }
    })

    await wrapper.find('input').trigger('change')

    expect(wrapper.emitted('change')).toBeTruthy()
  })
})
