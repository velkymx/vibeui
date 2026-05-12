# VibeChart Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `VibeChartLine`, `VibeChartBar`, `VibeChartPie` — canvas-based, Bootstrap-themed, responsive via ResizeObserver, no external dependencies.

**Architecture:** Three separate Vue 3 components each owning their own draw logic (drawLine/drawBar/drawPie), backed by shared internal utilities under `src/components/chart/` (colors, resize, tooltip). Internal utilities are never exported publicly.

**Tech Stack:** Vue 3, TypeScript strict, Canvas 2D API, ResizeObserver, vitest + @vue/test-utils + happy-dom.

---

## File Map

### Create
| File | Responsibility |
|------|---------------|
| `src/components/chart/chartTypes.ts` | Internal `TooltipHit` interface |
| `src/components/chart/chartColors.ts` | Bootstrap CSS var color resolver + slice variant |
| `src/components/chart/chartResize.ts` | ResizeObserver setup/teardown composable |
| `src/components/chart/chartTooltip.ts` | Canvas tooltip bind/cleanup |
| `src/components/chart/drawLine.ts` | `drawLine()` + `hitTestLine()` |
| `src/components/chart/drawBar.ts` | `drawBar()` + `hitTestBar()` |
| `src/components/chart/drawPie.ts` | `drawPie()` + `hitTestPie()` |
| `src/components/VibeChartLine.vue` | Line chart component |
| `src/components/VibeChartBar.vue` | Bar chart component |
| `src/components/VibeChartPie.vue` | Pie chart component |
| `tests/mocks/canvasMock.ts` | Shared canvas + ResizeObserver mocks |
| `tests/components/chart/chartColors.test.ts` | chartColors unit tests |
| `tests/components/chart/chartTooltip.test.ts` | chartTooltip unit tests |
| `tests/components/chart/drawLine.test.ts` | drawLine unit tests |
| `tests/components/chart/drawBar.test.ts` | drawBar unit tests |
| `tests/components/chart/drawPie.test.ts` | drawPie unit tests |
| `tests/components/VibeChartLine.test.ts` | VibeChartLine component tests |
| `tests/components/VibeChartBar.test.ts` | VibeChartBar component tests |
| `tests/components/VibeChartPie.test.ts` | VibeChartPie component tests |

### Modify
| File | Change |
|------|--------|
| `src/types.ts` | Add `ChartDataset`, `ChartData`, `ChartLegendPosition` |
| `src/components/index.ts` | Import, export, and register all three chart components |
| `src/index.ts` | Re-export three components and chart types |

---

## Task 1: Public types + internal chartTypes

**Files:**
- Modify: `src/types.ts`
- Create: `src/components/chart/chartTypes.ts`

No test — pure type declarations.

- [ ] **Step 1: Add to `src/types.ts`** (append after existing types)

```ts
// Chart types
export interface ChartDataset {
  label: string
  data: number[]
  color?: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export type ChartLegendPosition = 'top' | 'bottom' | 'none'
```

- [ ] **Step 2: Create `src/components/chart/chartTypes.ts`**

```ts
export interface TooltipHit {
  datasetIndex: number
  pointIndex: number
  value: number
  label: string
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx vue-tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/components/chart/chartTypes.ts
git commit -m "feat(charts): add ChartData, ChartDataset, ChartLegendPosition types and internal TooltipHit"
```

---

## Task 2: Canvas mock helper

**Files:**
- Create: `tests/mocks/canvasMock.ts`

No failing test to write — this is test infrastructure used by all subsequent tasks.

- [ ] **Step 1: Create `tests/mocks/canvasMock.ts`**

