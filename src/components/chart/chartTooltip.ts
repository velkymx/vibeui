import type { TooltipHit } from './chartTypes'

export function bindTooltip(
  canvas: HTMLCanvasElement,
  hitTest: (x: number, y: number) => TooltipHit | null,
  redraw: () => void
): () => void {
  const onMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    redraw()

    const hit = hitTest(x, y)
    if (!hit) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const text = `${hit.label}: ${hit.value}`
    ctx.save()
    ctx.font = '12px sans-serif'
    const tw = ctx.measureText(text).width + 12
    const th = 22
    let tx = x + 12
    let ty = y - th - 6
    if (tx + tw > rect.width) tx = rect.width - tw - 4
    if (ty < 0) ty = y + 14

    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.beginPath()
    ctx.roundRect(tx, ty, tw, th, 4)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText(text, tx + 6, ty + 15)
    ctx.restore()
  }

  const onLeave = () => redraw()

  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseleave', onLeave)

  return () => {
    canvas.removeEventListener('mousemove', onMove)
    canvas.removeEventListener('mouseleave', onLeave)
  }
}
