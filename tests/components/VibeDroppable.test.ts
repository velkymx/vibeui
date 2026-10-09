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

  // #234 K2: a keyboard-armed drag (see VibeDraggable) drops via Enter on a
  // focused target through the same commit path as pointer drop.
  describe('keyboard drop (#234)', () => {
    it('is focusable', () => {
      const wrapper = mount(VibeDroppable)
      expect(wrapper.find('.vibe-droppable').attributes('tabindex')).toBe('0')
      wrapper.unmount()
    })

    it('Enter drops the armed payload and emits drop', async () => {
      startDrag('default')
      const wrapper = mount(VibeDroppable)
      await wrapper.find('.vibe-droppable').trigger('keydown', { key: 'Enter' })
      const emitted = wrapper.emitted('drop') as unknown[][] | undefined
      expect(emitted).toBeDefined()
      expect(emitted!).toHaveLength(1)
      expect(emitted![0][0]).toMatchObject({ payload: { _test: true }, group: 'default' })
      wrapper.unmount()
    })

    it('Enter with no armed drag emits nothing', async () => {
      const wrapper = mount(VibeDroppable)
      await wrapper.find('.vibe-droppable').trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('drop')).toBeUndefined()
      wrapper.unmount()
    })

    it('Enter ignores a wrong-group armed drag', async () => {
      startDrag('other')
      const wrapper = mount(VibeDroppable, { props: { group: 'mine' } })
      await wrapper.find('.vibe-droppable').trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('drop')).toBeUndefined()
      wrapper.unmount()
    })

    it('disabled target is not focusable and Enter emits nothing', async () => {
      startDrag('default')
      const wrapper = mount(VibeDroppable, { props: { disabled: true } })
      expect(wrapper.find('.vibe-droppable').attributes('tabindex')).toBeUndefined()
      await wrapper.find('.vibe-droppable').trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('drop')).toBeUndefined()
      wrapper.unmount()
    })
  })
})
