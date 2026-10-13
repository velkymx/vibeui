import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFieldFeedback from '../../src/components/VibeFieldFeedback.vue'

// #199: consumer class/style must inherit instead of being silently discarded.
// Single root plus display:contents keeps layout unchanged.
describe('VibeFieldFeedback attrs (#199)', () => {
  it('renders consumer class on its root', () => {
    const wrapper = mount(VibeFieldFeedback, {
      props: { helpId: 'h', feedbackId: 'f', helpText: 'hint', showHelp: true },
      attrs: { class: 'my-feedback' }
    })
    expect(wrapper.classes()).toContain('my-feedback')
    expect(wrapper.find('.form-text').exists()).toBe(true)
  })

  it('renders a single layout wrapper around help and feedback', () => {
    const wrapper = mount(VibeFieldFeedback, {
      props: { helpId: 'h', feedbackId: 'f', helpText: 'hint', showHelp: true }
    })
    // Single root (layout transparency comes from the scoped
    // .vibe-field-feedback display:contents rule, which happy-dom cannot
    // compute, so its presence is covered by review, not by assertion).
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('vibe-field-feedback')
    expect(wrapper.find('.form-text').exists()).toBe(true)
  })
})
