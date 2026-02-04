import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormSelect from '../../src/components/VibeFormSelect.vue'
import type { FormSelectOption } from '../../src/types'

describe('VibeFormSelect', () => {
  const mockOptions: FormSelectOption[] = [
    { text: 'Option 1', value: '1' },
    { text: 'Option 2', value: '2' },
    { text: 'Option 3', value: '3', disabled: true }
  ]

  it('renders select with correct structure', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'test-select',
        options: mockOptions
      }
    })

    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('.form-select').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'country',
        label: 'Select Country',
        options: []
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Select Country')
    expect(label.attributes('for')).toBe('country')
  })

  it('renders options from array', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions
      }
    })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe('Option 1')
    expect(options[0].attributes('value')).toBe('1')
  })

  it('marks disabled options', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions
      }
    })

    const options = wrapper.findAll('option')
    expect(options[2].attributes('disabled')).toBeDefined()
  })

  it('renders placeholder option', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        placeholder: 'Choose an option'
      }
    })

    const options = wrapper.findAll('option')
    expect(options[0].text()).toBe('Choose an option')
    expect(options[0].attributes('value')).toBe('')
    expect(options[0].attributes('disabled')).toBeDefined()
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        disabled: true
      }
    })

    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })

  it('sets multiple attribute', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        multiple: true
      }
    })

    expect(wrapper.find('select').attributes('multiple')).toBeDefined()
  })

  it('sets htmlSize attribute', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        htmlSize: 5
      }
    })

    expect(wrapper.find('select').attributes('size')).toBe('5')
  })

  it('applies size class', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        size: 'lg'
      }
    })

    expect(wrapper.find('select').classes()).toContain('form-select-lg')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('select').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('select').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        helpText: 'Select one option'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Select one option')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        validationState: 'invalid',
        validationMessage: 'This field is required'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('This field is required')
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        modelValue: ''
      }
    })

    await wrapper.find('select').setValue('2')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe('2')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        label: 'Country',
        options: [],
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })
})
