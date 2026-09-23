import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeRow from '../../src/components/VibeRow.vue'

describe('VibeRow', () => {
  it('renders as a div by default', () => {
    const wrapper = mount(VibeRow)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('row')
  })

  it('renders as the element given by tag="form" so the grid can be a form', () => {
    const wrapper = mount(VibeRow, { props: { tag: 'form' } })
    expect(wrapper.element.tagName).toBe('FORM')
    expect(wrapper.classes()).toContain('row')
  })
})
