import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { bindTooltip } from '../../../src/components/chart/chartTooltip'
import { createMockCtx } from '../../mocks/canvasMock'
import type { TooltipHit } from '../../../src/components/chart/chartTypes'

let canvas: HTMLCanvasElement
let ctx: ReturnType<typeof createMockCtx>

beforeEach(() => {
  canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.getBoundingClientRect = vi.fn(
    () =>
      ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
        right: 400,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }) as DOMRect
  )
  ctx = createMockCtx()
  vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('bindTooltip', () => {
  it('returns cleanup function', () => {
    const cleanup = bindTooltip(canvas, () => null, vi.fn())
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('calls redraw on mousemove', () => {
    const redraw = vi.fn()
    bindTooltip(canvas, () => null, redraw)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    expect(redraw).toHaveBeenCalled()
  })

  it('calls hitTest on mousemove', () => {
    const hitTest = vi.fn(() => null)
    bindTooltip(canvas, hitTest, vi.fn())
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    expect(hitTest).toHaveBeenCalledWith(50, 50)
  })

  it('calls redraw on mouseleave', () => {
    const redraw = vi.fn()
    bindTooltip(canvas, () => null, redraw)
    canvas.dispatchEvent(new MouseEvent('mouseleave'))
    expect(redraw).toHaveBeenCalled()
  })

  it('cleanup removes all listeners', () => {
    const hitTest = vi.fn(() => null)
    const redraw = vi.fn()
    const cleanup = bindTooltip(canvas, hitTest, redraw)
    cleanup()
    redraw.mockClear()
    hitTest.mockClear()
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    canvas.dispatchEvent(new MouseEvent('mouseleave'))
    expect(hitTest).not.toHaveBeenCalled()
    expect(redraw).not.toHaveBeenCalled()
  })

  it('draws tooltip text when hitTest returns a hit', () => {
    const hit: TooltipHit = { datasetIndex: 0, pointIndex: 1, value: 42, label: 'Jan' }
    bindTooltip(canvas, () => hit, vi.fn())
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
    expect(ctx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Jan'),
      expect.any(Number),
      expect.any(Number)
    )
  })
})
