import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeButtonGroup from '../../src/components/VibeButtonGroup.vue'

describe('VibeButtonGroup', () => {
  it('renders button group with correct structure', () => {
    const wrapper = mount(VibeButtonGroup, {
      slots: {
        default: '<button class="btn">Button 1</button><button class="btn">Button 2</button>'
      }
    })

    expect(wrapper.find('.btn-group').exists()).toBe(true)
  })

  it('renders as horizontal by default', () => {
    const wrapper = mount(VibeButtonGroup)

    expect(wrapper.find('.btn-group').exists()).toBe(true)
    expect(wrapper.find('.btn-group-vertical').exists()).toBe(false)
  })

  it('renders as vertical when vertical prop is true', () => {
    const wrapper = mount(VibeButtonGroup, {
      props: {
        vertical: true
      }
    })

    expect(wrapper.find('.btn-group-vertical').exists()).toBe(true)
    expect(wrapper.find('.btn-group').exists()).toBe(false)
  })

  it('applies size class', () => {
    const wrapper = mount(VibeButtonGroup, {
      props: {
        size: 'lg'
      }
    })

    expect(wrapper.find('.btn-group').classes()).toContain('btn-group-lg')
  })

  it('applies size class to vertical group', () => {
    const wrapper = mount(VibeButtonGroup, {
      props: {
        vertical: true,
        size: 'sm'
      }
    })

    expect(wrapper.find('.btn-group-vertical').classes()).toContain('btn-group-sm')
  })

  it('sets role attribute', () => {
    const wrapper = mount(VibeButtonGroup, {
      props: {
        role: 'toolbar'
      }
    })

    expect(wrapper.find('.btn-group').attributes('role')).toBe('toolbar')
  })

  it('sets default role as group', () => {
    const wrapper = mount(VibeButtonGroup)

    expect(wrapper.find('.btn-group').attributes('role')).toBe('group')
  })

  it('sets aria-label attribute', () => {
    const wrapper = mount(VibeButtonGroup, {
      props: {
        ariaLabel: 'Basic button group'
      }
    })

    expect(wrapper.find('.btn-group').attributes('aria-label')).toBe('Basic button group')
  })

  it('renders slot content', () => {
    const wrapper = mount(VibeButtonGroup, {
      slots: {
        default: '<button class="btn btn-primary">First</button>'
      }
    })

    expect(wrapper.html()).toContain('<button class="btn btn-primary">First</button>')
  })
})
