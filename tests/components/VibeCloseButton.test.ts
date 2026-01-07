import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCloseButton from '../../src/components/VibeCloseButton.vue'

describe('VibeCloseButton', () => {
  it('renders close button with correct structure', () => {
    const wrapper = mount(VibeCloseButton)

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('.btn-close').exists()).toBe(true)
  })

  it('sets type attribute to button', () => {
    const wrapper = mount(VibeCloseButton)

    expect(wrapper.find('button').attributes('type')).toBe('button')
  })

  it('sets default aria-label', () => {
    const wrapper = mount(VibeCloseButton)

    expect(wrapper.find('button').attributes('aria-label')).toBe('Close')
  })

  it('sets custom aria-label', () => {
    const wrapper = mount(VibeCloseButton, {
      props: {
        ariaLabel: 'Dismiss alert'
      }
    })

    expect(wrapper.find('button').attributes('aria-label')).toBe('Dismiss alert')
  })

  it('applies white variant class', () => {
    const wrapper = mount(VibeCloseButton, {
      props: {
        white: true
      }
    })

    expect(wrapper.find('button').classes()).toContain('btn-close-white')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeCloseButton, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits click event', async () => {
    const wrapper = mount(VibeCloseButton)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(VibeCloseButton, {
      props: {
        disabled: true
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('combines white variant with disabled state', () => {
    const wrapper = mount(VibeCloseButton, {
      props: {
        white: true,
        disabled: true
      }
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('btn-close')
    expect(button.classes()).toContain('btn-close-white')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
