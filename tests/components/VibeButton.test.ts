import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
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

  it('calls preventDefault on click when disabled anchor', async () => {
    const wrapper = mount(VibeButton, {
      props: { disabled: true, href: 'https://example.com' }
    })

    let prevented = false
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'preventDefault', {
      value: () => { prevented = true },
      writable: true
    })

    wrapper.find('a').element.dispatchEvent(event)
    expect(prevented).toBe(true)
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  // Issue 9 — WCAG 1.4.3: disabled button contrast ≥ 4.5:1
  // Native <button disabled> is targeted by the scoped CSS override (.btn:disabled { opacity: 1 })
  it('disabled native button uses the disabled attribute, not the .disabled class', () => {
    const wrapper = mount(VibeButton, { props: { disabled: true } })
    const btn = wrapper.find('button')
    // Native attribute is present
    expect(btn.attributes('disabled')).toBeDefined()
    // Bootstrap's class-based disabled (for non-button elements) must NOT be added to native buttons
    // because it bypasses the contrast CSS override that targets the :disabled pseudo-class
    expect(btn.classes()).not.toContain('disabled')
  })

  it('aria-disabled is set when button is disabled', () => {
    const wrapper = mount(VibeButton, { props: { disabled: true } })
    expect(wrapper.find('button').attributes('aria-disabled')).toBe('true')
  })

  // Issue 10 — WCAG 4.1.2: icon-only buttons must have aria-label (dev warning)
  it('warns in dev when slot has only icon content and aria-label is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(VibeButton, {
      slots: { default: () => [h('i', { class: 'bi bi-tags' })] }
    })

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[VibeButton]'))
    warnSpy.mockRestore()
  })

  it('does not warn when aria-label is provided on icon-only button', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(VibeButton, {
      attrs: { 'aria-label': 'Delete item' },
      slots: { default: () => [h('i', { class: 'bi bi-trash' })] }
    })

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('[VibeButton]'))
    warnSpy.mockRestore()
  })

  it('does not warn when button slot has visible text', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(VibeButton, { slots: { default: 'Save' } })

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('[VibeButton]'))
    warnSpy.mockRestore()
  })

  it('does not warn when no slot is provided (empty button)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(VibeButton)

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('[VibeButton]'))
    warnSpy.mockRestore()
  })

  describe('variant="link"', () => {
    it('renders .btn-link class', () => {
      const wrapper = mount(VibeButton, {
        props: { variant: 'link' }
      })

      const classes = wrapper.find('button').classes()
      expect(classes).toContain('btn')
      expect(classes).toContain('btn-link')
    })

    it('does not emit btn-outline-link when outline is true (no such class)', () => {
      const wrapper = mount(VibeButton, {
        props: { variant: 'link', outline: true }
      })

      const classes = wrapper.find('button').classes()
      expect(classes).toContain('btn-link')
      expect(classes).not.toContain('btn-outline-link')
      expect(classes).not.toContain('btn-link-link')
    })

    it('combines size with link variant', () => {
      const wrapper = mount(VibeButton, {
        props: { variant: 'link', size: 'sm' }
      })

      const classes = wrapper.find('button').classes()
      expect(classes).toContain('btn-link')
      expect(classes).toContain('btn-sm')
    })

    it('still emits click for link variant', async () => {
      const wrapper = mount(VibeButton, {
        props: { variant: 'link' }
      })

      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  // Security: href is sanitized with the same rules as every other link-bearing
  // component — an unsafe value must not reach the DOM, and must not leave a dead
  // anchor behind either.
  describe('href sanitization', () => {
    it.each([
      ['javascript:alert(1)'],
      ['JavaScript:alert(1)'],
      ['data:text/html,<script>alert(1)</script>'],
      ['vbscript:msgbox(1)'],
      ['//evil.example.com']
    ])('does not render %s as an href', unsafe => {
      const wrapper = mount(VibeButton, { props: { href: unsafe } })

      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.html()).not.toContain(unsafe)
    })

    it.each([
      ['https://example.com'],
      ['http://example.com'],
      ['/absolute'],
      ['./relative'],
      ['../up'],
      ['#anchor']
    ])('preserves the safe href %s', safe => {
      const wrapper = mount(VibeButton, { props: { href: safe } })

      expect(wrapper.find('a').attributes('href')).toBe(safe)
    })

    it('falls back to the router link when href is unsafe but to is set', () => {
      const wrapper = mount(VibeButton, {
        props: { href: 'javascript:alert(1)', to: '/safe' },
        global: { stubs: { 'router-link': true } }
      })

      expect(wrapper.find('router-link-stub').exists()).toBe(true)
    })
  })
})