```ts
import { vi } from 'vitest'

export function createMockCtx() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    roundRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: '' as string,
    fillStyle: '' as string,
    lineWidth: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
  }
}

export function mockCanvas(overrides = createMockCtx()) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    overrides as unknown as CanvasRenderingContext2D
  )
  return overrides
}

export function mockResizeObserver() {
  let callback: ResizeObserverCallback | null = null
  const observe = vi.fn()
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    vi.fn((cb: ResizeObserverCallback) => {
      callback = cb
      return { observe, disconnect }
    })
  )
  return {
    observe,
    disconnect,
    trigger: (w: number, h: number) =>
      callback?.(
        [{ contentRect: { width: w, height: h } } as ResizeObserverEntry],
        {} as ResizeObserver
      ),
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/mocks/canvasMock.ts
git commit -m "test(charts): add canvas and ResizeObserver mock helpers"
```

---

## Task 3: chartColors

**Files:**
- Create: `src/components/chart/chartColors.ts`
- Create: `tests/components/chart/chartColors.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/chart/chartColors.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolveColors, resolveSliceColors } from '../../../src/components/chart/chartColors'
import type { ChartDataset } from '../../../src/types'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveColors', () => {
  it('uses dataset color when provided', () => {
    const el = document.createElement('div')
    const datasets: ChartDataset[] = [{ label: 'A', data: [1], color: '#ff0000' }]
    expect(resolveColors(datasets, el)[0]).toBe('#ff0000')
  })

  it('reads trimmed BS var when no color provided', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (p: string) => (p === '--bs-primary' ? ' #0d6efd ' : ''),
    } as unknown as CSSStyleDeclaration)
    const datasets: ChartDataset[] = [{ label: 'A', data: [1] }]
    expect(resolveColors(datasets, el)[0]).toBe('#0d6efd')
  })

  it('cycles vars for 9+ datasets', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (p: string) => p,
    } as unknown as CSSStyleDeclaration)
    const datasets: ChartDataset[] = Array.from({ length: 9 }, (_, i) => ({
      label: String(i),
      data: [i],
    }))
    const colors = resolveColors(datasets, el)
    expect(colors[8]).toBe(colors[0])
  })

  it('mixes explicit and auto colors', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'auto',
    } as unknown as CSSStyleDeclaration)
    const datasets: ChartDataset[] = [
      { label: 'A', data: [1], color: 'red' },
      { label: 'B', data: [2] },
    ]
    const colors = resolveColors(datasets, el)
    expect(colors[0]).toBe('red')
    expect(colors[1]).toBe('auto')
  })
})

describe('resolveSliceColors', () => {
  it('returns n colors cycling BS vars', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (p: string) => p,
    } as unknown as CSSStyleDeclaration)
    const colors = resolveSliceColors(3, el)
    expect(colors).toHaveLength(3)
    expect(colors[0]).not.toBe(colors[1])
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/chart/chartColors.test.ts
```
Expected: `Cannot find module '../../../src/components/chart/chartColors'`

- [ ] **Step 3: Create `src/components/chart/chartColors.ts`**

```ts
import type { ChartDataset } from '../../types'

const BS_VARS = [
  '--bs-primary',
  '--bs-success',
  '--bs-danger',
  '--bs-warning',
  '--bs-info',
  '--bs-secondary',
  '--bs-dark',
  '--bs-light',
]

export function resolveColors(datasets: ChartDataset[], el: HTMLElement): string[] {
  const style = getComputedStyle(el)
  return datasets.map(
    (ds, i) => ds.color ?? style.getPropertyValue(BS_VARS[i % BS_VARS.length]).trim()
  )
}

export function resolveSliceColors(count: number, el: HTMLElement): string[] {
  const style = getComputedStyle(el)
  return Array.from({ length: count }, (_, i) =>
    style.getPropertyValue(BS_VARS[i % BS_VARS.length]).trim()
  )
}
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/chart/chartColors.test.ts
```
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/chartColors.ts tests/components/chart/chartColors.test.ts
git commit -m "feat(charts): add chartColors with BS var cycling and slice variant"
```

---

## Task 4: chartResize

**Files:**
- Create: `src/components/chart/chartResize.ts`

Tested via component mounts in later tasks. No standalone unit test.

- [ ] **Step 1: Create `src/components/chart/chartResize.ts`**

```ts
import { type Ref, onMounted, onUnmounted } from 'vue'

