import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeResizable from '../../src/components/VibeResizable.vue'

const fireResize = async (
  handle: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) => {
  const pid = 1
  handle.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true,
    pointerId: pid,
    clientX: startX,
    clientY: startY
  }))
  handle.dispatchEvent(new PointerEvent('pointermove', {
    bubbles: true,
    pointerId: pid,
    clientX: endX,
    clientY: endY
  }))
  handle.dispatchEvent(new PointerEvent('pointerup', {
    bubbles: true,
    pointerId: pid,
    clientX: endX,
    clientY: endY
  }))
  await Promise.resolve()
  // Drag updates coalesce onto rAF: wait a frame so assertions observe them.
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

describe('VibeResizable', () => {
  it('renders with default se handle', () => {
    const wrapper = mount(VibeResizable, { props: { width: 100, height: 100 } })
    const handles = wrapper.findAll('[data-handle]')
    expect(handles).toHaveLength(1)
    expect(handles[0].attributes('data-handle')).toBe('se')
  })

  it('renders all 8 handles when configured', () => {
    const wrapper = mount(VibeResizable, {
      props: {
        width: 100,
        height: 100,
        handles: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
      }
    })
    expect(wrapper.findAll('[data-handle]')).toHaveLength(8)
  })

  it('applies width and height styles from props', () => {
    const wrapper = mount(VibeResizable, { props: { width: 250, height: 175 } })
    const root = wrapper.find('.vibe-resizable').element as HTMLElement
    expect(root.style.width).toBe('250px')
    expect(root.style.height).toBe('175px')
  })

  it('dragging se handle increases width and height', async () => {
    const wrapper = mount(VibeResizable, {
      props: { width: 100, height: 100 },
      attachTo: document.body
    })
    const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
    await fireResize(handle, 0, 0, 50, 30)

    const updates = wrapper.emitted('update:width') as number[][]
    expect(updates[updates.length - 1][0]).toBe(150)
    const heightUpdates = wrapper.emitted('update:height') as number[][]
    expect(heightUpdates[heightUpdates.length - 1][0]).toBe(130)

    wrapper.unmount()
  })

  it('clamps to minWidth / minHeight', async () => {
    const wrapper = mount(VibeResizable, {
      props: { width: 100, height: 100, minWidth: 50, minHeight: 50 },
      attachTo: document.body
    })
    const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
    await fireResize(handle, 0, 0, -200, -200)

    const updates = wrapper.emitted('update:width') as number[][]
    const last = updates[updates.length - 1][0]
    expect(last).toBe(50)
    wrapper.unmount()
  })

  it('snaps to grid', async () => {
    const wrapper = mount(VibeResizable, {
      props: { width: 100, height: 100, grid: 10 },
      attachTo: document.body
    })
    const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
    await fireResize(handle, 0, 0, 23, 0)
    const updates = wrapper.emitted('update:width') as number[][]
    const last = updates[updates.length - 1][0]
    expect(last % 10).toBe(0)
    wrapper.unmount()
  })

  it('emits resizestart, updates, resize, resizeend in order (coalesced per frame)', async () => {
    const wrapper = mount(VibeResizable, {
      props: { width: 100, height: 100 },
      attachTo: document.body
    })
    const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
    await fireResize(handle, 0, 0, 20, 20)

    expect(wrapper.emitted('resizestart')).toBeTruthy()
    // `resize` rides the coalesced frame (not each pointermove): live drag
    // signal with the handle payload, the commit rides resizeend.
    const resizes = wrapper.emitted('resize') as { width: number; height: number; handle: string }[][]
    expect(resizes).toBeDefined()
    expect(resizes[resizes.length - 1][0]).toEqual({ width: 120, height: 120, handle: 'se' })
    expect(wrapper.emitted('update:width')).toBeTruthy()
    expect(wrapper.emitted('resizeend')).toBeTruthy()
    wrapper.unmount()
  })

  it('aspectRatio 1 keeps width === height', async () => {
    const wrapper = mount(VibeResizable, {
      props: { width: 100, height: 100, aspectRatio: 1 },
      attachTo: document.body
    })
    const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
    await fireResize(handle, 0, 0, 50, 0)

    const widths = wrapper.emitted('update:width') as number[][]
    const heights = wrapper.emitted('update:height') as number[][]
    expect(widths[widths.length - 1][0]).toBe(150)
    expect(heights[heights.length - 1][0]).toBe(150)
    wrapper.unmount()
  })

  it('disabled prevents resize', async () => {
    const wrapper = mount(VibeResizable, {
      props: { width: 100, height: 100, disabled: true },
      attachTo: document.body
    })
    const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
    await fireResize(handle, 0, 0, 50, 50)

    expect(wrapper.emitted('resize')).toBeFalsy()
    wrapper.unmount()
  })

  describe('H9 external prop sync', () => {
    it('updates internal width when props.width changes', async () => {
      const wrapper = mount(VibeResizable, {
        props: { width: 100, height: 100 }
      })

      await wrapper.setProps({ width: 250 })
      const root = wrapper.find('.vibe-resizable').element as HTMLElement
      expect(root.style.width).toBe('250px')
    })

    it('updates internal height when props.height changes', async () => {
      const wrapper = mount(VibeResizable, {
        props: { width: 100, height: 100 }
      })

      await wrapper.setProps({ height: 175 })
      const root = wrapper.find('.vibe-resizable').element as HTMLElement
      expect(root.style.height).toBe('175px')
    })

    it('does not emit update events when external prop drives the change', async () => {
      const wrapper = mount(VibeResizable, {
        props: { width: 100, height: 100 }
      })

      await wrapper.setProps({ width: 200 })
      // External change should NOT loop emit back through update:width
      expect(wrapper.emitted('update:width')).toBeFalsy()
    })
  })

  // #227: pointermove bursts coalesce onto one frame (one emit set per frame,
  // last event wins); release delivers the exact final size plus resizeend.
  describe('drag coalescing (#227)', () => {
    const stubRaf = () => {
      const queue: FrameRequestCallback[] = []
      const raf = window.requestAnimationFrame
      const caf = window.cancelAnimationFrame
      window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
        queue.push(cb)
        return queue.length
      }) as typeof window.requestAnimationFrame
      window.cancelAnimationFrame = (() => {}) as typeof window.cancelAnimationFrame
      return {
        restore: () => {
          window.requestAnimationFrame = raf
          window.cancelAnimationFrame = caf
        },
        flushFrames: () => {
          while (queue.length > 0) queue.shift()!(16)
        }
      }
    }

    const pid = 7
    const move = (handle: HTMLElement, x: number, y: number) =>
      handle.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, pointerId: pid, clientX: x, clientY: y })
      )

    it('coalesces a burst of moves into one update per frame', async () => {
      const raf = stubRaf()
      try {
        const wrapper = mount(VibeResizable, {
          props: { width: 100, height: 100 },
          attachTo: document.body
        })
        const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
        handle.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, pointerId: pid, clientX: 0, clientY: 0 })
        )
        move(handle, 10, 10)
        move(handle, 20, 20)
        move(handle, 50, 30)
        // Queued, nothing emitted yet.
        expect(wrapper.emitted('update:width')).toBeUndefined()

        raf.flushFrames()
        await wrapper.vm.$nextTick()
        const updates = wrapper.emitted('update:width') as number[][] | undefined
        expect(updates).toBeDefined()
        expect(updates!).toHaveLength(1)
        // Last event wins: 100 + 50.
        expect(updates![0][0]).toBe(150)
        // One coalesced frame carries exactly one live resize with the handle.
        const resizes = wrapper.emitted('resize') as unknown[][] | undefined
        expect(resizes).toHaveLength(1)
        expect(resizes![0][0]).toEqual({ width: 150, height: 130, handle: 'se' })
        wrapper.unmount()
      } finally {
        raf.restore()
      }
    })

    it('release delivers the exact final size with resize plus one resizeend', async () => {
      const raf = stubRaf()
      try {
        const wrapper = mount(VibeResizable, {
          props: { width: 100, height: 100 },
          attachTo: document.body
        })
        const handle = wrapper.find('[data-handle="se"]').element as HTMLElement
        handle.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, pointerId: pid, clientX: 0, clientY: 0 })
        )
        move(handle, 50, 30)
        handle.dispatchEvent(
          new PointerEvent('pointerup', { bubbles: true, pointerId: pid, clientX: 50, clientY: 30 })
        )
        raf.flushFrames()
        await wrapper.vm.$nextTick()

        const updates = wrapper.emitted('update:width') as number[][]
        expect(updates[updates.length - 1][0]).toBe(150)
        // The release flush is the drag final frame: one resize, then the commit.
        const resizes = wrapper.emitted('resize') as unknown[][]
        expect(resizes).toHaveLength(1)
        expect(resizes[0][0]).toEqual({ width: 150, height: 130, handle: 'se' })
        expect(wrapper.emitted('resizeend')).toHaveLength(1)
        wrapper.unmount()
      } finally {
        raf.restore()
      }
    })
  })
})
