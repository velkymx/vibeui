import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormSpinbutton from '../../src/components/VibeFormSpinbutton.vue'

describe('VibeFormSpinbutton', () => {
  it('renders spinbutton with correct structure', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'test-spinbutton'
      }
    })

    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('.input-group').exists()).toBe(true)
    expect(wrapper.findAll('button')).toHaveLength(2)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'quantity',
        label: 'Quantity'
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Quantity')
    expect(label.attributes('for')).toBe('quantity')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'quantity',
        label: 'Quantity',
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  it('sets default value to 0', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton'
      }
    })

    expect(wrapper.find('input').element.value).toBe('0')
  })

  it('sets min and max attributes', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        min: 1,
        max: 10
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('10')
  })

  it('sets step attribute', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        step: 5
      }
    })

    expect(wrapper.find('input').attributes('step')).toBe('5')
  })

  it('sets disabled attribute on input', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        disabled: true
      }
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('disables both buttons when disabled', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        disabled: true
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('disables decrement button at minimum', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 0,
        min: 0
      }
    })

    const decrementButton = wrapper.findAll('button')[0]
    expect(decrementButton.attributes('disabled')).toBeDefined()
  })

  it('disables increment button at maximum', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 10,
        max: 10
      }
    })

    const incrementButton = wrapper.findAll('button')[1]
    expect(incrementButton.attributes('disabled')).toBeDefined()
  })

  it('increments value when increment button is clicked', async () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 5
      }
    })

    const incrementButton = wrapper.findAll('button')[1]
    await incrementButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe(6)
  })

  it('decrements value when decrement button is clicked', async () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 5
      }
    })

    const decrementButton = wrapper.findAll('button')[0]
    await decrementButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe(4)
  })

  it('emits increment event', async () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 5
      }
    })

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('increment')).toBeTruthy()
    const emitted = wrapper.emitted('increment') as any[][]
    expect(emitted[0][0]).toBe(6)
  })

  it('emits decrement event', async () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 5
      }
    })

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('decrement')).toBeTruthy()
    const emitted = wrapper.emitted('decrement') as any[][]
    expect(emitted[0][0]).toBe(4)
  })

  it('wraps to min when incrementing past max with wrap enabled', async () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        modelValue: 10,
        min: 0,
        max: 10,
        wrap: true
      }
    })

    const incrementButton = wrapper.findAll('button')[1]
    await incrementButton.trigger('click')

    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe(0)
  })

  it('applies size class to input-group', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        size: 'lg'
      }
    })

    expect(wrapper.find('.input-group').classes()).toContain('input-group-lg')
  })

  it('applies validation state classes', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        validationState: 'invalid'
      }
    })

    expect(wrapper.find('input').classes()).toContain('is-invalid')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        validationState: 'invalid',
        validationMessage: 'Invalid number'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('Invalid number')
  })

  it('applies vertical class', () => {
    const wrapper = mount(VibeFormSpinbutton, {
      props: {
        id: 'spinbutton',
        vertical: true
      }
    })

    expect(wrapper.find('.input-group').classes()).toContain('input-group-vertical')
  })

  describe('invalid step handling', () => {
    // Each test feeds an invalid step (NaN / 0) the component coerces to 1 with a
    // DEV warning. Spy console.warn so the expected warning is asserted, not leaked.
    let warnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      warnSpy.mockRestore()
    })

    it('coerces step=NaN to 1 so increment does not emit NaN', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { id: 'sb', modelValue: 5, step: NaN }
      })

      await wrapper.find('button[aria-label="Increment"]').trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted).toBeTruthy()
      const value = emitted[emitted.length - 1][0]
      expect(Number.isNaN(value)).toBe(false)
      expect(value).toBe(6) // 5 + safeStep(1)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('step must be a positive number'))
    })

    it('coerces step=0 to 1 so increment advances by 1', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { id: 'sb', modelValue: 2, step: 0 }
      })

      await wrapper.find('button[aria-label="Increment"]').trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[emitted.length - 1][0]).toBe(3)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('step must be a positive number'))
    })

    it('coerces step=0 to 1 on decrement', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { id: 'sb', modelValue: 2, step: 0 }
      })

      await wrapper.find('button[aria-label="Decrement"]').trigger('click')

      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[emitted.length - 1][0]).toBe(1)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('step must be a positive number'))
    })
  })
})

