import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeBadge from '../../src/components/VibeBadge.vue'

describe('VibeBadge', () => {
  it('renders badge with correct structure', () => {
    const wrapper = mount(VibeBadge, {
      slots: {
        default: 'New'
      }
    })

    expect(wrapper.find('.badge').exists()).toBe(true)
    expect(wrapper.text()).toBe('New')
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeBadge, {
      props: {
        variant: 'danger'
      }
    })

    expect(wrapper.find('.badge').classes()).toContain('bg-danger')
  })

  it('applies default primary variant', () => {
    const wrapper = mount(VibeBadge)

    expect(wrapper.find('.badge').classes()).toContain('bg-primary')
  })

  it('applies pill class', () => {
    const wrapper = mount(VibeBadge, {
      props: {
        pill: true
      }
    })

    expect(wrapper.find('.badge').classes()).toContain('rounded-pill')
  })

  it('renders as span by default', () => {
    const wrapper = mount(VibeBadge, {
      slots: {
        default: 'Badge'
      }
    })

    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('renders as custom tag', () => {
    const wrapper = mount(VibeBadge, {
      props: {
        tag: 'a'
      },
      slots: {
        default: 'Link Badge'
      }
    })

    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').classes()).toContain('badge')
  })

  it('combines variant and pill classes', () => {
    const wrapper = mount(VibeBadge, {
      props: {
        variant: 'success',
        pill: true
      }
    })

    const classes = wrapper.find('.badge').classes()
    expect(classes).toContain('badge')
    expect(classes).toContain('bg-success')
    expect(classes).toContain('rounded-pill')
  })

  it('renders slot content', () => {
    const wrapper = mount(VibeBadge, {
      slots: {
        default: '<strong>Bold Badge</strong>'
      }
    })

    expect(wrapper.html()).toContain('<strong>Bold Badge</strong>')
  })
})
