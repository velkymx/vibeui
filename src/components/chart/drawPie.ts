import type { ChartData } from '../../types'
import type { TooltipHit } from './chartTypes'

export function drawPie(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  w: number,
  h: number,
  colors: string[]
): void {
  ctx.clearRect(0, 0, w, h)

  const raw = data.datasets[0]?.data ?? []
  const values = raw.map((v) => Math.max(0, v))
  const total = values.reduce((s, v) => s + v, 0)
  if (total === 0) return
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.4

  let angle = -Math.PI / 2

  for (const [i, v] of values.entries()) {
    const slice = (v / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, angle, angle + slice)
    ctx.closePath()
    ctx.fillStyle = colors[i]
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    angle += slice
  }
}

export function hitTestPie(
  x: number,
  y: number,
  data: ChartData,
  w: number,
  h: number
): TooltipHit | null {
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.4

  const dx = x - cx
  const dy = y - cy
  if (Math.hypot(dx, dy) > r) return null

  const raw = data.datasets[0]?.data ?? []
  const values = raw.map((v) => Math.max(0, v))
  const total = values.reduce((s, v) => s + v, 0)
  if (total === 0) return null

  // Normalize angle so 0 = top (-PI/2), going clockwise
  let angle = (Math.atan2(dy, dx) + Math.PI * 2.5) % (Math.PI * 2)

  let cumAngle = 0
  for (const [i, v] of values.entries()) {
    const slice = (v / total) * Math.PI * 2
    if (angle >= cumAngle && angle < cumAngle + slice) {
      return { datasetIndex: 0, pointIndex: i, value: v, label: data.labels[i] }
    }
    cumAngle += slice
  }
  return null
}
