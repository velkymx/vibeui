import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibePlaceholder from '../../src/components/VibePlaceholder.vue'

describe('VibePlaceholder', () => {
  it('renders placeholder with correct structure', () => {
    const wrapper = mount(VibePlaceholder)

    expect(wrapper.find('.placeholder').exists()).toBe(true)
  })

  it('applies variant class', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        variant: 'primary'
      }
    })

    expect(wrapper.find('.placeholder').classes()).toContain('bg-primary')
  })

  it('applies size class', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        size: 'lg'
      }
    })

    expect(wrapper.find('.placeholder').classes()).toContain('placeholder-lg')
  })

  it('applies glow animation class to container', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        animation: 'glow'
      }
    })

    expect(wrapper.classes()).toContain('placeholder-glow')
  })

  it('applies wave animation class to container', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        animation: 'wave'
      }
    })

    expect(wrapper.classes()).toContain('placeholder-wave')
  })

  it('sets width as number percentage', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        width: 75
      }
    })

    expect(wrapper.find('.placeholder').attributes('style')).toContain('width: 75%')
  })

  it('sets width as string value', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        width: '200px'
      }
    })

    expect(wrapper.find('.placeholder').attributes('style')).toContain('width: 200px')
  })

  it('renders as span by default', () => {
    const wrapper = mount(VibePlaceholder)

    expect(wrapper.element.tagName.toLowerCase()).toBe('span')
  })

  it('renders as custom tag', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        tag: 'div'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('div')
  })

  it('combines variant, size, and width', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        variant: 'danger',
        size: 'sm',
        width: 50
      }
    })

    const placeholder = wrapper.find('.placeholder')
    expect(placeholder.classes()).toContain('placeholder')
    expect(placeholder.classes()).toContain('bg-danger')
    expect(placeholder.classes()).toContain('placeholder-sm')
    expect(placeholder.attributes('style')).toContain('width: 50%')
  })

  it('combines animation with other props', () => {
    const wrapper = mount(VibePlaceholder, {
      props: {
        animation: 'glow',
        variant: 'secondary',
        width: 100
      }
    })

    expect(wrapper.classes()).toContain('placeholder-glow')
    const placeholder = wrapper.find('.placeholder')
    expect(placeholder.classes()).toContain('bg-secondary')
    expect(placeholder.attributes('style')).toContain('width: 100%')
  })

  it('renders slot content inside placeholder span', () => {
    const wrapper = mount(VibePlaceholder, {
      slots: {
        default: 'Content'
      }
    })

    expect(wrapper.find('.placeholder').text()).toBe('Content')
  })

  // #193: freeform width is untrusted. expression()/url() payloads must be
  // dropped before :style; valid values still render.
  it('#193 drops expression() and url() widths', () => {
    // See the happy-dom note in VibeSkeleton.test.ts: calc() is the
    // discriminating payload here (valid CSS, outside the allowlist).
    for (const payload of ['expression(alert(1))', 'url(https://evil/x)', 'calc(100% - 10px)']) {
      const wrapper = mount(VibePlaceholder, { props: { width: payload } })
      const style = wrapper.find('.placeholder').attributes('style') ?? ''
      expect(style).not.toContain('expression')
      expect(style).not.toContain('url(')
      expect(style).not.toContain('calc(')
    }
  })

  it('#193 drops non-finite numeric widths', () => {
    const wrapper = mount(VibePlaceholder, {
      props: { width: Number.POSITIVE_INFINITY as unknown as number }
    })
    expect(wrapper.find('.placeholder').attributes('style') ?? '').not.toContain('width')
  })
})
