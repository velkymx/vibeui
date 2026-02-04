import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeSpinner from '../../src/components/VibeSpinner.vue'

describe('VibeSpinner', () => {
  it('renders spinner with correct structure', () => {
    const wrapper = mount(VibeSpinner)

    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('renders default border type', () => {
    const wrapper = mount(VibeSpinner)

    expect(wrapper.find('.spinner-border').exists()).toBe(true)
  })

  it('renders grow type spinner', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        type: 'grow'
      }
    })

    expect(wrapper.find('.spinner-grow').exists()).toBe(true)
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        variant: 'primary'
      }
    })

    expect(wrapper.find('.spinner-border').classes()).toContain('text-primary')
  })

  it('applies size class for border spinner', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        type: 'border',
        size: 'sm'
      }
    })

    expect(wrapper.find('.spinner-border').classes()).toContain('spinner-border-sm')
  })

  it('applies size class for grow spinner', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        type: 'grow',
        size: 'sm'
      }
    })

    expect(wrapper.find('.spinner-grow').classes()).toContain('spinner-grow-sm')
  })

  it('renders default loading label', () => {
    const wrapper = mount(VibeSpinner)

    expect(wrapper.find('.visually-hidden').exists()).toBe(true)
    expect(wrapper.find('.visually-hidden').text()).toBe('Loading...')
  })

  it('renders custom label', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        label: 'Please wait...'
      }
    })

    expect(wrapper.find('.visually-hidden').text()).toBe('Please wait...')
  })

  it('renders as div by default', () => {
    const wrapper = mount(VibeSpinner)

    expect(wrapper.element.tagName.toLowerCase()).toBe('div')
  })

  it('renders as custom tag', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        tag: 'span'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('span')
  })

  it('sets role attribute', () => {
    const wrapper = mount(VibeSpinner)

    expect(wrapper.attributes('role')).toBe('status')
  })

  it('combines variant and size classes', () => {
    const wrapper = mount(VibeSpinner, {
      props: {
        variant: 'success',
        size: 'sm'
      }
    })

    const classes = wrapper.find('.spinner-border').classes()
    expect(classes).toContain('spinner-border')
    expect(classes).toContain('text-success')
    expect(classes).toContain('spinner-border-sm')
  })
})
