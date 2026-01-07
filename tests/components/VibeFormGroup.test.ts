import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormGroup from '../../src/components/VibeFormGroup.vue'

describe('VibeFormGroup', () => {
  it('renders form group with correct structure', () => {
    const wrapper = mount(VibeFormGroup, {
      slots: {
        default: '<input class="form-control" />'
      }
    })

    expect(wrapper.find('.mb-3').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        label: 'Email',
        labelFor: 'email-input'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe('email-input')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        label: 'Name',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').exists()).toBe(true)
    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        labelFor: 'email',
        helpText: 'We will never share your email'
      }
    })

    expect(wrapper.find('.form-text').exists()).toBe(true)
    expect(wrapper.find('.form-text').text()).toBe('We will never share your email')
  })

  it('renders valid feedback', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        validationState: 'valid',
        validationMessage: 'Looks good!'
      }
    })

    expect(wrapper.find('.valid-feedback').exists()).toBe(true)
    expect(wrapper.find('.valid-feedback').text()).toBe('Looks good!')
  })

  it('renders invalid feedback', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        labelFor: 'input',
        validationState: 'invalid',
        validationMessage: 'This field is required'
      }
    })

    expect(wrapper.find('.invalid-feedback').exists()).toBe(true)
    expect(wrapper.find('.invalid-feedback').text()).toBe('This field is required')
    expect(wrapper.find('.invalid-feedback').attributes('id')).toBe('input-feedback')
  })

  it('applies floating label class', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        floating: true,
        label: 'Email'
      }
    })

    expect(wrapper.classes()).toContain('form-floating')
  })

  it('renders label after input in floating mode', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        floating: true,
        label: 'Email',
        labelFor: 'email'
      },
      slots: {
        default: '<input id="email" class="form-control" />'
      }
    })

    // Label should appear after the input slot
    expect(wrapper.html()).toMatch(/<input[\s\S]*<label/)
  })

  it('applies row layout classes', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        row: true
      }
    })

    expect(wrapper.classes()).toContain('row')
    expect(wrapper.classes()).toContain('mb-3')
  })

  it('applies label column classes in row mode', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        row: true,
        label: 'Email',
        labelCols: 3
      }
    })

    const label = wrapper.find('label')
    expect(label.classes()).toContain('col-form-label')
    expect(label.classes()).toContain('col-sm-3')
  })

  it('applies label alignment in row mode', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        row: true,
        label: 'Email',
        labelAlign: 'end'
      }
    })

    const label = wrapper.find('label')
    expect(label.classes()).toContain('text-end')
  })

  it('renders content in column wrapper in row mode', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        row: true,
        labelCols: 3
      },
      slots: {
        default: '<input class="form-control" />'
      }
    })

    const contentDiv = wrapper.find('.col-sm-9')
    expect(contentDiv.exists()).toBe(true)
    expect(contentDiv.html()).toContain('<input class="form-control"')
  })
})
