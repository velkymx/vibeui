import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeNav from '../../src/components/VibeNav.vue'
import type { NavItem } from '../../src/types'

describe('VibeNav', () => {
  const mockItems: NavItem[] = [
    { text: 'Home', href: '#home', active: true },
    { text: 'Features', href: '#features' },
    { text: 'Pricing', href: '#pricing', disabled: true }
  ]

  it('renders nav with correct structure', () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems }
    })

    expect(wrapper.find('.nav').exists()).toBe(true)
    expect(wrapper.findAll('.nav-item')).toHaveLength(3)
  })

  it('applies tabs class', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems,
        tabs: true
      }
    })

    expect(wrapper.find('.nav').classes()).toContain('nav-tabs')
  })

  it('applies pills class', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems,
        pills: true
      }
    })

    expect(wrapper.find('.nav').classes()).toContain('nav-pills')
  })

  it('applies fill class', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems,
        fill: true
      }
    })

    expect(wrapper.find('.nav').classes()).toContain('nav-fill')
  })

  it('applies justified class', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems,
        justified: true
      }
    })

    expect(wrapper.find('.nav').classes()).toContain('nav-justified')
  })

  it('applies vertical class', () => {
    const wrapper = mount(VibeNav, {
      props: {
        items: mockItems,
        vertical: true
      }
    })

    expect(wrapper.find('.nav').classes()).toContain('flex-column')
  })

  it('marks active item correctly', () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems }
    })

    const links = wrapper.findAll('.nav-link')
    expect(links[0].classes()).toContain('active')
  })

  it('marks disabled item correctly', () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems }
    })

    const links = wrapper.findAll('.nav-link')
    expect(links[2].classes()).toContain('disabled')
  })

  it('renders links with correct hrefs', () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems }
    })

    const links = wrapper.findAll('a')
    expect(links[0].attributes('href')).toBe('#home')
    expect(links[1].attributes('href')).toBe('#features')
  })

  it('emits item-click event when item is clicked', async () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems }
    })

    await wrapper.findAll('.nav-link')[0].trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    const emitted = wrapper.emitted('item-click') as any[][]
    expect(emitted[0][0].item).toEqual(mockItems[0])
  })

  it('does not emit item-click for disabled items', async () => {
    const wrapper = mount(VibeNav, {
      props: { items: mockItems }
    })

    await wrapper.findAll('.nav-link')[2].trigger('click')

    expect(wrapper.emitted('item-click')).toBeFalsy()
  })
})
