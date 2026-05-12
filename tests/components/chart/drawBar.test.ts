import { describe, it, expect } from 'vitest'
import { drawBar, hitTestBar } from '../../../src/components/chart/drawBar'
import { createMockCtx } from '../../mocks/canvasMock'
import type { ChartData } from '../../../src/types'

const DATA: ChartData = {
  labels: ['Q1', 'Q2', 'Q3'],
  datasets: [
    { label: 'A', data: [10, 20, 15] },
    { label: 'B', data: [5, 8, 12] },
  ],
}

describe('drawBar', () => {
  it('calls clearRect with full dimensions', () => {
    const ctx = createMockCtx()
    drawBar(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue', 'red'], true, true, false)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 300)
  })

  it('calls fillRect for each bar in grouped mode', () => {
    const ctx = createMockCtx()
    drawBar(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue', 'red'], false, false, false)
    expect(ctx.fillRect.mock.calls.length).toBe(6)
  })

  it('calls fillRect for each bar in stacked mode', () => {
    const ctx = createMockCtx()
    drawBar(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue', 'red'], false, false, true)
    expect(ctx.fillRect.mock.calls.length).toBe(6)
  })

  it('draws grid lines when showGrid=true', () => {
    const ctx = createMockCtx()
    drawBar(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue', 'red'], true, true, false)
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4])
  })

  it('skips grid when showGrid=false', () => {
    const ctx = createMockCtx()
    drawBar(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue', 'red'], true, false, false)
    expect(ctx.setLineDash).not.toHaveBeenCalledWith([4, 4])
  })
})

describe('hitTestBar', () => {
  it('returns null outside chart area', () => {
    expect(hitTestBar(0, 0, DATA, 400, 300, true, false)).toBeNull()
  })

  it('returns null below all bars', () => {
    expect(hitTestBar(200, 299, DATA, 400, 300, false, false)).toBeNull()
  })

  it('returns a hit inside a bar', () => {
    // showAxes=false: PAD=10 all sides, chartW=380, chartH=280
    // n=3, groupW=380/3≈126.7, GROUP_PADDING=0.2
    // barW=(126.7*(1-0.2))/2≈50.7
    // Group 0 startX=10+126.7*0.1=22.7
    // Dataset 0 bar x=22.7, width=50.7
    // Dataset 0 value=10, max=20, barH=(10/20)*280=140
    // Bar rect: x=22.7, y=10+280-140=150, h=140
    const hit = hitTestBar(30, 200, DATA, 400, 300, false, false)
    expect(hit).not.toBeNull()
    expect(hit!.pointIndex).toBe(0)
  })
})