describe('VibeFormSpinbutton $attrs passthrough', () => {
  it('forwards aria-label / name / data-* to the input, not the wrapper', () => {
    const wrapper = mount(VibeFormSpinbutton, { attrs: { 'aria-label': 'Qty', name: 'qty', 'data-testid': 'sb' } })
    const input = wrapper.find('input')
    expect(input.attributes('aria-label')).toBe('Qty')
    expect(input.attributes('name')).toBe('qty')
    expect(input.attributes('data-testid')).toBe('sb')
    expect(wrapper.element.getAttribute('name')).toBeNull()
  })
  it('merges consumer class onto the input', () => {
    const wrapper = mount(VibeFormSpinbutton, { attrs: { class: 'custom' } })
    expect(wrapper.find('input').classes()).toContain('custom')
  })

  // #195: NaN must never enter internalValue/modelValue, and out-of-range
  // values clamp on the way in (init and external assignment), not only on
  // first user interaction.
  describe('non-finite and out-of-range values (#195)', () => {
    it('clamps an above-max initial value before display', () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: 999, max: 10 }
      })
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('10')
    })

    it('clamps a below-min initial value before display', () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: -50, min: 0 }
      })
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('0')
    })

    it('a NaN model does not wedge the buttons and increment emits a number', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: NaN }
      })
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('0')
      const buttons = wrapper.findAll('button')
      expect(buttons[0].attributes('disabled')).toBeUndefined()
      expect(buttons[1].attributes('disabled')).toBeUndefined()

      await buttons[1].trigger('click')
      const emitted = wrapper.emitted('increment')
      expect(emitted).toBeDefined()
      expect(Number.isFinite((emitted as unknown[][])[0][0] as number)).toBe(true)
    })

    it('an externally assigned NaN is normalized to 0', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: 5 }
      })
      await wrapper.setProps({ modelValue: NaN })
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('0')
      expect(wrapper.findAll('button')[1].attributes('disabled')).toBeUndefined()
    })

    it('an externally assigned out-of-range value is clamped', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: 5, max: 10 }
      })
      await wrapper.setProps({ modelValue: 999 })
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('10')
    })
  })

  // #229: stepper clicks are explicit commits (model updates per click), but
  // validation must follow validateOn like every other path in the file.
  describe('stepper validation gating (#229)', () => {
    const clickIncrement = async (props: Record<string, unknown> = {}) => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: 5, ...props }
      })
      await wrapper.findAll('button')[1].trigger('click')
      return wrapper
    }

    it('does not emit validate on click under the default validate-on blur', async () => {
      const wrapper = await clickIncrement()
      expect(wrapper.emitted('increment')).toHaveLength(1)
      expect(wrapper.emitted('validate')).toBeUndefined()
      wrapper.unmount()
    })

    it('does not emit validate on decrement under validate-on blur', async () => {
      const wrapper = mount(VibeFormSpinbutton, {
        props: { modelValue: 5, validateOn: 'blur' }
      })
      await wrapper.findAll('button')[0].trigger('click')
      expect(wrapper.emitted('decrement')).toHaveLength(1)
      expect(wrapper.emitted('validate')).toBeUndefined()
      wrapper.unmount()
    })

    it('emits validate on click when validate-on is change', async () => {
      const wrapper = await clickIncrement({ validateOn: 'change' })
      expect(wrapper.emitted('increment')).toHaveLength(1)
      expect(wrapper.emitted('validate')).toHaveLength(1)
      wrapper.unmount()
    })

    it('still commits the model per click (explicit commit gesture)', async () => {
      const wrapper = await clickIncrement({ modelModifiers: { lazy: true } })
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
      wrapper.unmount()
    })
  })
})
