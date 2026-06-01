import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormTextarea from '../../src/components/VibeFormTextarea.vue'

describe('VibeFormTextarea', () => {
  it('renders textarea with correct structure', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'test-textarea'
      }
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('.form-control').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        label: 'Your Comment'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Your Comment')
    expect(label.attributes('for')).toBe('comment')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        label: 'Comment',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets placeholder', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        placeholder: 'Enter your comment'
      }
    })

    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Enter your comment')
  })

  it('sets rows attribute', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        rows: 5
      }
    })

    expect(wrapper.find('textarea').attributes('rows')).toBe('5')
  })

  it('sets default rows to 3', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment'
      }
    })

    expect(wrapper.find('textarea').attributes('rows')).toBe('3')
  })

  it('sets maxlength attribute', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        maxlength: 100
      }
    })

    expect(wrapper.find('textarea').attributes('maxlength')).toBe('100')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        disabled: true
      }
    })

    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })

  it('sets readonly attribute', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        readonly: true
      }
    })

    expect(wrapper.find('textarea').attributes('readonly')).toBeDefined()
  })

  it('applies size class', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        size: 'lg'
      }
    })

    expect(wrapper.find('textarea').classes()).toContain('form-control-lg')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('textarea').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('textarea').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        helpText: 'Maximum 500 characters'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Maximum 500 characters')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        validationState: 'invalid',
        validationMessage: 'This field is required'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('This field is required')
  })

  it('shows character count when enabled', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        modelValue: 'Hello',
        showCharCount: true
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('5')
  })

  it('shows character count with maxlength', () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        modelValue: 'Hello World',
        maxlength: 100,
        showCharCount: true
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('11 / 100')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment',
        modelValue: ''
      }
    })

    await wrapper.find('textarea').setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe('test value')
  })

  it('emits blur event', async () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment'
      }
    })

    await wrapper.find('textarea').trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('emits focus event', async () => {
    const wrapper = mount(VibeFormTextarea, {
      props: {
        id: 'comment'
      }
    })

    await wrapper.find('textarea').trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  // Regression: computed refs auto-unwrap in templates — helpId.value / feedbackId.value
  // double-dereferences to undefined, producing aria-describedby="undefined undefined"
  describe('aria-describedby correctness', () => {
    it('contains real ID, not "undefined", when helpText present', () => {
      const wrapper = mount(VibeFormTextarea, {
        props: { id: 'txt', helpText: 'Max 500 chars' }
      })
      const describedBy = wrapper.find('textarea').attributes('aria-describedby')
      expect(describedBy).toBe('txt-help')
      expect(describedBy).not.toContain('undefined')
    })

    it('contains real ID, not "undefined", when validationMessage present', () => {
      const wrapper = mount(VibeFormTextarea, {
        props: { id: 'txt', validationState: 'invalid' as const, validationMessage: 'Required' }
      })
      const describedBy = wrapper.find('textarea').attributes('aria-describedby')
      expect(describedBy).toBe('txt-feedback')
      expect(describedBy).not.toContain('undefined')
    })

    it('lists both IDs when helpText and validationMessage both present', () => {
      const wrapper = mount(VibeFormTextarea, {
        props: { id: 'txt', helpText: 'Help', validationState: 'invalid' as const, validationMessage: 'Required' }
      })
      const describedBy = wrapper.find('textarea').attributes('aria-describedby')
      expect(describedBy).toBe('txt-help txt-feedback')
      expect(describedBy).not.toContain('undefined')
    })
  })
})
