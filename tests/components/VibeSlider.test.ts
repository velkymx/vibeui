import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

  describe('H10 model shape validation', () => {
    it('warns when range=true but modelValue is a number', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(VibeSlider, {
        props: { range: true, modelValue: 50 }
      })
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('VibeSlider')
      )
      warn.mockRestore()
    })

    it('warns when range=false but modelValue is an array', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(VibeSlider, {
        props: { range: false, modelValue: [10, 20] as unknown as number }
      })
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('VibeSlider')
      )
      warn.mockRestore()
    })
  })

  describe('M9 track click jumps nearest handle', () => {
    it('clicking near the start of the track moves the (only) handle there', async () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 50, min: 0, max: 100, step: 1 },
        attachTo: document.body
      })

      const track = wrapper.find('.vibe-slider-track').element as HTMLElement
      // Stub bounding box: width 100, x 0
      track.getBoundingClientRect = () => ({
        x: 0, y: 0, width: 100, height: 10, top: 0, left: 0, right: 100, bottom: 10, toJSON: () => ({})
      })

      track.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, pointerId: 1, clientX: 10, clientY: 5
      }))
      await Promise.resolve()

      const emitted = wrapper.emitted('update:modelValue') as number[][]
      expect(emitted[emitted.length - 1][0]).toBe(10)
      wrapper.unmount()
    })

    it('range mode: track click moves the nearest handle', async () => {
      const wrapper = mount(VibeSlider, {
        props: { range: true, modelValue: [20, 80], min: 0, max: 100, step: 1 },
        attachTo: document.body
      })
      const track = wrapper.find('.vibe-slider-track').element as HTMLElement
      track.getBoundingClientRect = () => ({
        x: 0, y: 0, width: 100, height: 10, top: 0, left: 0, right: 100, bottom: 10, toJSON: () => ({})
      })

      // Click at 30 — nearest handle is low (20), so low should move to 30
      track.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, pointerId: 1, clientX: 30, clientY: 5
      }))
      await Promise.resolve()

      const emitted = wrapper.emitted('update:modelValue') as Array<[[number, number]]>
      expect(emitted[emitted.length - 1][0]).toEqual([30, 80])
      wrapper.unmount()
    })
  })

  describe('M8 range handles can swap', () => {
    it('low handle pushing past high causes them to swap', async () => {
      const wrapper = mount(VibeSlider, {
        props: { range: true, modelValue: [40, 50], min: 0, max: 100, step: 5 },
        attachTo: document.body
      })

      const lowHandle = wrapper.findAll('[role="slider"]')[0]
      // Press right enough times that the low handle would clearly cross the high
      await lowHandle.trigger('keydown', { key: 'PageUp' }) // +50 steps
      const emitted = wrapper.emitted('update:modelValue') as Array<[[number, number]]>
      const [lo, hi] = emitted[emitted.length - 1][0]
      expect(lo).toBeLessThanOrEqual(hi)
      // The new high should reflect the original low, or the new value, whichever is higher
      expect(hi).toBeGreaterThanOrEqual(50)
      wrapper.unmount()
    })
  })

  describe('H11 divide-by-zero guard', () => {
    // min === max is an invalid config the component renders inert with a DEV warning.
    // Spy console.warn so the expected warning is asserted, not leaked to test output.
    let warnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      warnSpy.mockRestore()
    })

    it('does not produce NaN styles when min === max', async () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 5, min: 5, max: 5 }
      })
      const handle = wrapper.find('[role="slider"]').element as HTMLElement
      expect(handle.style.left).not.toContain('NaN')
      expect(handle.style.left).not.toBe('')
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('must be greater than min'))
    })

    it('keyboard arrow does nothing when range is zero', async () => {
      const wrapper = mount(VibeSlider, {
        props: { modelValue: 5, min: 5, max: 5 }
      })
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  // #198: pointer drag coalesces onto one animation frame (one layout read and
  // one model update per frame), and `change` fires once on release.
  describe('drag coalescing (#198)', () => {
    const fakeRect = {
      left: 0, top: 0, width: 200, height: 20,
      right: 200, bottom: 20, x: 0, y: 0, toJSON: () => ({})
    } as DOMRect

    const stubRaf = () => {
      const queue: FrameRequestCallback[] = []
      const raf = window.requestAnimationFrame
      const caf = window.cancelAnimationFrame
      let nextId = 1
      const ids = new Map<number, FrameRequestCallback>()
      window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
        const id = nextId++
        ids.set(id, cb)
        queue.push(cb)
        return id
      }) as typeof window.requestAnimationFrame
      window.cancelAnimationFrame = ((id: number) => {
        ids.delete(id)
      }) as typeof window.cancelAnimationFrame
      const flushFrames = () => {
        while (queue.length > 0) {
          const cb = queue.shift()!
          cb(16)
        }
      }
      return { restore: () => { window.requestAnimationFrame = raf; window.cancelAnimationFrame = caf }, flushFrames }
    }

    const pointerEvent = (type: string, init: { pointerId: number; clientX: number; clientY?: number }) => {
      const event = new Event(type, { bubbles: true }) as Event & {
        pointerId: number; clientX: number; clientY: number
      }
      event.pointerId = init.pointerId
      event.clientX = init.clientX
      event.clientY = init.clientY ?? 0
      return event
    }

    it('coalesces a burst of pointermoves into one model update per frame', async () => {
      const raf = stubRaf()
      try {
        const wrapper = mount(VibeSlider, { props: { modelValue: 0, min: 0, max: 100 } })
        const track = wrapper.find('.vibe-slider-track').element as HTMLElement
        track.getBoundingClientRect = () => fakeRect
        const handle = wrapper.find('[role="slider"]').element as HTMLElement

        handle.dispatchEvent(pointerEvent('pointerdown', { pointerId: 7, clientX: 10 }))
        // The move/up listeners live on window; the test DOM is detached, so
        // dispatch there directly (a detached track would never bubble up).
        window.dispatchEvent(pointerEvent('pointermove', { pointerId: 7, clientX: 40 }))
        window.dispatchEvent(pointerEvent('pointermove', { pointerId: 7, clientX: 80 }))
        window.dispatchEvent(pointerEvent('pointermove', { pointerId: 7, clientX: 120 }))
        // Moves are queued, nothing emitted yet.
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        raf.flushFrames()
        await wrapper.vm.$nextTick()
        const updates = wrapper.emitted('update:modelValue') as number[][] | undefined
        expect(updates).toBeDefined()
        expect(updates!).toHaveLength(1)
        // Last event wins: 120/200 of [0,100].
        expect(updates![0][0]).toBe(60)

        // Release delivers change exactly once.
        window.dispatchEvent(pointerEvent('pointerup', { pointerId: 7, clientX: 120 }))
        raf.flushFrames()
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('change')).toHaveLength(1)
        wrapper.unmount()
      } finally {
        raf.restore()
      }
    })

    it('emits no change on release without movement', async () => {
      const raf = stubRaf()
      try {
        const wrapper = mount(VibeSlider, { props: { modelValue: 50, min: 0, max: 100 } })
        const track = wrapper.find('.vibe-slider-track').element as HTMLElement
        track.getBoundingClientRect = () => fakeRect
        const handle = wrapper.find('[role="slider"]').element as HTMLElement

        handle.dispatchEvent(pointerEvent('pointerdown', { pointerId: 7, clientX: 100 }))
        window.dispatchEvent(pointerEvent('pointerup', { pointerId: 7, clientX: 100 }))
        raf.flushFrames()
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
        wrapper.unmount()
      } finally {
        raf.restore()
      }
    })
  })
})