export function useChartResize(
  container: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
  onResize: (w: number, h: number) => void
): void {
  let observer: ResizeObserver | null = null

  onMounted(() => {
    observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      onResize(width, height)
    })
    observer.observe(container.value!)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx vue-tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/chart/chartResize.ts
git commit -m "feat(charts): add useChartResize composable with ResizeObserver"
```

---

## Task 5: chartTooltip

**Files:**
- Create: `src/components/chart/chartTooltip.ts`
- Create: `tests/components/chart/chartTooltip.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/chart/chartTooltip.test.ts
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
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/chart/chartTooltip.test.ts
```
Expected: `Cannot find module '../../../src/components/chart/chartTooltip'`

- [ ] **Step 3: Create `src/components/chart/chartTooltip.ts`**

```ts
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

    const ctx = canvas.getContext('2d')!
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
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/chart/chartTooltip.test.ts
```
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/chartTooltip.ts tests/components/chart/chartTooltip.test.ts
git commit -m "feat(charts): add chartTooltip with canvas overlay and cleanup"
```

---

## Task 6: drawLine

**Files:**
- Create: `src/components/chart/drawLine.ts`
- Create: `tests/components/chart/drawLine.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/chart/drawLine.test.ts
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
    // At minimum 2 strokes (one per dataset line); axes off so no extra axis strokes
    expect(ctx.stroke.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('draws points with arc for each data value', () => {
    const ctx = createMockCtx()
    drawLine(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue'], false, false, false, false)
    // 3 points = 3 arc calls
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
    // point[0] x=50, values [10,20,15], min=0,max=20,range=20
    // point[0] y = 10 + 260 - (10/20)*260 = 10 + 260 - 130 = 140
    const hit = hitTestLine(50, 140, DATA, 400, 300, true)
    expect(hit).not.toBeNull()
    expect(hit!.pointIndex).toBe(0)
    expect(hit!.value).toBe(10)
    expect(hit!.label).toBe('Jan')
  })

  it('returns correct datasetIndex for second dataset', () => {
    // S2 value at index 0 is 5; with range 0-20, y = 10 + 260 - (5/20)*260 = 205
    const hit = hitTestLine(50, 205, MULTI, 400, 300, true)
    expect(hit?.datasetIndex).toBe(1)
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/chart/drawLine.test.ts
```
Expected: `Cannot find module '../../../src/components/chart/drawLine'`

- [ ] **Step 3: Create `src/components/chart/drawLine.ts`**

```ts
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
  const minVal = Math.min(0, ...allValues)
  const maxVal = Math.max(0, ...allValues)
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
  const minVal = Math.min(0, ...allValues)
  const maxVal = Math.max(0, ...allValues)
  const range = maxVal - minVal || 1
  const n = data.labels.length
  const xStep = chartW / Math.max(n - 1, 1)

  const toX = (i: number) => pad.left + i * xStep
  const toY = (v: number) => pad.top + chartH - ((v - minVal) / range) * chartH

  for (const [di, ds] of data.datasets.entries()) {
    for (const [pi, v] of ds.data.entries()) {
      if (Math.hypot(x - toX(pi), y - toY(v)) <= HIT_THRESHOLD) {
        return { datasetIndex: di, pointIndex: pi, value: v, label: data.labels[pi] }
      }
    }
  }
  return null
}
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/chart/drawLine.test.ts
```
Expected: all 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/drawLine.ts tests/components/chart/drawLine.test.ts
git commit -m "feat(charts): add drawLine and hitTestLine with smooth, fill, axes, grid support"
```

---

## Task 7: VibeChartLine component

**Files:**
- Create: `src/components/VibeChartLine.vue`
- Create: `tests/components/VibeChartLine.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/VibeChartLine.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartLine from '../../src/components/VibeChartLine.vue'
import { mockCanvas, mockResizeObserver } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    { label: 'Revenue', data: [10, 20, 15] },
    { label: 'Costs', data: [5, 8, 12] },
  ],
}

