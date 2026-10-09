import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDraggable from '../../src/components/VibeDraggable.vue'
import VibeDroppable from '../../src/components/VibeDroppable.vue'
import { setActiveDrag, clearActiveDrag } from '../../src/components/dndStore'
import { defineComponent, h } from 'vue'

const fireDragSequence = (fromEl: Element, toEl: Element, dataTransfer = new DataTransfer()) => {
  fromEl.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer }))
  toEl.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer }))
  toEl.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer, cancelable: true }))
  toEl.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }))
  fromEl.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer }))
}

describe('VibeDraggable', () => {
  it('renders with draggable=true by default', () => {
    const wrapper = mount(VibeDraggable, {
      slots: { default: 'item' }
    })
    expect(wrapper.attributes('draggable')).toBe('true')
    expect(wrapper.attributes('data-vibe-draggable')).toBe('')
  })

  it('disabled sets draggable=false', () => {
    const wrapper = mount(VibeDraggable, {
      props: { disabled: true },
      slots: { default: 'item' }
    })
    expect(wrapper.attributes('draggable')).toBe('false')
  })

  it('emits dragstart with payload and group', () => {
    const wrapper = mount(VibeDraggable, {
      props: { payload: { id: 7 }, group: 'cards' },
      slots: { default: 'x' }
    })
    const dt = new DataTransfer()
    wrapper.element.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }))

    const e = wrapper.emitted('dragstart') as Array<[{ payload: unknown; group: string }]>
    expect(e).toBeTruthy()
    expect(e[0][0].payload).toEqual({ id: 7 })
    expect(e[0][0].group).toBe('cards')
  })

  it('exposes is-dragging via slot scope', async () => {
    const Slot = defineComponent({
      components: { VibeDraggable },
      setup: () => () =>
        h(
          VibeDraggable as never,
          { payload: 'p', group: 'g' },
          { default: ({ isDragging }: { isDragging: boolean }) => h('span', { class: isDragging ? 'dragging' : 'idle' }, 'x') }
        )
    })
    const wrapper = mount(Slot)
    expect(wrapper.find('.idle').exists()).toBe(true)
    wrapper.element.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: new DataTransfer() }))
    await Promise.resolve()
    expect(wrapper.find('.dragging').exists()).toBe(true)
  })
})

