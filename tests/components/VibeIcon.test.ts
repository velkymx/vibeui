import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeIcon from '../../src/components/VibeIcon.vue'

describe('VibeIcon', () => {
  it('renders bi-{icon} class', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house' } })
    expect(wrapper.classes()).toContain('bi')
    expect(wrapper.classes()).toContain('bi-house')
  })

  it('applies a valid fontSize', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house', fontSize: '1.5rem' } })
    expect(wrapper.attributes('style')).toContain('font-size: 1.5rem')
  })

  it('applies a valid color', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house', color: '#ff0000' } })
    expect(wrapper.attributes('style')).toContain('color: #ff0000')
  })

  it('applies a CSS variable color', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house', color: 'var(--bs-primary)' } })
    expect(wrapper.attributes('style')).toContain('var(--bs-primary)')
  })

  // Security: freeform color/fontSize must be validated before binding to :style.
  it('rejects a malicious fontSize value', () => {
    const wrapper = mount(VibeIcon, {
      props: { icon: 'house', fontSize: 'expression(alert(1))' }
    })
    const style = wrapper.attributes('style') ?? ''
    expect(style).not.toContain('expression')
  })

  it('rejects a malicious color value', () => {
    const wrapper = mount(VibeIcon, {
      props: { icon: 'house', color: 'red; background: url(http://evil.com)' }
    })
    const style = wrapper.attributes('style') ?? ''
    expect(style).not.toContain('evil.com')
    expect(style).not.toContain('url(')
  })

  // P0: icons inside links/buttons show text cursor over the glyph character.
  // cursor:inherit defers to the parent element's cursor (pointer inside <a>/<button>).
  it('always sets cursor: inherit so icon glyph never overrides parent cursor (P0)', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house' } })
    expect(wrapper.attributes('style')).toContain('cursor: inherit')
  })

  it('always sets user-select: none to prevent glyph being treated as selectable text (P0)', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house' } })
    expect(wrapper.attributes('style')).toContain('user-select: none')
  })

  it('retains cursor: inherit even when fontSize and color are set (P0)', () => {
    const wrapper = mount(VibeIcon, { props: { icon: 'house', fontSize: '2rem', color: '#f00' } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('cursor: inherit')
    expect(style).toContain('user-select: none')
    expect(style).toContain('font-size: 2rem')
    expect(style).toContain('color: #f00')
  })
})
