import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import VibeListGroup from '../../src/components/VibeListGroup.vue'
import type { ListGroupItem } from '../../src/types'

// #34: rich, interactive rows. Per-item element override (including <button>),
// per-item class passthrough, and multi-action rows via the #item slot.

describe('VibeListGroup rich rows (#34)', () => {
  it('renders a per-item <button> element when item.tag is "button"', () => {
    const items: ListGroupItem[] = [{ text: 'Run', tag: 'button' }]
    const wrapper = mount(VibeListGroup, { props: { items } })
    const btn = wrapper.find('button.list-group-item')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('type')).toBe('button')
  })

  it('sets the native disabled attribute on a disabled button item', () => {
    const items: ListGroupItem[] = [{ text: 'Run', tag: 'button', disabled: true }]
    const wrapper = mount(VibeListGroup, { props: { items } })
    expect(wrapper.find('button.list-group-item').attributes('disabled')).toBeDefined()
  })

  it('passes a per-item class through to the item element', () => {
    const items: ListGroupItem[] = [{ text: 'Item', class: 'my-custom-row d-flex' }]
    const wrapper = mount(VibeListGroup, { props: { items } })
    const el = wrapper.find('.list-group-item')
    expect(el.classes()).toContain('my-custom-row')
    expect(el.classes()).toContain('d-flex')
    // Base class still present.
    expect(el.classes()).toContain('list-group-item')
  })

  it('supports multi-action rows: slot buttons emit their own events and can stop the row click', async () => {
    const onEdit = vi.fn()
    const items: ListGroupItem[] = [{ text: 'Row 1' }]
    const wrapper = mount(VibeListGroup, {
      props: { items },
      slots: {
        item: () => [
          h('span', 'Row 1'),
          h('button', { class: 'edit', onClick: (e: Event) => { e.stopPropagation(); onEdit() } }, 'Edit'),
        ],
      },
    })

    await wrapper.find('button.edit').trigger('click')
    expect(onEdit).toHaveBeenCalledTimes(1)
    // The row-level item-click must not fire when the action button stops propagation.
    expect(wrapper.emitted('item-click')).toBeUndefined()
  })
})
