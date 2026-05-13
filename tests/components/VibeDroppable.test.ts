import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDroppable from '../../src/components/VibeDroppable.vue'

describe('VibeDroppable', () => {
  it('renders correctly', () => {
    const wrapper = mount(VibeDroppable)
    expect(wrapper.find('.vibe-droppable').exists()).toBe(true)
  })

  it('sets isOver on dragenter', async () => {
    const wrapper = mount(VibeDroppable)
    await wrapper.find('.vibe-droppable').trigger('dragenter')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(true)
  })

  it('clears isOver on dragleave', async () => {
    const wrapper = mount(VibeDroppable)
    await wrapper.find('.vibe-droppable').trigger('dragenter')
    await wrapper.find('.vibe-droppable').trigger('dragleave')
    expect(wrapper.find('.vibe-droppable-over').exists()).toBe(false)
  })

  it('resets dragCounter and isOver when disabled flips true mid-drag', async () => {
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
})
