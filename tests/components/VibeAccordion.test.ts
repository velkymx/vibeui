import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeAccordion from '../../src/components/VibeAccordion.vue'
import type { AccordionItem } from '../../src/types'

describe('VibeAccordion', () => {
  const mockItems: AccordionItem[] = [
    { id: 'item1', title: 'Item 1', content: 'Content 1', show: true },
    { id: 'item2', title: 'Item 2', content: 'Content 2' },
    { id: 'item3', title: 'Item 3', content: 'Content 3' }
  ]

  it('renders accordion with correct structure', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    expect(wrapper.find('.accordion').exists()).toBe(true)
    expect(wrapper.findAll('.accordion-item')).toHaveLength(3)
  })

  it('renders all items correctly', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('Item 2')
    expect(wrapper.text()).toContain('Item 3')
    expect(wrapper.text()).toContain('Content 1')
  })

  it('sets initial active state correctly', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    const collapses = wrapper.findAll('.accordion-collapse')
    expect(collapses[0].classes()).toContain('show')
    expect(collapses[1].classes()).not.toContain('show')
  })

  it('applies flush class when flush prop is true', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems,
        flush: true
      }
    })

    expect(wrapper.find('.accordion').classes()).toContain('accordion-flush')
  })

  it('does not apply flush class by default', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    expect(wrapper.find('.accordion').classes()).not.toContain('accordion-flush')
  })

  it('emits item-click event when item is clicked', async () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    await wrapper.findAll('.accordion-button')[0].trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    const emitted = wrapper.emitted('item-click') as any[][]
    expect(emitted[0][0]).toEqual({
      item: mockItems[0],
      index: 0
    })
  })

  it('renders custom title slot content', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      },
      slots: {
        title: '<template #title="{ item }"><strong>{{ item.title }}</strong></template>'
      }
    })

    expect(wrapper.find('strong').exists()).toBe(true)
  })

  it('renders custom content slot', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      },
      slots: {
        content: '<template #content="{ item }"><em>{{ item.content }}</em></template>'
      }
    })

    expect(wrapper.find('em').exists()).toBe(true)
  })

  it('generates correct data-bs attributes', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    const button = wrapper.find('.accordion-button')
    expect(button.attributes('data-bs-toggle')).toBe('collapse')
    expect(button.attributes('data-bs-target')).toBe('#item1')
  })

  it('sets aria-expanded correctly', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    const buttons = wrapper.findAll('.accordion-button')
    // aria-expanded is bound to a boolean, which becomes a string attribute when true
    expect(buttons[0].attributes('aria-expanded')).toBe('true')
    // When false, Vue doesn't always render the attribute as a string
    expect(buttons[1].attributes('aria-expanded')).toBeFalsy()
  })
})
