import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeHero from '../../src/components/VibeHero.vue'

describe('VibeHero', () => {
  it('renders a <section> wrapping a .container with default slot content', () => {
    const wrapper = mount(VibeHero, { slots: { default: '<h1>Hi</h1>' } })
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.html()).toContain('<h1>Hi</h1>')
  })

  it('centers content by default (text-center) and supports align', () => {
    expect(mount(VibeHero).find('.text-center').exists()).toBe(true)
    const start = mount(VibeHero, { props: { align: 'start' } })
    expect(start.find('.text-start').exists()).toBe(true)
    expect(start.find('.text-center').exists()).toBe(false)
  })

  it('applies background and text variants (VibeCard vocabulary)', () => {
    const wrapper = mount(VibeHero, { props: { variant: 'dark', textVariant: 'light' } })
    expect(wrapper.classes()).toContain('bg-dark')
    expect(wrapper.classes()).toContain('text-light')
  })

  it('adds border + rounded when border variant is set', () => {
    const wrapper = mount(VibeHero, { props: { border: 'primary' } })
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('border-primary')
    expect(wrapper.classes()).toContain('rounded-3')
  })

  it('renders a fluid container when fluid is true', () => {
    const wrapper = mount(VibeHero, { props: { fluid: true } })
    expect(wrapper.find('.container-fluid').exists()).toBe(true)
    expect(wrapper.find('.container').exists()).toBe(false)
  })

  it('renders a safe background image with cover sizing', () => {
    const wrapper = mount(VibeHero, { props: { bgImage: 'https://example.com/a.jpg' } })
    const style = wrapper.attributes('style') || ''
    expect(style).toContain('url("https://example.com/a.jpg")')
    expect(style).toContain('cover')
  })

  it('blocks dangerous bgImage URLs (safeHref)', () => {
    const wrapper = mount(VibeHero, { props: { bgImage: 'javascript:alert(1)' } })
    const style = wrapper.attributes('style') || ''
    expect(style).not.toContain('javascript')
    expect(style).not.toContain('url(')
  })

  it('layers a dark overlay over the background image when overlay is set', () => {
    const wrapper = mount(VibeHero, { props: { bgImage: 'https://example.com/a.jpg', overlay: true } })
    const style = wrapper.attributes('style') || ''
    expect(style).toContain('linear-gradient')
    expect(style).toContain('url("https://example.com/a.jpg")')
  })

  it('applies a validated CSS gradient background', () => {
    const wrapper = mount(VibeHero, { props: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } })
    const style = wrapper.attributes('style') || ''
    expect(style).toContain('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
  })

  it('applies a sanitized minHeight (safeLength) and ignores unsafe values', () => {
    expect((mount(VibeHero, { props: { minHeight: '400px' } }).attributes('style') || '')).toContain('min-height: 400px')
    expect((mount(VibeHero, { props: { minHeight: 'expression(alert(1))' } }).attributes('style') || '')).not.toContain('expression')
  })

  it('renders a custom tag', () => {
    expect(mount(VibeHero, { props: { tag: 'div' } }).element.tagName).toBe('DIV')
  })
})
