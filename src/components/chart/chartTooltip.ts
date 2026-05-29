import type { TooltipHit } from './chartTypes'

function sameHit(a: TooltipHit | null, b: TooltipHit | null): boolean {
  if (a === null && b === null) return true
  if (a === null || b === null) return false
  return a.datasetIndex === b.datasetIndex && a.pointIndex === b.pointIndex
}

export function bindTooltip(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  hitTest: (x: number, y: number) => TooltipHit | null,
): () => void {
  let lastHit: TooltipHit | null = null

  const overlay = document.createElement('canvas')
  overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none'
  container.appendChild(overlay)

  const syncSize = () => {
    if (overlay.width !== canvas.width) overlay.width = canvas.width
    if (overlay.height !== canvas.height) overlay.height = canvas.height
  }

  // rect is passed in from onMove (which already measured it) so we don't call
  // getBoundingClientRect twice per mousemove. We only read rect.width/height here, which
  // are resize-invariant within a move — note rect.left/top must stay fresh per move (they
  // shift on scroll), so the measurement itself is not cached across moves.
  const drawTooltip = (hit: TooltipHit, x: number, y: number, rect: DOMRect) => {
    syncSize()
    const ctx = overlay.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = '12px sans-serif'
    const text = `${hit.label}: ${hit.value}`
    const tw = ctx.measureText(text).width + 12
    const th = 22
    let tx = x + 12
    let ty = y - th - 6
    if (tx + tw > rect.width) tx = rect.width - tw - 4
    if (ty < 0) ty = y + 14
    ty = Math.min(ty, rect.height - th)
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.beginPath()
    const r = 4
    ctx.moveTo(tx + r, ty)
    ctx.lineTo(tx + tw - r, ty)
    ctx.arcTo(tx + tw, ty, tx + tw, ty + r, r)
    ctx.lineTo(tx + tw, ty + th - r)
    ctx.arcTo(tx + tw, ty + th, tx + tw - r, ty + th, r)
    ctx.lineTo(tx + r, ty + th)
    ctx.arcTo(tx, ty + th, tx, ty + th - r, r)
    ctx.lineTo(tx, ty + r)
    ctx.arcTo(tx, ty, tx + r, ty, r)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText(text, tx + 6, ty + 15)
    ctx.restore()
  }

  const clearOverlay = () => {
    syncSize()
    const ctx = overlay.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlay.width, overlay.height)
  }

  const onMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const hit = hitTest(x, y)
    if (sameHit(hit, lastHit)) return
    lastHit = hit
    if (hit) {
      drawTooltip(hit, x, y, rect)
    } else {
      clearOverlay()
    }
  }

  const onLeave = () => {
    if (lastHit === null) return
    lastHit = null
    clearOverlay()
  }

  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseleave', onLeave)

  return () => {
    canvas.removeEventListener('mousemove', onMove)
    canvas.removeEventListener('mouseleave', onLeave)
    overlay.remove()
  }
}
