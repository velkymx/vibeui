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

  // Bootstrap's .text-bg-{variant} pairs a background with a contrast-correct
  // foreground, so light/warning/info are readable — the bare .bg-{variant} on
  // top of .badge's default color:#fff rendered white-on-light.
  it('applies contrast-correct text-bg-{variant} for the variant', () => {
    const wrapper = mount(VibeBadge, {
      props: {
        variant: 'danger'
      }
    })

    const classes = wrapper.find('.badge').classes()
    expect(classes).toContain('text-bg-danger')
    expect(classes).not.toContain('bg-danger')
  })

  it('applies default primary variant', () => {
    const wrapper = mount(VibeBadge)

    expect(wrapper.find('.badge').classes()).toContain('text-bg-primary')
  })

  it('keeps light/warning/info readable via text-bg-{variant}', () => {
    for (const variant of ['light', 'warning', 'info'] as const) {
      const wrapper = mount(VibeBadge, { props: { variant } })
      expect(wrapper.find('.badge').classes()).toContain(`text-bg-${variant}`)
    }
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
    expect(classes).toContain('text-bg-success')
    expect(classes).toContain('rounded-pill')
  })

  it('keeps the subtle path (bg-{variant}-subtle + text-{variant}-emphasis)', () => {
    const wrapper = mount(VibeBadge, {
      props: { variant: 'info', subtle: true }
    })

    const classes = wrapper.find('.badge').classes()
    expect(classes).toContain('bg-info-subtle')
    expect(classes).toContain('text-info-emphasis')
    expect(classes).not.toContain('text-bg-info')
  })

  it('textColor prop overrides the foreground (non-subtle)', () => {
    const wrapper = mount(VibeBadge, {
      props: { variant: 'warning', textColor: 'dark' }
    })

    const classes = wrapper.find('.badge').classes()
    expect(classes).toContain('text-bg-warning')
    expect(classes).toContain('text-dark')
  })

  it('textColor prop overrides the foreground (subtle)', () => {
    const wrapper = mount(VibeBadge, {
      props: { variant: 'primary', subtle: true, textColor: 'body' }
    })

    expect(wrapper.find('.badge').classes()).toContain('text-body')
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