beforeEach(() => {
  mockCanvas()
  mockResizeObserver()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('VibeChartLine', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders legend at bottom by default', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(true)
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(false)
  })

  it('renders legend at top when legend="top"', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA, legend: 'top' } })
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(true)
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(false)
  })

  it('hides legend when legend="none"', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA, legend: 'none' } })
    expect(wrapper.find('.vibe-chart-legend').exists()).toBe(false)
  })

  it('shows all dataset labels in legend', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    const items = wrapper.findAll('.vibe-chart-legend-item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Revenue')
    expect(items[1].text()).toContain('Costs')
  })

  it('canvas container uses aspect-ratio style by default', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    const container = wrapper.find('.vibe-chart-canvas-container')
    expect(container.attributes('style')).toContain('aspect-ratio')
  })

  it('canvas container uses explicit height when height prop given', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA, height: 300 } })
    const container = wrapper.find('.vibe-chart-canvas-container')
    expect(container.attributes('style')).toContain('300px')
  })

  it('calls clearRect when ResizeObserver triggers', () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    mount(VibeChartLine, { props: { data: DATA } })
    ro.trigger(400, 225)
    expect(ctx.clearRect).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/VibeChartLine.test.ts
```
Expected: `Cannot find module '../../src/components/VibeChartLine.vue'`

- [ ] **Step 3: Create `src/components/VibeChartLine.vue`**

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type PropType } from 'vue'
import type { ChartData, ChartLegendPosition } from '../types'
import { resolveColors } from './chart/chartColors'
import { useChartResize } from './chart/chartResize'
import { bindTooltip } from './chart/chartTooltip'
import { drawLine, hitTestLine } from './chart/drawLine'

const props = defineProps({
  data: { type: Object as PropType<ChartData>, required: true },
  legend: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
  height: { type: [Number, String] as PropType<number | string>, default: 'auto' },
  showAxes: { type: Boolean, default: true },
  showGrid: { type: Boolean, default: true },
  smooth: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
})

const containerEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let cleanupTooltip: (() => void) | null = null
let currentW = 0
let currentH = 0

const canvasContainerStyle = computed(() => {
  if (props.height === 'auto') return { width: '100%', aspectRatio: '16/9' }
  const h = typeof props.height === 'number' ? `${props.height}px` : (props.height as string)
  return { width: '100%', height: h }
})

const resolvedColors = computed(() =>
  containerEl.value ? resolveColors(props.data.datasets, containerEl.value) : []
)

function redraw() {
  const canvas = canvasEl.value!
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = currentW * dpr
  canvas.height = currentH * dpr
  ctx.scale(dpr, dpr)
  drawLine(
    ctx,
    props.data,
    currentW,
    currentH,
    resolvedColors.value,
    props.showAxes,
    props.showGrid,
    props.smooth,
    props.fill
  )
}

useChartResize(containerEl, canvasEl, (w, h) => {
  currentW = w
  currentH = h
  redraw()
})

onMounted(() => {
  cleanupTooltip = bindTooltip(
    canvasEl.value!,
    (x, y) => hitTestLine(x, y, props.data, currentW, currentH, props.showAxes),
    redraw
  )
})

watch(() => props.data, redraw, { deep: true })

onUnmounted(() => {
  cleanupTooltip?.()
})
</script>

<template>
  <div class="vibe-chart">
    <div v-if="legend === 'top'" class="vibe-chart-legend vibe-chart-legend--top">
      <span v-for="(ds, i) in data.datasets" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ ds.label }}
      </span>
    </div>
    <div ref="containerEl" class="vibe-chart-canvas-container" :style="canvasContainerStyle">
      <canvas ref="canvasEl" style="display: block; width: 100%; height: 100%;" />
    </div>
    <div v-if="legend === 'bottom'" class="vibe-chart-legend vibe-chart-legend--bottom">
      <span v-for="(ds, i) in data.datasets" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ ds.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.vibe-chart {
  width: 100%;
}
.vibe-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.vibe-chart-legend--top {
  margin-bottom: 0.25rem;
}
.vibe-chart-legend--bottom {
  margin-top: 0.25rem;
}
.vibe-chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.vibe-chart-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/VibeChartLine.test.ts
```
Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/VibeChartLine.vue tests/components/VibeChartLine.test.ts
git commit -m "feat(charts): add VibeChartLine component"
```

---

## Task 8: drawBar

**Files:**
- Create: `src/components/chart/drawBar.ts`
- Create: `tests/components/chart/drawBar.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/chart/drawBar.test.ts
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
    // 3 labels × 2 datasets = 6 bars
    expect(ctx.fillRect.mock.calls.length).toBe(6)
  })

  it('calls fillRect for each bar in stacked mode', () => {
    const ctx = createMockCtx()
    drawBar(ctx as unknown as CanvasRenderingContext2D, DATA, 400, 300, ['blue', 'red'], false, false, true)
    // 3 labels × 2 datasets = 6 bars (same count, different positions)
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
    // y=299 is at the very bottom (x-axis baseline), no bar there
    expect(hitTestBar(200, 299, DATA, 400, 300, false, false)).toBeNull()
  })

  it('returns a hit inside a bar', () => {
    // showAxes=false: PAD=10 all sides, chartW=380, chartH=280
    // n=3, groupW=380/3≈126.7, GROUP_PADDING=0.2
    // barW=(126.7*(1-0.2))/2≈50.7
    // Group 0 startX=10+0+126.7*0.1=22.7
    // Dataset 0 bar x=22.7+0=22.7, width=50.7
    // Dataset 0 value=10, max=20, barH=(10/20)*280=140
    // Bar rect: x=22.7, y=10+280-140=150, w=50.7, h=140
    const hit = hitTestBar(30, 200, DATA, 400, 300, false, false)
    expect(hit).not.toBeNull()
    expect(hit!.pointIndex).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/chart/drawBar.test.ts
```
Expected: `Cannot find module '../../../src/components/chart/drawBar'`

- [ ] **Step 3: Create `src/components/chart/drawBar.ts`**

```ts
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
    return Math.max(...colSums, 1)
  }
  return Math.max(...data.datasets.flatMap((ds) => ds.data), 1)
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
        const v = ds.data[i] ?? 0
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
        const v = ds.data[i] ?? 0
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
      const v = ds.data[groupI] ?? 0
      const bh = (v / maxVal) * chartH
      const barTop = yOffset - bh
      if (y >= barTop && y <= yOffset) {
        return { datasetIndex: di, pointIndex: groupI, value: v, label: data.labels[groupI] }
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
      return {
        datasetIndex: di,
        pointIndex: groupI,
        value: v,
        label: data.labels[groupI],
      }
    }
  }
  return null
}
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/chart/drawBar.test.ts
```
Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/drawBar.ts tests/components/chart/drawBar.test.ts
git commit -m "feat(charts): add drawBar and hitTestBar with grouped and stacked support"
```

