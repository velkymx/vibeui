import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormDatepicker from '../../src/components/VibeFormDatepicker.vue'

describe('VibeFormDatepicker', () => {
  it('renders datepicker with correct structure', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'test-datepicker'
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('.form-control').exists()).toBe(true)
  })

  it('renders as date input by default', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'datepicker'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('date')
  })

  it('renders as time input', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'timepicker',
        type: 'time'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('time')
  })

  it('renders as datetime-local input', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'datetimepicker',
        type: 'datetime-local'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('datetime-local')
  })

  it('renders as month input', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'monthpicker',
        type: 'month'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('month')
  })

  it('renders as week input', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'weekpicker',
        type: 'week'
      }
    })

    expect(wrapper.find('input').attributes('type')).toBe('week')
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'birthdate',
        label: 'Birth Date'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Birth Date')
    expect(label.attributes('for')).toBe('birthdate')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        label: 'Date',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets min and max attributes', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        min: '2024-01-01',
        max: '2024-12-31'
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('2024-01-01')
    expect(input.attributes('max')).toBe('2024-12-31')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        disabled: true
      }
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('sets readonly attribute', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        readonly: true
      }
    })

    expect(wrapper.find('input').attributes('readonly')).toBeDefined()
  })

  it('applies size class', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        size: 'lg'
      }
    })

    expect(wrapper.find('input').classes()).toContain('form-control-lg')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('input').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('input').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        helpText: 'Select a date'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Select a date')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        validationState: 'invalid',
        validationMessage: 'Please select a valid date'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('Please select a valid date')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date',
        modelValue: ''
      }
    })

    await wrapper.find('input').setValue('2024-12-25')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe('2024-12-25')
  })

  it('emits blur event', async () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date'
      }
    })

    await wrapper.find('input').trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('emits focus event', async () => {
    const wrapper = mount(VibeFormDatepicker, {
      props: {
        id: 'date'
      }
    })

    await wrapper.find('input').trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })
})
