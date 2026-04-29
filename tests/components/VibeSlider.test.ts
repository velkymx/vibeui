import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeSlider from '../../src/components/VibeSlider.vue'

describe('VibeSlider', () => {
  describe('single value', () => {
    it('renders one handle by default', () => {
      const wrapper = mount(VibeSlider, { props: { modelValue: 50 } })
      expect(wrapper.findAll('[role="slider"]')).toHaveLength(1)
    })

    it('reflects modelValue in aria-valuenow', () => {
      const wrapper = mount(VibeSlider, { props: { modelValue: 75, min: 0, max: 100 } })
      expect(wrapper.find('[role="slider"]').attributes('aria-valuenow')).toBe('75')
    })

    it('clamps modelValue to [min, max]', () => {
      const wrapper = mount(VibeSlider, { props: { modelValue: 200, min: 0, max: 100 } })
      expect(wrapper.find('[role="slider"]').attributes('aria-valuenow')).toBe('100')
    })

    it('keyboard ArrowRight increments by step', async () => {
      const wrapper = mount(VibeSlider, { props: { modelValue: 50, step: 5 } })
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(55)
    })

    it('keyboard ArrowLeft decrements by step', async () => {
      const wrapper = mount(VibeSlider, { props: { modelValue: 50, step: 5 } })
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(45)
    })

    it('keyboard Home / End jump to min / max', async () => {
      const wrapper = mount(VibeSlider, { props: { modelValue: 50, min: 0, max: 100 } })
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'Home' })
      let emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[0][0]).toBe(0)

      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'End' })
      emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[1][0]).toBe(100)
    })

    it('does not emit beyond max', async () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 100, min: 0, max: 100, step: 1 }
      })
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeFalsy()
    })

    it('does not emit when disabled', async () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 50, disabled: true }
      })
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('range mode', () => {
    it('renders two handles when range=true', () => {
      const wrapper = mount(VibeSlider, {
        props: { range: true, modelValue: [20, 80] }
      })
      expect(wrapper.findAll('[role="slider"]')).toHaveLength(2)
    })

    it('low handle ArrowRight does not exceed high handle', async () => {
      const wrapper = mount(VibeSlider, {
        props: { range: true, modelValue: [50, 51], step: 5 }
      })
      const lowHandle = wrapper.findAll('[role="slider"]')[0]
      await lowHandle.trigger('keydown', { key: 'ArrowRight' })
      const emitted = wrapper.emitted('update:modelValue') as Array<[[number, number]]>
      // Should not pass the high handle
      expect(emitted?.[0]?.[0]?.[0] ?? 50).toBeLessThanOrEqual(51)
    })

    it('high handle ArrowLeft does not pass low handle', async () => {
      const wrapper = mount(VibeSlider, {
        props: { range: true, modelValue: [50, 51], step: 5 }
      })
      const highHandle = wrapper.findAll('[role="slider"]')[1]
      await highHandle.trigger('keydown', { key: 'ArrowLeft' })
      const emitted = wrapper.emitted('update:modelValue') as Array<[[number, number]]>
      expect(emitted?.[0]?.[0]?.[1] ?? 51).toBeGreaterThanOrEqual(50)
    })

    it('emits [number, number] tuple from range mode', async () => {
      const wrapper = mount(VibeSlider, {
        props: { range: true, modelValue: [10, 90], step: 5 }
      })
      await wrapper.findAll('[role="slider"]')[0].trigger('keydown', { key: 'ArrowRight' })
      const emitted = wrapper.emitted('update:modelValue') as Array<[[number, number]]>
      expect(Array.isArray(emitted[0][0])).toBe(true)
      expect(emitted[0][0]).toEqual([15, 90])
    })
  })

  describe('orientation', () => {
    it('vertical adds vibe-slider-vertical class', () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 50, vertical: true }
      })
      expect(wrapper.find('.vibe-slider').classes()).toContain('vibe-slider-vertical')
    })
  })

  describe('a11y', () => {
    it('handles have aria-valuemin / aria-valuemax', () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 25, min: 0, max: 100 }
      })
      const handle = wrapper.find('[role="slider"]')
      expect(handle.attributes('aria-valuemin')).toBe('0')
      expect(handle.attributes('aria-valuemax')).toBe('100')
      expect(handle.attributes('tabindex')).toBe('0')
    })

    it('aria-disabled when disabled', () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 50, disabled: true }
      })
      expect(wrapper.find('[role="slider"]').attributes('aria-disabled')).toBe('true')
    })
  })
})
