import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeSortable from '../../src/components/VibeSortable.vue'

// #130: rows must keep a stable key across reorder so Vue MOVES the DOM node
// instead of re-patching each position's content in place (which would leak a
// row's slot-local state onto whatever item lands in that position).

const nodeShowing = (wrapper: ReturnType<typeof mount>, text: string): Element =>
  wrapper.findAll('[data-vibe-sortable-item]').find((w) => w.text() === text)!.element

describe('VibeSortable stable keys across reorder (#130)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('moves the same DOM node for a row when itemKey is set', async () => {
    const A = { id: 1, name: 'A' }
    const B = { id: 2, name: 'B' }
    const wrapper = mount(VibeSortable, {
      props: { modelValue: [A, B], itemKey: 'id' },
      slots: { default: ({ item }: { item: { name: string } }) => item.name },
    })
    const nodeA = nodeShowing(wrapper, 'A')
    await wrapper.setProps({ modelValue: [B, A] })
    expect(nodeShowing(wrapper, 'A')).toBe(nodeA)
  })

  it('moves the same DOM node for a row even without itemKey (keyed by item identity)', async () => {
    const A = { name: 'A' }
    const B = { name: 'B' }
    const wrapper = mount(VibeSortable, {
      props: { modelValue: [A, B] },
      slots: { default: ({ item }: { item: { name: string } }) => item.name },
    })
    const nodeA = nodeShowing(wrapper, 'A')
    // Reorder with the SAME object references (what onDrop emits via splice).
    await wrapper.setProps({ modelValue: [B, A] })
    expect(nodeShowing(wrapper, 'A')).toBe(nodeA)
  })

  it('warns in development when itemKey is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeSortable, {
      props: { modelValue: [{ name: 'A' }] },
      slots: { default: ({ item }: { item: { name: string } }) => item.name },
    })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('itemKey'))
  })

  it('does not warn when itemKey is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(VibeSortable, {
      props: { modelValue: [{ id: 1, name: 'A' }], itemKey: 'id' },
      slots: { default: ({ item }: { item: { name: string } }) => item.name },
    })
    expect(warn).not.toHaveBeenCalled()
  })

  // #224: an itemKey field missing from the rows must fall back to identity,
  // never to undefined keys (duplicate-key DOM reuse leaks row state).
  it('falls back to identity when itemKey names a missing field', async () => {
    const A = { id: 1, name: 'A' }
    const B = { id: 2, name: 'B' }
    const wrapper = mount(VibeSortable, {
      props: { modelValue: [A, B], itemKey: 'nope' as 'id' },
      slots: { default: ({ item }: { item: { name: string } }) => item.name },
    })
    const nodeA = nodeShowing(wrapper, 'A')
    await wrapper.setProps({ modelValue: [B, A] })
    expect(nodeShowing(wrapper, 'A')).toBe(nodeA)
  })
})