---

## Task 9: VibeChartBar component

**Files:**
- Create: `src/components/VibeChartBar.vue`
- Create: `tests/components/VibeChartBar.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/VibeChartBar.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartBar from '../../src/components/VibeChartBar.vue'
import { mockCanvas, mockResizeObserver } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['Q1', 'Q2', 'Q3'],
  datasets: [
    { label: 'Revenue', data: [10, 20, 15] },
    { label: 'Costs', data: [5, 8, 12] },
  ],
}

beforeEach(() => {
  mockCanvas()
  mockResizeObserver()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('VibeChartBar', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders legend at bottom by default', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA } })
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(true)
  })

  it('renders legend at top when legend="top"', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA, legend: 'top' } })
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(true)
  })

  it('hides legend when legend="none"', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA, legend: 'none' } })
    expect(wrapper.find('.vibe-chart-legend').exists()).toBe(false)
  })

  it('shows dataset labels in legend', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA } })
    const items = wrapper.findAll('.vibe-chart-legend-item')
    expect(items[0].text()).toContain('Revenue')
    expect(items[1].text()).toContain('Costs')
  })

  it('calls clearRect when ResizeObserver triggers', () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    mount(VibeChartBar, { props: { data: DATA } })
    ro.trigger(400, 225)
    expect(ctx.clearRect).toHaveBeenCalled()
  })

  it('applies explicit height when given', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA, height: 400 } })
    expect(wrapper.find('.vibe-chart-canvas-container').attributes('style')).toContain('400px')
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/VibeChartBar.test.ts
```
Expected: `Cannot find module '../../src/components/VibeChartBar.vue'`

