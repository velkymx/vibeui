import { describe, it, expect } from 'vitest'
import { drawLine, hitTestLine } from '../../../src/components/chart/drawLine'
import { createMockCtx } from '../../mocks/canvasMock'
import type { ChartData } from '../../../src/types'

const DATA: ChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{ label: 'Sales', data: [10, 20, 15] }],
}

const MULTI: ChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [
    { label: 'S1', data: [10, 20, 15] },
    { label: 'S2', data: [5, 8, 12] },
  ],
}

describe('drawLine', () => {
  it('calls clearRect with full dimensions', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], true, true, false, false)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 300)
  })

  it('applies dashed style for grid lines when showGrid=true', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], true, true, false, false)
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4])
  })

  it('skips grid lines when showGrid=false', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], true, false, false, false)
    expect(ctx.setLineDash).not.toHaveBeenCalledWith([4, 4])
  })

  it('strokes one line per dataset', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, MULTI, 400, 300, ['blue', 'red'], false, false, false, false)
    expect(ctx.stroke.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('draws points with arc for each data value', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], false, false, false, false)
    expect(ctx.arc.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('fills area under line when fill=true', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], false, false, false, true)
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('uses bezierCurveTo when smooth=true', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], false, false, true, false)
    expect(ctx.bezierCurveTo).toHaveBeenCalled()
  })
})

describe('hitTestLine', () => {
  it('returns null when coords are far from all points', () => {
    expect(hitTestLine(999, 999, DATA, 400, 300, true)).toBeNull()
  })

  it('returns hit when coords are within threshold of a point', () => {
    // With showAxes=true: PAD_LEFT=50, PAD_RIGHT=10, PAD_TOP=10, PAD_BOTTOM=30
    // chartW=340, chartH=260, n=3, xStep=170
    // values [10,20,15], min=10 (seed=allValues[0]), max=20, range=10
    // point[0] x=50, y = 10 + 260 - ((10-10)/10)*260 = 270
    const hit = hitTestLine(50, 270, DATA, 400, 300, true)
    expect(hit).not.toBeNull()
    expect(hit!.pointIndex).toBe(0)
    expect(hit!.value).toBe(10)
    expect(hit!.label).toBe('Jan')
  })

  it('returns correct datasetIndex for second dataset', () => {
    // S1=[10,20,15], S2=[5,8,12], allValues seed=10, min=5, max=20, range=15
    // S2 point[0] value=5: y = 10 + 260 - ((5-5)/15)*260 = 270
    const hit = hitTestLine(50, 270, MULTI, 400, 300, true)
    expect(hit?.datasetIndex).toBe(1)
  })
})
