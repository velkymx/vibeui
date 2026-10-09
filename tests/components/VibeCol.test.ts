import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCol from '../../src/components/VibeCol.vue'

describe('VibeCol', () => {
  it('renders default col with no sizing props', () => {
    const wrapper = mount(VibeCol)
    expect(wrapper.classes()).toContain('col')
    wrapper.unmount()
  })

  // #237 P2: false means "no opinion", same as absent.
  describe('boolean false (#237)', () => {
    it(':cols="false" alone falls back to the default col', () => {
      const wrapper = mount(VibeCol, { props: { cols: false } })
      expect(wrapper.classes()).toContain('col')
      wrapper.unmount()
    })

    it(':sm="false" contributes no class', () => {
      const wrapper = mount(VibeCol, { props: { sm: false } })
      expect(wrapper.classes()).not.toContain('col-sm-false')
      expect(wrapper.classes()).toContain('col')
      wrapper.unmount()
    })

    it('false alongside a real breakpoint keeps the real class', () => {
      const wrapper = mount(VibeCol, { props: { sm: false, md: 6 } })
      expect(wrapper.classes()).toContain('col-md-6')
      expect(wrapper.classes().some((c) => c.includes('false'))).toBe(false)
      wrapper.unmount()
    })

    it('true and auto still emit their classes', () => {
      const wrapper = mount(VibeCol, { props: { cols: true, sm: 'auto' } })
      expect(wrapper.classes()).toContain('col')
      expect(wrapper.classes()).toContain('col-sm-auto')
      wrapper.unmount()
    })
  })
})
