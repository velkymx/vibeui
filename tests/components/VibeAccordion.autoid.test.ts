import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VibeAccordion from '../../src/components/VibeAccordion.vue'

// #139: AccordionItem.id is optional. Items without an id get a stable, unique
// auto-generated id, used for the panel id and the header's data-bs-target wiring.

describe('VibeAccordion auto id (#139)', () => {
  it('renders panels with unique, non-empty ids when items omit id', async () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        items: [
          { title: 'One', content: 'a' },
          { title: 'Two', content: 'b' },
        ],
      },
    })
    await flushPromises()
    const panels = wrapper.findAll('.accordion-collapse')
    expect(panels).toHaveLength(2)
    const ids = panels.map((p) => p.attributes('id'))
    expect(ids.every((id) => !!id)).toBe(true)
    expect(new Set(ids).size).toBe(2)
  })

  it('wires the header toggle to the resolved panel id', async () => {
    const wrapper = mount(VibeAccordion, {
      props: { items: [{ title: 'One', content: 'a' }] },
    })
    await flushPromises()
    const panelId = wrapper.find('.accordion-collapse').attributes('id')
    const target = wrapper.find('.accordion-button').attributes('data-bs-target')
    expect(target).toBe(`#${panelId}`)
  })

  it('still honors an explicit item id', async () => {
    const wrapper = mount(VibeAccordion, {
      props: { items: [{ id: 'my-panel', title: 'One', content: 'a' }] },
    })
    await flushPromises()
    expect(wrapper.find('.accordion-collapse').attributes('id')).toBe('my-panel')
  })
})