- [ ] **Step 3: Create `src/components/VibeChartBar.vue`**

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type PropType } from 'vue'
import type { ChartData, ChartLegendPosition } from '../types'
import { resolveColors } from './chart/chartColors'
import { useChartResize } from './chart/chartResize'
import { bindTooltip } from './chart/chartTooltip'
import { drawBar, hitTestBar } from './chart/drawBar'

const props = defineProps({
  data: { type: Object as PropType<ChartData>, required: true },
  legend: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
  height: { type: [Number, String] as PropType<number | string>, default: 'auto' },
  showAxes: { type: Boolean, default: true },
  showGrid: { type: Boolean, default: true },
  stacked: { type: Boolean, default: false },
})

const containerEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let cleanupTooltip: (() => void) | null = null
let currentW = 0
let currentH = 0

const canvasContainerStyle = computed(() => {
  if (props.height === 'auto') return { width: '100%', aspectRatio: '16/9' }
  const h = typeof props.height === 'number' ? `${props.height}px` : (props.height as string)
  return { width: '100%', height: h }
})

const resolvedColors = computed(() =>
  containerEl.value ? resolveColors(props.data.datasets, containerEl.value) : []
)

function redraw() {
  const canvas = canvasEl.value!
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = currentW * dpr
  canvas.height = currentH * dpr
  ctx.scale(dpr, dpr)
  drawBar(ctx, props.data, currentW, currentH, resolvedColors.value, props.showAxes, props.showGrid, props.stacked)
}

useChartResize(containerEl, canvasEl, (w, h) => {
  currentW = w
  currentH = h
  redraw()
})

onMounted(() => {
  cleanupTooltip = bindTooltip(
    canvasEl.value!,
    (x, y) => hitTestBar(x, y, props.data, currentW, currentH, props.showAxes, props.stacked),
    redraw
  )
})

watch(() => props.data, redraw, { deep: true })

onUnmounted(() => {
  cleanupTooltip?.()
})
</script>

<template>
  <div class="vibe-chart">
    <div v-if="legend === 'top'" class="vibe-chart-legend vibe-chart-legend--top">
      <span v-for="(ds, i) in data.datasets" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ ds.label }}
      </span>
    </div>
    <div ref="containerEl" class="vibe-chart-canvas-container" :style="canvasContainerStyle">
      <canvas ref="canvasEl" style="display: block; width: 100%; height: 100%;" />
    </div>
    <div v-if="legend === 'bottom'" class="vibe-chart-legend vibe-chart-legend--bottom">
      <span v-for="(ds, i) in data.datasets" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ ds.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.vibe-chart { width: 100%; }
