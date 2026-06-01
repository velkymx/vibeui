import { describe, it, expect } from 'vitest'
import { drawPie, hitTestPie } from '../../../src/components/chart/drawPie'
import { createMockCtx } from '../../mocks/canvasMock'
import type { ChartData } from '../../../src/types'

const DATA: ChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Market share', data: [50, 30, 20] }],
}

describe('drawPie', () => {
  it('calls clearRect with full dimensions', () => {
    const ctx = createMockCtx()
    drawPie(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['red', 'green', 'blue'])
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 300)
  })

  it('draws one arc per slice', () => {
    const ctx = createMockCtx()
    drawPie(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['red', 'green', 'blue'])
    // 3 slices = 3 arc calls (each sector uses arc after moveTo)
    expect(ctx.arc.mock.calls.length).toBe(3)
  })

  it('fills each sector', () => {
    const ctx = createMockCtx()
    drawPie(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['red', 'green', 'blue'])
    expect(ctx.fill.mock.calls.length).toBe(3)
  })

  it('strokes each sector boundary', () => {
    const ctx = createMockCtx()
    drawPie(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['red', 'green', 'blue'])
    expect(ctx.stroke.mock.calls.length).toBe(3)
  })
})

describe('hitTestPie', () => {
  it('returns null outside pie radius', () => {
    // Center is 200,150, radius = min(400,300)*0.4 = 120
    // Point at 0,0 is far outside
    expect(hitTestPie(0, 0, DATA, 400, 300)).toBeNull()
  })

  it('returns hit for point inside pie', () => {
    // A point near center should hit something
    const hit = hitTestPie(200, 148, DATA, 400, 300)
    expect(hit).not.toBeNull()
    expect(hit!.datasetIndex).toBe(0)
  })

  it('returns correct slice for "A" (50% = top half area)', () => {
    // Slice A occupies from -PI/2 to PI/2 (top half going clockwise, 50%)
    // Point at (200, 80) is directly above center, inside pie — should be slice A
    const hit = hitTestPie(200, 80, DATA, 400, 300)
    expect(hit?.pointIndex).toBe(0)
    expect(hit?.label).toBe('A')
  })
})
