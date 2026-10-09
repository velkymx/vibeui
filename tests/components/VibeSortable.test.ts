import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import VibeSortable from '../../src/components/VibeSortable.vue'

const makeHarness = (initial: string[]) =>
  defineComponent({
    components: { VibeSortable },
    setup() {
      const items = ref([...initial])
      return { items }
    },
    render() {
      return h(
        VibeSortable as never,
        {
          modelValue: this.items,
          'onUpdate:modelValue': (v: string[]) => {
            this.items = v
          }
        },
        {
          default: ({ item, index }: { item: string; index: number }) =>
            h('div', { class: 'sortable-item', 'data-idx': index }, item)
        }
      )
    }
  })

const fireDragSequence = async (
  fromEl: Element,
  toEl: Element
) => {
  const dataTransfer = new DataTransfer()
  fromEl.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer }))
  toEl.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer }))
  toEl.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer, cancelable: true }))
  toEl.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }))
  fromEl.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer }))
  await Promise.resolve()
}

describe('VibeSortable', () => {
  it('renders one item per modelValue entry', () => {
    const Harness = makeHarness(['a', 'b', 'c'])
    const wrapper = mount(Harness)
    expect(wrapper.findAll('.sortable-item')).toHaveLength(3)
    expect(wrapper.text()).toContain('a')
    expect(wrapper.text()).toContain('c')
  })

  it('items are draggable', () => {
    const Harness = makeHarness(['a', 'b'])
    const wrapper = mount(Harness)
    const items = wrapper.findAll('[data-vibe-sortable-item]')
    expect(items).toHaveLength(2)
    expect(items[0].attributes('draggable')).toBe('true')
  })

  it('dragging item 0 onto item 2 reorders the array', async () => {
    const Harness = makeHarness(['a', 'b', 'c'])
    const wrapper = mount(Harness)
    const items = wrapper.findAll('[data-vibe-sortable-item]')

    await fireDragSequence(items[0].element, items[2].element)

    const vm = wrapper.vm as unknown as { items: string[] }
    expect(vm.items).toEqual(['b', 'c', 'a'])
  })

  it('dragging item 2 onto item 0 reorders the array', async () => {
    const Harness = makeHarness(['a', 'b', 'c'])
    const wrapper = mount(Harness)
    const items = wrapper.findAll('[data-vibe-sortable-item]')

    await fireDragSequence(items[2].element, items[0].element)

    const vm = wrapper.vm as unknown as { items: string[] }
    expect(vm.items).toEqual(['c', 'a', 'b'])
  })

  it('dropping on the same item is a no-op', async () => {
    const Harness = makeHarness(['a', 'b', 'c'])
    const wrapper = mount(Harness)
    const items = wrapper.findAll('[data-vibe-sortable-item]')

    await fireDragSequence(items[1].element, items[1].element)

    const vm = wrapper.vm as unknown as { items: string[] }
    expect(vm.items).toEqual(['a', 'b', 'c'])
  })

  it('emits update:modelValue and reorder on successful drop', async () => {
    const wrapper = mount(VibeSortable, {
      props: { modelValue: ['x', 'y', 'z'] },
      slots: {
        default: `<template #default="{ item }"><span class="i">{{ item }}</span></template>`
      }
    })
    const items = wrapper.findAll('[data-vibe-sortable-item]')

    await fireDragSequence(items[0].element, items[1].element)

    const updated = wrapper.emitted('update:modelValue') as string[][][]
    expect(updated).toBeTruthy()
    expect(updated[0][0]).toEqual(['y', 'x', 'z'])

    const reorder = wrapper.emitted('reorder') as Array<[unknown]>
    expect(reorder).toBeTruthy()
  })

  it('disabled prop prevents reorder', async () => {
    const Harness = defineComponent({
      components: { VibeSortable },
      setup() {
        const items = ref(['a', 'b', 'c'])
        return { items }
      },
      render() {
        return h(
          VibeSortable as never,
          {
            modelValue: this.items,
            disabled: true,
            'onUpdate:modelValue': (v: string[]) => {
              this.items = v
            }
          },
          { default: ({ item }: { item: string }) => h('span', { class: 'i' }, item) }
        )
      }
    })
    const wrapper = mount(Harness)
    const items = wrapper.findAll('[data-vibe-sortable-item]')
    expect(items[0].attributes('draggable')).toBe('false')

    await fireDragSequence(items[0].element, items[2].element)
    const vm = wrapper.vm as unknown as { items: string[] }
    expect(vm.items).toEqual(['a', 'b', 'c'])
  })

  it('accepts itemKey prop and renders items', () => {
    const items = [
      { id: 'x', label: 'X' },
      { id: 'y', label: 'Y' },
      { id: 'z', label: 'Z' }
    ]
    const wrapper = mount(VibeSortable as any, {
      props: { modelValue: items, itemKey: 'id' },
      slots: { default: ({ item }: { item: { id: string; label: string } }) => item.label }
    })
    const nodes = wrapper.findAll('[data-vibe-sortable-item]')
    expect(nodes).toHaveLength(3)
    expect(nodes.map(n => n.text())).toEqual(['X', 'Y', 'Z'])
  })

  // #234 K2: rows are keyboard-reorderable (Space grabs, arrows move,
  // Escape cancels) through the same commit path as pointer drag.
  describe('keyboard reorder (#234)', () => {
    const rowsOf = (wrapper: { findAll: (s: string) => { attributes: (a: string) => string | undefined }[] }) =>
      wrapper.findAll('[data-vibe-sortable-item]')

    it('rows are focusable listitems with grab state', () => {
      const Harness = makeHarness(['a', 'b'])
      const wrapper = mount(Harness)
      const rows = rowsOf(wrapper)
      expect(rows[0].attributes('tabindex')).toBe('0')
      expect(rows[0].attributes('role')).toBe('listitem')
      expect(rows[0].attributes('aria-grabbed')).toBeUndefined()
      wrapper.unmount()
    })

    it('Space grabs, ArrowDown moves, and the model commits like a drop', async () => {
      const Harness = makeHarness(['a', 'b', 'c'])
      const wrapper = mount(Harness, { attachTo: document.body })
      const row = () => wrapper.findAll('[data-vibe-sortable-item]')[0]
      ;(row().element as HTMLElement).focus()
      await row().trigger('keydown', { key: ' ' })
      expect(row().attributes('aria-grabbed')).toBe('true')
      await row().trigger('keydown', { key: 'ArrowDown' })
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('[data-vibe-sortable-item]').map((n) => n.text())).toEqual([
        'b',
        'a',
        'c'
      ])
      const reorder = wrapper.findComponent(VibeSortable).emitted('reorder') as
        | { from: number; to: number }[][]
        | undefined
      expect(reorder).toBeDefined()
      expect(reorder![reorder!.length - 1][0]).toMatchObject({ from: 0, to: 1 })
      // Focus follows the moved row.
      expect(document.activeElement).toBe(wrapper.findAll('[data-vibe-sortable-item]')[1].element)
      wrapper.unmount()
    })

    it('Escape cancels the grab without reordering', async () => {
      const Harness = makeHarness(['a', 'b'])
      const wrapper = mount(Harness)
      const row = () => wrapper.findAll('[data-vibe-sortable-item]')[0]
      await row().trigger('keydown', { key: ' ' })
      await row().trigger('keydown', { key: 'Escape' })
      await row().trigger('keydown', { key: 'ArrowDown' })
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('[data-vibe-sortable-item]').map((n) => n.text())).toEqual(['a', 'b'])
      expect(wrapper.findComponent(VibeSortable).emitted('reorder')).toBeUndefined()
      wrapper.unmount()
    })

    it('exposes move() for programmatic reorder', async () => {
      const Harness = makeHarness(['a', 'b', 'c'])
      const wrapper = mount(Harness)
      const sortable = wrapper.findComponent(VibeSortable)
      ;(sortable.vm as unknown as { move: (from: number, to: number) => void }).move(2, 0)
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('[data-vibe-sortable-item]').map((n) => n.text())).toEqual([
        'c',
        'a',
        'b'
      ])
      wrapper.unmount()
    })

    it('disabled rows are not focusable and ignore keys', async () => {
      const Harness = defineComponent({
        components: { VibeSortable },
        setup() {
          const items = ref(['a', 'b'])
          return { items }
        },
        render() {
          return h(
            VibeSortable as never,
            {
              modelValue: this.items,
              disabled: true,
              'onUpdate:modelValue': (v: string[]) => {
                this.items = v
              }
            },
            {
              default: ({ item }: { item: string }) => h('div', item)
            }
          )
        }
      })
      const wrapper = mount(Harness)
      const row = wrapper.findAll('[data-vibe-sortable-item]')[0]
      expect(row.attributes('tabindex')).toBeUndefined()
      await row.trigger('keydown', { key: ' ' })
      await row.trigger('keydown', { key: 'ArrowDown' })
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('[data-vibe-sortable-item]').map((n) => n.text())).toEqual(['a', 'b'])
      wrapper.unmount()
    })
  })
})