.vibe-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.vibe-chart-legend--top { margin-bottom: 0.25rem; }
.vibe-chart-legend--bottom { margin-top: 0.25rem; }
.vibe-chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.vibe-chart-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/VibeChartBar.test.ts
```
Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/VibeChartBar.vue tests/components/VibeChartBar.test.ts
git commit -m "feat(charts): add VibeChartBar component"
```

---

## Task 10: drawPie

**Files:**
- Create: `src/components/chart/drawPie.ts`
- Create: `tests/components/chart/drawPie.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/chart/drawPie.test.ts
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
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/chart/drawPie.test.ts
```
Expected: `Cannot find module '../../../src/components/chart/drawPie'`

- [ ] **Step 3: Create `src/components/chart/drawPie.ts`**

```ts
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

  const values = data.datasets[0]?.data ?? []
  const total = values.reduce((s, v) => s + v, 0) || 1
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

  const values = data.datasets[0]?.data ?? []
  const total = values.reduce((s, v) => s + v, 0) || 1

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
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/chart/drawPie.test.ts
```
Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/drawPie.ts tests/components/chart/drawPie.test.ts
git commit -m "feat(charts): add drawPie and hitTestPie"
```

---

## Task 11: VibeChartPie component

**Files:**
- Create: `src/components/VibeChartPie.vue`
- Create: `tests/components/VibeChartPie.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/components/VibeChartPie.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartPie from '../../src/components/VibeChartPie.vue'
import { mockCanvas, mockResizeObserver } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Market share', data: [50, 30, 20] }],
}

