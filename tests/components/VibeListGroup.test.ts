import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeListGroup from '../../src/components/VibeListGroup.vue'
import type { ListGroupItem } from '../../src/types'

describe('VibeListGroup', () => {
  const mockItems: ListGroupItem[] = [
    { text: 'Item 1' },
    { text: 'Item 2', active: true },
    { text: 'Item 3', disabled: true },
    { text: 'Item 4', variant: 'success' }
  ]

  it('renders list group with correct structure', () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    expect(wrapper.find('.list-group').exists()).toBe(true)
    expect(wrapper.findAll('.list-group-item')).toHaveLength(4)
  })

  it('renders all items with text', () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('Item 2')
    expect(wrapper.text()).toContain('Item 3')
  })

  it('marks active item correctly', () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    const items = wrapper.findAll('.list-group-item')
    expect(items[1].classes()).toContain('active')
  })

  it('marks disabled item correctly', () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    const items = wrapper.findAll('.list-group-item')
    expect(items[2].classes()).toContain('disabled')
  })

  it('applies variant classes', () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    const items = wrapper.findAll('.list-group-item')
    expect(items[3].classes()).toContain('list-group-item-success')
  })

  it('applies flush class', () => {
    const wrapper = mount(VibeListGroup, {
      props: {
        items: mockItems,
        flush: true
      }
    })

    expect(wrapper.find('.list-group').classes()).toContain('list-group-flush')
  })

  it('applies horizontal class', () => {
    const wrapper = mount(VibeListGroup, {
      props: {
        items: mockItems,
        horizontal: true
      }
    })

    expect(wrapper.find('.list-group').classes()).toContain('list-group-horizontal')
  })

  it('applies responsive horizontal class', () => {
    const wrapper = mount(VibeListGroup, {
      props: {
        items: mockItems,
        horizontal: 'md'
      }
    })

    expect(wrapper.find('.list-group').classes()).toContain('list-group-horizontal-md')
  })

  it('applies numbered class', () => {
    const wrapper = mount(VibeListGroup, {
      props: {
        items: mockItems,
        numbered: true
      }
    })

    expect(wrapper.find('.list-group').classes()).toContain('list-group-numbered')
  })

  it('renders with ol tag when numbered', () => {
    const wrapper = mount(VibeListGroup, {
      props: {
        items: mockItems,
        numbered: true,
        tag: 'ol'
      }
    })

    expect(wrapper.find('ol').exists()).toBe(true)
  })

  it('renders links for items with href', () => {
    const items: ListGroupItem[] = [
      { text: 'Link 1', href: '#link1' },
      { text: 'Link 2', href: '#link2' }
    ]

    const wrapper = mount(VibeListGroup, {
      props: { items }
    })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
    expect(links[0].attributes('href')).toBe('#link1')
  })

  it('emits item-click event when item is clicked', async () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    await wrapper.findAll('.list-group-item')[0].trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
  })

  it('does not emit item-click for disabled items', async () => {
    const wrapper = mount(VibeListGroup, {
      props: { items: mockItems }
    })

    await wrapper.findAll('.list-group-item')[2].trigger('click')

    expect(wrapper.emitted('item-click')).toBeFalsy()
  })
})
