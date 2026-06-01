import { describe, it, expect } from 'vitest'
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
})
