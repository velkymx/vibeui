import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeLink from '../../src/components/VibeLink.vue'

describe('VibeLink', () => {
  it('renders correctly as <a> by default', () => {
    const wrapper = mount(VibeLink, {
      props: { href: '#' },
      slots: { default: 'Link' }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.text()).toBe('Link')
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeLink, {
      props: { variant: 'primary' }
    })
    expect(wrapper.classes()).toContain('link-primary')
  })

  it('applies link-underline-0 when underline is false', () => {
    const wrapper = mount(VibeLink, {
      props: { underline: false }
    })
    expect(wrapper.classes()).toContain('link-underline-0')
  })

  it('applies offset class', () => {
    const wrapper = mount(VibeLink, {
      props: { offset: 2 }
    })
    expect(wrapper.classes()).toContain('link-offset-2')
  })

  it('applies focus-ring class', () => {
    const wrapper = mount(VibeLink, {
      props: { focusRing: true }
    })
    expect(wrapper.classes()).toContain('focus-ring')
  })
})