beforeEach(() => {
  mockCanvas()
  mockResizeObserver()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('VibeChartPie', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders legend at bottom by default', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(true)
  })

  it('renders legend at top when legend="top"', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA, legend: 'top' } })
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(true)
  })

  it('hides legend when legend="none"', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA, legend: 'none' } })
    expect(wrapper.find('.vibe-chart-legend').exists()).toBe(false)
  })

  it('shows slice labels in legend (not dataset labels)', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    const items = wrapper.findAll('.vibe-chart-legend-item')
    // Legend items = labels (A, B, C), not dataset label (Market share)
    expect(items).toHaveLength(3)
    expect(items[0].text()).toContain('A')
    expect(items[1].text()).toContain('B')
    expect(items[2].text()).toContain('C')
  })

  it('calls clearRect when ResizeObserver triggers', () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    mount(VibeChartPie, { props: { data: DATA } })
    ro.trigger(400, 400)
    expect(ctx.clearRect).toHaveBeenCalled()
  })

  it('does not render axes or grid props', () => {
    // VibeChartPie has no showAxes/showGrid props — verify component mounts without them
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    expect(wrapper.exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run tests/components/VibeChartPie.test.ts
```
Expected: `Cannot find module '../../src/components/VibeChartPie.vue'`

- [ ] **Step 3: Create `src/components/VibeChartPie.vue`**

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type PropType } from 'vue'
import type { ChartData, ChartLegendPosition } from '../types'
import { resolveSliceColors } from './chart/chartColors'
import { useChartResize } from './chart/chartResize'
import { bindTooltip } from './chart/chartTooltip'
import { drawPie, hitTestPie } from './chart/drawPie'

const props = defineProps({
  data: { type: Object as PropType<ChartData>, required: true },
  legend: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
  height: { type: [Number, String] as PropType<number | string>, default: 'auto' },
})

const containerEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let cleanupTooltip: (() => void) | null = null
let currentW = 0
let currentH = 0

const canvasContainerStyle = computed(() => {
  if (props.height === 'auto') return { width: '100%', aspectRatio: '1/1' }
  const h = typeof props.height === 'number' ? `${props.height}px` : (props.height as string)
  return { width: '100%', height: h }
})

const resolvedColors = computed(() =>
  containerEl.value ? resolveSliceColors(props.data.labels.length, containerEl.value) : []
)

function redraw() {
  const canvas = canvasEl.value!
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = currentW * dpr
  canvas.height = currentH * dpr
  ctx.scale(dpr, dpr)
  drawPie(ctx, props.data, currentW, currentH, resolvedColors.value)
}

useChartResize(containerEl, canvasEl, (w, h) => {
  currentW = w
  currentH = h
  redraw()
})

onMounted(() => {
  cleanupTooltip = bindTooltip(
    canvasEl.value!,
    (x, y) => hitTestPie(x, y, props.data, currentW, currentH),
    redraw
  )
})

watch(() => props.data, redraw, { deep: true })

onUnmounted(() => {
  cleanupTooltip?.()
})
</script>

<template>
  <div class="vibe-chart">
    <div v-if="legend === 'top'" class="vibe-chart-legend vibe-chart-legend--top">
      <span v-for="(label, i) in data.labels" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ label }}
      </span>
    </div>
    <div ref="containerEl" class="vibe-chart-canvas-container" :style="canvasContainerStyle">
      <canvas ref="canvasEl" style="display: block; width: 100%; height: 100%;" />
    </div>
    <div v-if="legend === 'bottom'" class="vibe-chart-legend vibe-chart-legend--bottom">
      <span v-for="(label, i) in data.labels" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.vibe-chart { width: 100%; }
.vibe-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.vibe-chart-legend--top { margin-bottom: 0.25rem; }
.vibe-chart-legend--bottom { margin-top: 0.25rem; }
.vibe-chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.vibe-chart-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run tests/components/VibeChartPie.test.ts
```
Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/VibeChartPie.vue tests/components/VibeChartPie.test.ts
git commit -m "feat(charts): add VibeChartPie component with slice-based legend and colors"
```

---

## Task 12: Wire exports and full test run

**Files:**
- Modify: `src/types.ts` (already done in Task 1 — verify only)
- Modify: `src/components/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Add imports, exports, and plugin registration to `src/components/index.ts`**

Add after existing imports (around line with `// Export all components`):

```ts
// Chart Components
import VibeChartLine from './VibeChartLine.vue'
import VibeChartBar from './VibeChartBar.vue'
import VibeChartPie from './VibeChartPie.vue'
```

Add to the `export { ... }` block:
```ts
  // Chart
  VibeChartLine,
  VibeChartBar,
  VibeChartPie,
```

Add to the `install(app)` function (after `// Data` section):
```ts
    // Chart
    app.component('VibeChartLine', VibeChartLine)
    app.component('VibeChartBar', VibeChartBar)
    app.component('VibeChartPie', VibeChartPie)
```

- [ ] **Step 2: Add re-exports to `src/index.ts`**

Add after existing component exports:
```ts
export { default as VibeChartLine } from './components/VibeChartLine.vue'
export { default as VibeChartBar } from './components/VibeChartBar.vue'
export { default as VibeChartPie } from './components/VibeChartPie.vue'
export type { ChartData, ChartDataset, ChartLegendPosition } from './types'
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```
Expected: all tests pass, no failures.

- [ ] **Step 4: TypeScript check**

```bash
npx vue-tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/index.ts src/index.ts
git commit -m "feat(charts): register and export VibeChartLine, VibeChartBar, VibeChartPie"
```

---

## Self-Review Notes

- **Spec coverage:** All props covered (legend, height, showAxes, showGrid, smooth, fill, stacked). Color cycling via BS vars ✓. ResizeObserver ✓. Tooltip ✓. No fallbacks ✓. No external deps ✓.
- **Type consistency:** `TooltipHit` defined once in `chartTypes.ts`, imported by drawLine/drawBar/drawPie and chartTooltip. `ChartData`/`ChartDataset`/`ChartLegendPosition` defined once in `src/types.ts`.
- **Pie legend:** Iterates `data.labels` (slice names), not `data.datasets` (dataset names) — matches spec intent.
- **Pie aspect ratio:** Default is `1/1` (square) rather than `16/9` — more appropriate for a pie chart.
- **No placeholders:** All steps contain complete code.
