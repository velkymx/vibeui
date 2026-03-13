import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeInputGroup from '../../src/components/VibeInputGroup.vue'
import VibeFormInput from '../../src/components/VibeFormInput.vue'

describe('VibeInputGroup', () => {
  it('renders correctly with base class', () => {
    const wrapper = mount(VibeInputGroup)
    expect(wrapper.classes()).toContain('input-group')
  })

  it('applies size class', () => {
    const wrapper = mount(VibeInputGroup, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('input-group-lg')
  })

  it('renders prepend and append text via props', () => {
    const wrapper = mount(VibeInputGroup, {
      props: {
        prepend: '@',
        append: '.00'
      }
    })
    const texts = wrapper.findAll('.input-group-text')
    expect(texts).toHaveLength(2)
    expect(texts[0].text()).toBe('@')
    expect(texts[1].text()).toBe('.00')
  })

  it('integrates with VibeFormInput using noWrapper', () => {
    const wrapper = mount(VibeInputGroup, {
      slots: {
        default: '<VibeFormInput noWrapper modelValue="test" />'
      },
      global: {
        components: { VibeFormInput }
      }
    })
    
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').classes()).toContain('form-control')
    // Ensure no wrapper div is present around the input
    expect(wrapper.find('.mb-3').exists()).toBe(false)
  })
})
