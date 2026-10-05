import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDropdown from '../../src/components/VibeDropdown.vue'

// #133: a DropdownItem list keys by text/href/to. A divider/header legitimately
// has no key (no warning). A genuine actionable item with none of those falls
// back to the index and warns in DEV.

describe('VibeDropdown index-key fallback warning (#133)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('warns for an actionable item with no text, href, or to', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeDropdown, { props: { label: 'Menu', items: [{ active: true }] } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('falls back to the array index'))
  })

  it('does not warn for a divider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeDropdown, { props: { label: 'Menu', items: [{ divider: true }] } })
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn for a normal item with text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeDropdown, { props: { label: 'Menu', items: [{ text: 'Profile' }] } })
    expect(warn).not.toHaveBeenCalled()
  })
})
