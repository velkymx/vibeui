import type { ChartData } from '../../types'
import type { TooltipHit } from './chartTypes'

const GRID_LINES = 5
const POINT_RADIUS = 4
const HIT_THRESHOLD = 12

function getPad(showAxes: boolean) {
  return showAxes
    ? { left: 50, right: 10, top: 10, bottom: 30 }
    : { left: 10, right: 10, top: 10, bottom: 10 }
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  w: number,
  h: number,
  colors: string[],
  showAxes: boolean,
  showGrid: boolean,
  smooth: boolean,
  fill: boolean
): void {
  const pad = getPad(showAxes)
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const allValues = data.datasets.flatMap((ds) => ds.data)
  if (allValues.length === 0) return
  const minVal = allValues.reduce((acc, v) => Math.min(acc, v), allValues[0])
  const maxVal = allValues.reduce((acc, v) => Math.max(acc, v), allValues[0])
  const range = maxVal - minVal || 1
  const n = data.labels.length
  const xStep = chartW / Math.max(n - 1, 1)

  const toX = (i: number) => pad.left + i * xStep
  const toY = (v: number) => pad.top + chartH - ((v - minVal) / range) * chartH

  ctx.clearRect(0, 0, w, h)

  if (showGrid) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (let g = 0; g <= GRID_LINES; g++) {
      const gy = pad.top + (chartH / GRID_LINES) * g
      ctx.beginPath()
      ctx.moveTo(pad.left, gy)
      ctx.lineTo(pad.left + chartW, gy)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  if (showAxes) {
    ctx.save()
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + chartH)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top + chartH)
    ctx.lineTo(pad.left + chartW, pad.top + chartH)
    ctx.stroke()

    ctx.fillStyle = '#666'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    data.labels.forEach((label, i) => ctx.fillText(String(label), toX(i), pad.top + chartH + 18))

    ctx.textAlign = 'right'
    for (let g = 0; g <= GRID_LINES; g++) {
      const v = minVal + (range / GRID_LINES) * (GRID_LINES - g)
      const gy = pad.top + (chartH / GRID_LINES) * g
      ctx.fillText(v.toFixed(0), pad.left - 5, gy + 4)
    }
    ctx.restore()
  }

  for (const [di, ds] of data.datasets.entries()) {
    const color = colors[di]

    const tracePath = (withMove: boolean) => {
      if (smooth && ds.data.length > 2) {
        ds.data.forEach((v, i) => {
          const x = toX(i)
          const y = toY(v)
          if (i === 0) {
            if (withMove) ctx.moveTo(x, y)
          } else {
            const cpX = (toX(i - 1) + x) / 2
            ctx.bezierCurveTo(cpX, toY(ds.data[i - 1]), cpX, y, x, y)
          }
        })
      } else {
        ds.data.forEach((v, i) => {
          i === 0 && withMove ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v))
        })
      }
    }

    if (fill && ds.data.length > 0) {
      ctx.beginPath()
      tracePath(true)
      ctx.lineTo(toX(ds.data.length - 1), pad.top + chartH)
      ctx.lineTo(toX(0), pad.top + chartH)
      ctx.closePath()
      ctx.fillStyle = `${color}33`
      ctx.fill()
    }

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    tracePath(true)
    ctx.stroke()

    ctx.fillStyle = color
    ds.data.forEach((v, i) => {
      ctx.beginPath()
      ctx.arc(toX(i), toY(v), POINT_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}

export function hitTestLine(
  x: number,
  y: number,
  data: ChartData,
  w: number,
  h: number,
  showAxes: boolean
): TooltipHit | null {
  const pad = getPad(showAxes)
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const allValues = data.datasets.flatMap((ds) => ds.data)
  if (allValues.length === 0) return null
  const minVal = allValues.reduce((acc, v) => Math.min(acc, v), allValues[0])
  const maxVal = allValues.reduce((acc, v) => Math.max(acc, v), allValues[0])
  const range = maxVal - minVal || 1
  const n = data.labels.length
  const xStep = chartW / Math.max(n - 1, 1)

  const toX = (i: number) => pad.left + i * xStep
  const toY = (v: number) => pad.top + chartH - ((v - minVal) / range) * chartH

  for (const [di, ds] of data.datasets.entries()) {
    for (const [pi, v] of ds.data.entries()) {
      if (Math.hypot(x - toX(pi), y - toY(v)) <= HIT_THRESHOLD) {
        return { datasetIndex: di, pointIndex: pi, value: v, label: data.labels?.[pi] ?? '' }
      }
    }
  }
  return null
}
