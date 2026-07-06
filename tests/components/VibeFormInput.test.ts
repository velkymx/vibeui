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

  // CR7 follow-up: standalone label must show (optional) for non-required fields,
  // matching VibeFormGroup's WCAG 3.3.2 pattern (both signals, not just required).
  it('shows (optional) indicator when label is present and field is not required', () => {
    const wrapper = mount(VibeFormInput, {
      props: { id: 'email', label: 'Email' }
    })
    expect(wrapper.find('.text-muted').text()).toContain('(optional)')
  })

  it('required asterisk is aria-hidden and paired with visually-hidden "required" text', () => {
    const wrapper = mount(VibeFormInput, {
      props: { id: 'email', label: 'Email', required: true }
    })
    const asterisk = wrapper.find('.text-danger')
    expect(asterisk.attributes('aria-hidden')).toBe('true')
    const hidden = wrapper.find('.visually-hidden')
    expect(hidden.exists()).toBe(true)
    expect(hidden.text()).toBe('required')
  })

  it('does not show (optional) when field has no label', () => {
    const wrapper = mount(VibeFormInput, { props: { id: 'bare' } })
    expect(wrapper.find('.text-muted').exists()).toBe(false)
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

  // Issue 14 — autocomplete typed enum (WCAG 1.3.5)
  describe('autocomplete', () => {
    it('does not set autocomplete attribute by default for text type', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'txt' } })
      expect(wrapper.find('input').attributes('autocomplete')).toBeUndefined()
    })

    it('auto-detects autocomplete="email" for type=email', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'em', type: 'email' } })
      expect(wrapper.find('input').attributes('autocomplete')).toBe('email')
    })

    it('explicit autocomplete prop overrides auto-detect', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'em', type: 'email', autocomplete: 'off' } })
      expect(wrapper.find('input').attributes('autocomplete')).toBe('off')
    })

    it('explicit autocomplete prop is forwarded verbatim', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', autocomplete: 'new-password' } })
      expect(wrapper.find('input').attributes('autocomplete')).toBe('new-password')
    })

    it('autocomplete="off" opt-out is honoured', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'text', autocomplete: 'off' } })
      expect(wrapper.find('input').attributes('autocomplete')).toBe('off')
    })
  })

  // Issue 15 — inputmode prop with auto-detect (WCAG 2.1.1 / mobile UX)
  describe('inputmode', () => {
    it('auto-detects inputmode="decimal" for type=number', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'n', type: 'number' } })
      expect(wrapper.find('input').attributes('inputmode')).toBe('decimal')
    })

    it('auto-detects inputmode="email" for type=email', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'em', type: 'email' } })
      expect(wrapper.find('input').attributes('inputmode')).toBe('email')
    })

    it('auto-detects inputmode="tel" for type=tel', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 't', type: 'tel' } })
      expect(wrapper.find('input').attributes('inputmode')).toBe('tel')
    })

    it('auto-detects inputmode="url" for type=url', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'u', type: 'url' } })
      expect(wrapper.find('input').attributes('inputmode')).toBe('url')
    })

    it('auto-detects inputmode="search" for type=search', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 's', type: 'search' } })
      expect(wrapper.find('input').attributes('inputmode')).toBe('search')
    })

    it('no inputmode for type=text by default', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'txt' } })
      expect(wrapper.find('input').attributes('inputmode')).toBeUndefined()
    })

    it('explicit inputmode prop overrides auto-detect', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'n', type: 'number', inputmode: 'numeric' } })
      expect(wrapper.find('input').attributes('inputmode')).toBe('numeric')
    })
  })

  // Issue 13 — password-strength meter
  describe('showPasswordStrength', () => {
    it('does not render meter by default', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password' } })
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(false)
    })

    it('renders meter when showPasswordStrength=true and type=password', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showPasswordStrength: true } })
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    })

    it('does not render meter when type is not password', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'em', type: 'email', showPasswordStrength: true } })
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(false)
    })

    it('shows "Weak" for empty password', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showPasswordStrength: true } })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Weak')
    })

    it('shows "Weak" for short lowercase-only password', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'pw', type: 'password', showPasswordStrength: true, modelValue: 'abc' }
      })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Weak')
    })

    it('shows "Fair" for 8-char lowercase password', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'pw', type: 'password', showPasswordStrength: true, modelValue: 'abcdefgh' }
      })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Fair')
    })

    it('shows "Good" for mixed case + number ≥8 chars', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'pw', type: 'password', showPasswordStrength: true, modelValue: 'Abcdefgh1' }
      })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Good')
    })

    it('shows "Strong" for mixed case + number + special ≥8 chars', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'pw', type: 'password', showPasswordStrength: true, modelValue: 'Abcdefgh1!' }
      })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Strong')
    })

    it('meter updates reactively on input', async () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'pw', type: 'password', showPasswordStrength: true, modelValue: 'abc' }
      })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Weak')
      await wrapper.setProps({ modelValue: 'Abcdefgh1!' })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Strong')
    })
  })

  // Issue 12 — show password toggle (WCAG a11y-adjacent UX)
  describe('showToggle', () => {
    it('does not render toggle by default', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password' } })
      expect(wrapper.find('button[aria-label]').exists()).toBe(false)
    })

    it('renders toggle when showToggle=true and type=password', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('does not render toggle when showToggle=true but type is not password', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'em', type: 'email', showToggle: true } })
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('toggle has aria-label "Show password" initially', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      expect(wrapper.find('button').attributes('aria-label')).toBe('Show password')
    })

    it('toggle has aria-pressed="false" initially', () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')
    })

    it('clicking toggle changes input type to text', async () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('input').attributes('type')).toBe('text')
    })

    it('clicking toggle again restores type to password', async () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      await wrapper.find('button').trigger('click')
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    it('aria-label becomes "Hide password" when visible', async () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('button').attributes('aria-label')).toBe('Hide password')
    })

    it('aria-pressed becomes "true" when visible', async () => {
      const wrapper = mount(VibeFormInput, { props: { id: 'pw', type: 'password', showToggle: true } })
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
    })
  })

  // Consumer HTML attributes (name, min, maxlength, pattern, …) must land on the
  // native <input>, not the wrapper <div> — otherwise native form submission loses
  // the field name and constraint validation attributes never apply.
  describe('$attrs passthrough to the native input', () => {
    it('forwards name and maxlength to the input in wrapper mode', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'email' },
        attrs: { name: 'email', maxlength: '64' }
      })

      const input = wrapper.find('input')
      expect(input.attributes('name')).toBe('email')
      expect(input.attributes('maxlength')).toBe('64')
      // The wrapper div must NOT carry the forwarded attrs.
      expect(wrapper.attributes('name')).toBeUndefined()
    })

    it('forwards attrs to the input in password-toggle (input-group) mode', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'pw', type: 'password', showToggle: true },
        attrs: { name: 'current_password' }
      })

      expect(wrapper.find('input').attributes('name')).toBe('current_password')
    })

    it('forwards attrs to the input in noWrapper mode', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'qty', noWrapper: true },
        attrs: { name: 'quantity', min: '1', max: '10' }
      })

      const input = wrapper.find('input')
      expect(input.attributes('name')).toBe('quantity')
      expect(input.attributes('min')).toBe('1')
      expect(input.attributes('max')).toBe('10')
    })

    it('consumer class merges onto the input alongside form-control', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'styled' },
        attrs: { class: 'text-uppercase' }
      })

      const input = wrapper.find('input')
      expect(input.classes()).toContain('form-control')
      expect(input.classes()).toContain('text-uppercase')
    })

    it('explicit prop bindings win over conflicting attrs', () => {
      const wrapper = mount(VibeFormInput, {
        props: { id: 'explicit', placeholder: 'from prop' },
        attrs: { placeholder: 'from attr' }
      })

      expect(wrapper.find('input').attributes('placeholder')).toBe('from prop')
    })
  })
})