describe('VibeDroppable', () => {
  it('emits drop with payload from a draggable in the same group', async () => {
    const Pair = defineComponent({
      components: { VibeDraggable, VibeDroppable },
      template: `
        <div>
          <VibeDraggable :payload="{ id: 99 }" group="cards" id="src">drag me</VibeDraggable>
          <VibeDroppable group="cards" id="dst">drop here</VibeDroppable>
        </div>
      `
    })
    const wrapper = mount(Pair, { attachTo: document.body })

    const src = wrapper.find('#src').element
    const dst = wrapper.find('#dst').element
    fireDragSequence(src, dst)
    await Promise.resolve()

    const dropEvents = wrapper.findComponent(VibeDroppable).emitted('drop') as Array<[
      { payload: unknown; group: string }
    ]>
    expect(dropEvents).toBeTruthy()
    expect(dropEvents[0][0].payload).toEqual({ id: 99 })
    expect(dropEvents[0][0].group).toBe('cards')

    wrapper.unmount()
  })

  it('rejects drop from non-matching group', async () => {
    const Pair = defineComponent({
      components: { VibeDraggable, VibeDroppable },
      template: `
        <div>
          <VibeDraggable payload="p" group="A" id="src">x</VibeDraggable>
          <VibeDroppable group="B" id="dst">y</VibeDroppable>
        </div>
      `
    })
    const wrapper = mount(Pair, { attachTo: document.body })

    fireDragSequence(wrapper.find('#src').element, wrapper.find('#dst').element)
    await Promise.resolve()

    const dropEvents = wrapper.findComponent(VibeDroppable).emitted('drop')
    expect(dropEvents).toBeFalsy()
    wrapper.unmount()
  })

  it('acceptGroups whitelist allows multiple groups', async () => {
    const Pair = defineComponent({
      components: { VibeDraggable, VibeDroppable },
      template: `
        <div>
          <VibeDraggable payload="p" group="todo" id="src">x</VibeDraggable>
          <VibeDroppable :accept-groups="['todo', 'done']" group="any" id="dst">y</VibeDroppable>
        </div>
      `
    })
    const wrapper = mount(Pair, { attachTo: document.body })
    fireDragSequence(wrapper.find('#src').element, wrapper.find('#dst').element)
    await Promise.resolve()
    expect(wrapper.findComponent(VibeDroppable).emitted('drop')).toBeTruthy()
    wrapper.unmount()
  })

  it('disabled droppable does not emit drop', async () => {
    const Pair = defineComponent({
      components: { VibeDraggable, VibeDroppable },
      template: `
        <div>
          <VibeDraggable payload="p" group="g" id="src">x</VibeDraggable>
          <VibeDroppable group="g" disabled id="dst">y</VibeDroppable>
        </div>
      `
    })
    const wrapper = mount(Pair, { attachTo: document.body })
    fireDragSequence(wrapper.find('#src').element, wrapper.find('#dst').element)
    await Promise.resolve()
    expect(wrapper.findComponent(VibeDroppable).emitted('drop')).toBeFalsy()
    wrapper.unmount()
  })

  it('toggles is-over slot scope on dragenter/dragleave', async () => {
    const Slot = defineComponent({
      components: { VibeDroppable },
      setup: () => () =>
        h(
          VibeDroppable as never,
          { group: 'g' },
          { default: ({ isOver }: { isOver: boolean }) => h('span', { class: isOver ? 'over' : 'idle' }, 'x') }
        )
    })
    const wrapper = mount(Slot)
    expect(wrapper.find('.idle').exists()).toBe(true)
    // Simulate a VibeDraggable drag being active (required since VibeDroppable
    // now rejects dragenter events that don't originate from a VibeDraggable)
    setActiveDrag({}, 'g')
    wrapper.element.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: new DataTransfer() }))
    await Promise.resolve()
    expect(wrapper.find('.over').exists()).toBe(true)
    wrapper.element.dispatchEvent(new DragEvent('dragleave', { bubbles: true, dataTransfer: new DataTransfer() }))
    await Promise.resolve()
    expect(wrapper.find('.idle').exists()).toBe(true)
    clearActiveDrag()
  })

  // #234 K2: the source is keyboard-armable (Space grabs into the same store
  // the pointer path uses, Escape cancels), so keyboard users can operate it.
  describe('keyboard arm (#234)', () => {
    it('is focusable with grab state', () => {
      const wrapper = mount(VibeDraggable, { slots: { default: 'item' } })
      expect(wrapper.attributes('tabindex')).toBe('0')
      expect(wrapper.attributes('aria-grabbed')).toBe('false')
      wrapper.unmount()
    })

    it('Space arms the store drag, Escape disarms', async () => {
      const wrapper = mount(VibeDraggable, {
        props: { payload: { id: 1 } },
        slots: { default: 'item' },
        attachTo: document.body
      })
      await wrapper.trigger('keydown', { key: ' ' })
      expect(wrapper.attributes('aria-grabbed')).toBe('true')
      const { getActiveDrag } = await import('../../src/components/dndStore')
      expect(getActiveDrag()).toMatchObject({ group: 'default' })
      await wrapper.trigger('keydown', { key: 'Escape' })
      expect(wrapper.attributes('aria-grabbed')).toBe('false')
      expect(getActiveDrag()).toBeNull()
      wrapper.unmount()
    })

    it('disabled source is not focusable and ignores keys', async () => {
      const wrapper = mount(VibeDraggable, {
        props: { disabled: true, payload: { id: 1 } },
        slots: { default: 'item' }
      })
      expect(wrapper.attributes('tabindex')).toBeUndefined()
      await wrapper.trigger('keydown', { key: ' ' })
      const { getActiveDrag } = await import('../../src/components/dndStore')
      expect(getActiveDrag()).toBeNull()
      wrapper.unmount()
    })

    // #234 K2: Space on the source plus Enter on the target commits through
    // the same store and drop emit as a pointer drag.
    it('arms on Space and commits on target Enter', async () => {
      const source = mount(VibeDraggable, {
        props: { payload: { id: 7 } },
        slots: { default: 'item' }
      })
      const target = mount(VibeDroppable)
      await source.trigger('keydown', { key: ' ' })
      await target.find('.vibe-droppable').trigger('keydown', { key: 'Enter' })
      const emitted = target.emitted('drop') as unknown[][] | undefined
      expect(emitted).toBeDefined()
      expect(emitted![0][0]).toMatchObject({ payload: { id: 7 }, group: 'default' })
      source.unmount()
      target.unmount()
      const { getActiveDrag } = await import('../../src/components/dndStore')
      expect(getActiveDrag()).toBeNull()
    })
  })
})
