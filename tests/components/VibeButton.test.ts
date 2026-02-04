import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeButton from '../../src/components/VibeButton.vue'

describe('VibeButton', () => {
  it('renders button with default props', () => {
    const wrapper = mount(VibeButton, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toBe('Click me')
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeButton, {
      props: {
        variant: 'primary'
      }
    })

    expect(wrapper.find('button').classes()).toContain('btn-primary')
  })

  it('applies outline variant class', () => {
    const wrapper = mount(VibeButton, {
      props: {
        variant: 'primary',
        outline: true
      }
    })

    expect(wrapper.find('button').classes()).toContain('btn-outline-primary')
  })

  it('applies size class', () => {
    const wrapper = mount(VibeButton, {
      props: {
        size: 'lg'
      }
    })

    expect(wrapper.find('button').classes()).toContain('btn-lg')
  })

  it('sets button type attribute', () => {
    const wrapper = mount(VibeButton, {
      props: {
        type: 'submit'
      }
    })

    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeButton, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('renders as link when href is provided', () => {
    const wrapper = mount(VibeButton, {
      props: {
        href: '/test'
      }
    })

    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').attributes('href')).toBe('/test')
  })

  it('renders as router-link when to is provided', () => {
    const wrapper = mount(VibeButton, {
      props: {
        to: '/home'
      },
      global: {
        stubs: {
          'router-link': true
        }
      }
    })

    expect(wrapper.find('router-link-stub').exists()).toBe(true)
  })

  it('emits click event', async () => {
    const wrapper = mount(VibeButton)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(VibeButton, {
      props: {
        disabled: true
      }
    })

    await wrapper.find('button').trigger('click')

    // Disabled buttons don't emit click events
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
