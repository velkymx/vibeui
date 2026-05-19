import type { ChartData } from '../../types'
import type { TooltipHit } from './chartTypes'

const GRID_LINES = 5
const GROUP_PADDING = 0.2

function getPad(showAxes: boolean) {
  return showAxes
    ? { left: 50, right: 10, top: 10, bottom: 30 }
    : { left: 10, right: 10, top: 10, bottom: 10 }
}

function getMaxVal(data: ChartData, stacked: boolean): number {
  if (stacked) {
    const colSums = data.labels.map((_, i) =>
      data.datasets.reduce((s, ds) => s + (ds.data[i] ?? 0), 0)
    )
    return colSums.reduce((a, b) => Math.max(a, b), 1)
  }
  return data.datasets.flatMap((ds) => ds.data).reduce((a, b) => Math.max(a, b), 1)
}

export function drawBar(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  w: number,
  h: number,
  colors: string[],
  showAxes: boolean,
  showGrid: boolean,
  stacked: boolean
): void {
  const pad = getPad(showAxes)
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom
  const n = data.labels.length
  const numDatasets = data.datasets.length
  const maxVal = getMaxVal(data, stacked)
  const groupW = chartW / n
  const barW = stacked
    ? groupW * (1 - GROUP_PADDING)
    : (groupW * (1 - GROUP_PADDING)) / numDatasets

  ctx.clearRect(0, 0, w, h)

  if (showGrid) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (let g = 1; g <= GRID_LINES; g++) {
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
    data.labels.forEach((label, i) => {
      ctx.fillText(String(label), pad.left + i * groupW + groupW / 2, pad.top + chartH + 18)
    })

    ctx.textAlign = 'right'
    for (let g = 0; g <= GRID_LINES; g++) {
      const v = (maxVal / GRID_LINES) * (GRID_LINES - g)
      const gy = pad.top + (chartH / GRID_LINES) * g
      ctx.fillText(v.toFixed(0), pad.left - 5, gy + 4)
    }
    ctx.restore()
  }

  if (stacked) {
    for (let i = 0; i < n; i++) {
      let yOffset = pad.top + chartH
      const bx = pad.left + i * groupW + (groupW * GROUP_PADDING) / 2
      for (const [di, ds] of data.datasets.entries()) {
        const v = Math.max(0, ds.data[i] ?? 0)
        const bh = (v / maxVal) * chartH
        ctx.fillStyle = colors[di]
        ctx.fillRect(bx, yOffset - bh, barW, bh)
        yOffset -= bh
      }
    }
  } else {
    for (const [di, ds] of data.datasets.entries()) {
      ctx.fillStyle = colors[di]
      for (let i = 0; i < n; i++) {
        const v = Math.max(0, ds.data[i] ?? 0)
        const bh = (v / maxVal) * chartH
        const bx = pad.left + i * groupW + (groupW * GROUP_PADDING) / 2 + di * barW
        ctx.fillRect(bx, pad.top + chartH - bh, barW, bh)
      }
    }
  }
}

export function hitTestBar(
  x: number,
  y: number,
  data: ChartData,
  w: number,
  h: number,
  showAxes: boolean,
  stacked: boolean
): TooltipHit | null {
  const pad = getPad(showAxes)
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom
  const n = data.labels.length
  const numDatasets = data.datasets.length
  const maxVal = getMaxVal(data, stacked)
  const groupW = chartW / n
  const barW = stacked
    ? groupW * (1 - GROUP_PADDING)
    : (groupW * (1 - GROUP_PADDING)) / numDatasets

  const groupI = Math.floor((x - pad.left) / groupW)
  if (groupI < 0 || groupI >= n) return null

  const groupStartX = pad.left + groupI * groupW + (groupW * GROUP_PADDING) / 2

  if (stacked) {
    if (x < groupStartX || x > groupStartX + barW) return null
    let yOffset = pad.top + chartH
    for (const [di, ds] of data.datasets.entries()) {
      const v = Math.max(0, ds.data[groupI] ?? 0)
      const bh = (v / maxVal) * chartH
      const barTop = yOffset - bh
      if (y >= barTop && y <= yOffset) {
        return { datasetIndex: di, pointIndex: groupI, value: v, label: data.labels?.[groupI] ?? '' }
      }
      yOffset -= bh
    }
    return null
  }

  for (let di = 0; di < numDatasets; di++) {
    const bx = groupStartX + di * barW
    if (x < bx || x > bx + barW) continue
    const v = data.datasets[di].data[groupI] ?? 0
    const bh = (v / maxVal) * chartH
    const barTop = pad.top + chartH - bh
    if (y >= barTop && y <= pad.top + chartH) {
      return { datasetIndex: di, pointIndex: groupI, value: v, label: data.labels?.[groupI] ?? '' }
    }
  }
  return null
}
