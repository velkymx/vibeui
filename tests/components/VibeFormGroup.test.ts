import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormGroup from '../../src/components/VibeFormGroup.vue'
import VibeFormInput from '../../src/components/VibeFormInput.vue'

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
    // label now also renders the (optional) indicator — check text includes label copy
    expect(label.text()).toContain('Email')
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

  // Issue 4 — WCAG 1.3.1 / 4.1.2: label for must equal input id (auto-linked via provide/inject)
  it('label for matches nested VibeFormInput id when no labelFor prop is given', () => {
    const wrapper = mount({
      components: { VibeFormGroup, VibeFormInput },
      template: '<VibeFormGroup label="Email"><VibeFormInput v-model="v" /></VibeFormGroup>',
      data() { return { v: '' } }
    })

    const labelFor = wrapper.find('label').attributes('for')
    const inputId = wrapper.find('input').attributes('id')

    expect(labelFor).toBeTruthy()
    expect(inputId).toBeTruthy()
    expect(labelFor).toBe(inputId)
  })

  it('multiple VibeFormGroup instances have unique ids', () => {
    const wrapper = mount({
      components: { VibeFormGroup, VibeFormInput },
      template: `
        <div>
          <VibeFormGroup label="Email"><VibeFormInput v-model="a" /></VibeFormGroup>
          <VibeFormGroup label="Name"><VibeFormInput v-model="b" /></VibeFormGroup>
        </div>
      `,
      data() { return { a: '', b: '' } }
    })

    const [label1, label2] = wrapper.findAll('label')
    expect(label1.attributes('for')).not.toBe(label2.attributes('for'))
  })

  // Issue 6 — WCAG 3.3.2: required/optional indicator visible to sighted and SR users
  it('renders (optional) indicator when label is present and required is false (default)', () => {
    const wrapper = mount(VibeFormGroup, {
      props: { label: 'Comment' }
    })

    const optional = wrapper.find('.text-muted')
    expect(optional.exists()).toBe(true)
    expect(optional.text()).toBe('(optional)')
    expect(optional.attributes('aria-hidden')).toBe('true')
  })

  it('renders visually-hidden "required" text for screen readers when required is true', () => {
    const wrapper = mount(VibeFormGroup, {
      props: { label: 'Email', required: true }
    })

    expect(wrapper.find('.visually-hidden').text()).toBe('required')
    expect(wrapper.find('.text-danger').attributes('aria-hidden')).toBe('true')
  })

  it('does not render indicator when there is no label', () => {
    const wrapper = mount(VibeFormGroup)

    expect(wrapper.find('.text-muted').exists()).toBe(false)
    expect(wrapper.find('.visually-hidden').exists()).toBe(false)
  })

  // Issue 7 — WCAG 4.1.3: error region must be a live region (role="alert")
  it('invalid-feedback element has role="alert" for live announcements', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        validationState: 'invalid',
        validationMessage: 'This field is required'
      }
    })

    const feedback = wrapper.find('.invalid-feedback')
    expect(feedback.attributes('role')).toBe('alert')
  })

  it('valid-feedback element does not have role="alert" (no success chatter)', () => {
    const wrapper = mount(VibeFormGroup, {
      props: {
        validationState: 'valid',
        validationMessage: 'Looks good!'
      }
    })

    const feedback = wrapper.find('.valid-feedback')
    expect(feedback.attributes('role')).toBeUndefined()
  })

  // Issue 5 — WCAG 1.3.1 / 3.3.1: aria-describedby must point to group's help/error elements
  it('nested VibeFormInput aria-describedby includes group help text id', () => {
    const wrapper = mount({
      components: { VibeFormGroup, VibeFormInput },
      template: '<VibeFormGroup label="Email" help-text="Never shared"><VibeFormInput v-model="v" /></VibeFormGroup>',
      data() { return { v: '' } }
    })

    const input = wrapper.find('input')
    const helpEl = wrapper.find('.form-text')

    expect(helpEl.exists()).toBe(true)
    expect(helpEl.attributes('id')).toBeTruthy()
    expect(input.attributes('aria-describedby')).toContain(helpEl.attributes('id'))
  })

  it('nested VibeFormInput aria-describedby includes group feedback id when invalid', () => {
    const wrapper = mount({
      components: { VibeFormGroup, VibeFormInput },
      template: '<VibeFormGroup label="Email" validation-state="invalid" validation-message="Required"><VibeFormInput v-model="v" /></VibeFormGroup>',
      data() { return { v: '' } }
    })

    const input = wrapper.find('input')
    const feedbackEl = wrapper.find('.invalid-feedback')

    expect(feedbackEl.exists()).toBe(true)
    expect(feedbackEl.attributes('id')).toBeTruthy()
    expect(input.attributes('aria-describedby')).toContain(feedbackEl.attributes('id'))
  })

  it('nested VibeFormInput aria-describedby includes both help and feedback ids', () => {
    const wrapper = mount({
      components: { VibeFormGroup, VibeFormInput },
      template: '<VibeFormGroup label="Email" help-text="Hint" validation-state="invalid" validation-message="Bad"><VibeFormInput v-model="v" /></VibeFormGroup>',
      data() { return { v: '' } }
    })

    const input = wrapper.find('input')
    const describedBy = input.attributes('aria-describedby') ?? ''
    const helpId = wrapper.find('.form-text').attributes('id')
    const feedbackId = wrapper.find('.invalid-feedback').attributes('id')

    expect(describedBy).toContain(helpId)
    expect(describedBy).toContain(feedbackId)
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

describe('VibeFormGroup hideOptional (issue #74)', () => {
  it('shows "(optional)" by default on a non-required labelled group', () => {
    const wrapper = mount(VibeFormGroup, { props: { label: 'Name' } })
    expect(wrapper.text()).toContain('(optional)')
  })
  it('hides "(optional)" when hideOptional is set', () => {
    const wrapper = mount(VibeFormGroup, { props: { label: 'Name', hideOptional: true } })
    expect(wrapper.text()).not.toContain('(optional)')
  })
})
