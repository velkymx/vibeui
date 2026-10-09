import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDroppable from '../../src/components/VibeDroppable.vue'
import { setActiveDrag, clearActiveDrag } from '../../src/components/dndStore'

// Simulate a VibeDraggable drag being active for a given group
const startDrag = (group = 'default') => setActiveDrag({ _test: true }, group)
const endDrag = () => clearActiveDrag()

describe('VibeDroppable', () => {
  afterEach(() => {
    endDrag()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeDroppable)
    expect(wrapper.find('.vibe-droppable').exists()).toBe(true)
  })

  it('sets isOver on dragenter', async () => {
    startDrag('default')
    const wrapper = mount(VibeDroppable)
    await wrapper.find('.vibe-droppable').trigger('dragenter')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(true)
  })

  it('clears isOver on dragleave', async () => {
    startDrag('default')
    const wrapper = mount(VibeDroppable)
    await wrapper.find('.vibe-droppable').trigger('dragenter')
    await wrapper.find('.vibe-droppable').trigger('dragleave')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(false)
  })

  it('resets dragCounter and isOver when disabled flips true mid-drag', async () => {
    startDrag('default')
    const wrapper = mount(VibeDroppable, {
      props: { disabled: false }
    })

    await wrapper.find('.vibe-droppable').trigger('dragenter')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(true)

    await wrapper.setProps({ disabled: true })

    // After disable: isOver should be cleared
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(false)

    // Re-enable: a fresh drag should work normally (dragCounter = 0)
    await wrapper.setProps({ disabled: false })
    await wrapper.find('.vibe-droppable').trigger('dragenter')
    await wrapper.find('.vibe-droppable').trigger('dragleave')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(false)
  })

  it('ignores external (non-VibeDraggable) dragenter events', async () => {
    // No setActiveDrag called — simulates OS file drag or browser drag
    const wrapper = mount(VibeDroppable)
    await wrapper.find('.vibe-droppable').trigger('dragenter')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(false)
  })

  // #235 W4: dragover must not promise a drop the guards will reject (OS
  // files, wrong-group drags get no drop affordance).
  describe('dragover affordance (#235)', () => {
    it('does not preventDefault for a wrong-group drag', () => {
      startDrag('other')
      const wrapper = mount(VibeDroppable, { props: { group: 'mine' } })
      const event = new DragEvent('dragover', { bubbles: true, cancelable: true })
      wrapper.find('.vibe-droppable').element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
      wrapper.unmount()
    })

    it('does not preventDefault with no active drag (OS file)', () => {
      const wrapper = mount(VibeDroppable)
      const event = new DragEvent('dragover', { bubbles: true, cancelable: true })
      wrapper.find('.vibe-droppable').element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
      wrapper.unmount()
    })

    it('still allows drop for an accepted active drag', () => {
      startDrag('default')
      const wrapper = mount(VibeDroppable)
      const event = new DragEvent('dragover', { bubbles: true, cancelable: true })
      wrapper.find('.vibe-droppable').element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      wrapper.unmount()
    })
  })
})
