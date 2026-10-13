import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeButton from '../../src/components/VibeButton.vue'

// #140: variant="outline-*" is a common Bootstrap habit that VibeUI does not
// support (outline is a boolean prop). Warn in DEV with the correct form.

describe('VibeButton outline-* variant warning (#140)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('warns when variant starts with outline-', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeButton, { props: { variant: 'outline-primary' as never }, slots: { default: 'Go' } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('outline'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('variant="primary" outline'))
  })

  it('does not warn for a normal variant', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeButton, { props: { variant: 'primary' }, slots: { default: 'Go' } })
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn for a normal variant with the outline prop', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeButton, { props: { variant: 'secondary', outline: true }, slots: { default: 'Go' } })
    expect(warn).not.toHaveBeenCalled()
  })
})
