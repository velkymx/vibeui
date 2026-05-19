import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { bindTooltip } from '../../../src/components/chart/chartTooltip'
import { createMockCtx } from '../../mocks/canvasMock'
import type { TooltipHit } from '../../../src/components/chart/chartTypes'

let container: HTMLDivElement
let canvas: HTMLCanvasElement
let ctx: ReturnType<typeof createMockCtx>

beforeEach(() => {
  container = document.createElement('div')
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
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('bindTooltip', () => {
  it('returns cleanup function', () => {
    const cleanup = bindTooltip(container, canvas, () => null)
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('appends overlay canvas to container', () => {
    bindTooltip(container, canvas, () => null)
    expect(container.lastElementChild?.tagName).toBe('CANVAS')
  })

  it('calls hitTest on mousemove', () => {
    const hitTest = vi.fn(() => null)
    bindTooltip(container, canvas, hitTest)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    expect(hitTest).toHaveBeenCalledWith(50, 50)
  })

  it('draws tooltip on mousemove when hit state changes', () => {
    const hit: TooltipHit = { datasetIndex: 0, pointIndex: 0, value: 10, label: 'A' }
    bindTooltip(container, canvas, () => hit)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('clears overlay on mouseleave when a hit was active', () => {
    const hit: TooltipHit = { datasetIndex: 0, pointIndex: 0, value: 10, label: 'A' }
    bindTooltip(container, canvas, () => hit)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    ctx.clearRect.mockClear()
    canvas.dispatchEvent(new MouseEvent('mouseleave'))
    expect(ctx.clearRect).toHaveBeenCalled()
  })

  it('cleanup removes listeners and removes overlay', () => {
    const hitTest = vi.fn(() => null)
    const cleanup = bindTooltip(container, canvas, hitTest)
    const overlay = container.lastElementChild
    cleanup()
    hitTest.mockClear()
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }))
    canvas.dispatchEvent(new MouseEvent('mouseleave'))
    expect(hitTest).not.toHaveBeenCalled()
    expect(overlay?.isConnected).toBe(false)
  })

  it('draws tooltip text when hitTest returns a hit', () => {
    const hit: TooltipHit = { datasetIndex: 0, pointIndex: 1, value: 42, label: 'Jan' }
    bindTooltip(container, canvas, () => hit)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
    expect(ctx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Jan'),
      expect.any(Number),
      expect.any(Number)
    )
  })
})
