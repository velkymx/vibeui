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
})
