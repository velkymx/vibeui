import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeBreadcrumb from '../../src/components/VibeBreadcrumb.vue'
import type { BreadcrumbItem } from '../../src/types'

describe('VibeBreadcrumb', () => {
  const mockItems: BreadcrumbItem[] = [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Details', active: true }
  ]

  it('renders breadcrumb with correct structure', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.find('.breadcrumb').exists()).toBe(true)
    expect(wrapper.findAll('.breadcrumb-item')).toHaveLength(3)
  })

  it('renders all items correctly', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Products')
    expect(wrapper.text()).toContain('Details')
  })

  it('marks active item correctly', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    const items = wrapper.findAll('.breadcrumb-item')
    expect(items[2].classes()).toContain('active')
    expect(items[2].attributes('aria-current')).toBe('page')
  })

  it('renders links for items with href', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2) // Only first two items have href
    expect(links[0].attributes('href')).toBe('/')
    expect(links[1].attributes('href')).toBe('/products')
  })

  it('renders span for active items', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    const items = wrapper.findAll('.breadcrumb-item')
    expect(items[2].find('span').exists()).toBe(true)
  })

  it('emits item-click event when non-active item is clicked', async () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    await wrapper.findAll('a')[0].trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    const emitted = wrapper.emitted('item-click') as any[][]
    expect(emitted[0][0].item).toEqual(mockItems[0])
    expect(emitted[0][0].index).toBe(0)
  })

  it('does not emit item-click for active items', async () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems }
    })

    const activeItem = wrapper.findAll('.breadcrumb-item')[2]
    await activeItem.trigger('click')

    expect(wrapper.emitted('item-click')).toBeFalsy()
  })

  it('sets custom aria-label', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: {
        items: mockItems,
        ariaLabel: 'Custom navigation'
      }
    })

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Custom navigation')
  })

  it('renders custom item slot', () => {
    const wrapper = mount(VibeBreadcrumb, {
      props: { items: mockItems },
      slots: {
        item: '<template #item="{ item }"><strong>{{ item.text }}</strong></template>'
      }
    })

    expect(wrapper.find('strong').exists()).toBe(true)
  })
})
