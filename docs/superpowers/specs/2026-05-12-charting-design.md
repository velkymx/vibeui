# VibeChart Components — Design Spec
**Date:** 2026-05-12  
**Status:** Approved

## Overview

Three canvas-based chart components for VibeUI: `VibeChartLine`, `VibeChartBar`, `VibeChartPie`. ES2022+, no external dependencies, Bootstrap CSS var color integration, `ResizeObserver`-driven responsiveness.

## Architecture

### File Structure

```
src/components/
  VibeChartLine.vue
  VibeChartBar.vue
  VibeChartPie.vue

src/components/chart/            ← internal only, not exported
  chartColors.ts                 ← Bootstrap var resolver + cycler
  chartTooltip.ts                ← canvas tooltip hit-test + render
  chartResize.ts                 ← ResizeObserver setup/teardown
  chartTypes.ts                  ← shared internal types
```

Three public components consume `chart/` internals directly. Nothing in `chart/` appears in `src/index.ts`. Each component owns its own `draw()` canvas function.

### Approach

- Approach B: three separate components with shared internal utilities
- No exported composable — `chart/` is private infrastructure
- No fallbacks, no defensive wrapping — trust the data
- No animation, snap render only

## Data Shape

```ts
// src/types.ts additions
export interface ChartDataset {
  label: string
  data: number[]
  color?: string        // overrides auto color for this series
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export type ChartLegendPosition = 'top' | 'bottom' | 'none'
```

## Props API

### All three components

| Prop | Type | Default |
|------|------|---------|
| `data` | `ChartData` | required |
| `legend` | `ChartLegendPosition` | `'bottom'` |
| `height` | `number \| string` | `'auto'` (16:9 ratio) |

### VibeChartLine + VibeChartBar only

| Prop | Type | Default |
|------|------|---------|
| `show-axes` | `boolean` | `true` |
| `show-grid` | `boolean` | `true` |

### VibeChartLine only

| Prop | Type | Default |
|------|------|---------|
| `smooth` | `boolean` | `false` |
| `fill` | `boolean` | `false` |

### VibeChartBar only

| Prop | Type | Default |
|------|------|---------|
| `stacked` | `boolean` | `false` |

## Canvas Rendering

### Resize

```ts
// chartResize.ts
export function useChartResize(
  container: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
  onResize: (w: number, h: number) => void
): void
```

- `ResizeObserver` on container div
- Canvas pixel dims: `canvas.width = dpr * w`, `ctx.scale(dpr, dpr)` for HiDPI
- Container: `width: 100%`, height auto = `w * (9/16)` or `height` prop
- Set up in `onMounted`, torn down in `onUnmounted`

### Draw cycle

- `draw(ctx, data, w, h, props)` — pure function per component
- `watch(() => props.data, redraw, { deep: true })` triggers on data change
- Every resize calls `redraw()`
- ES2022+: `Array.at()`, `Object.hasOwn()`, etc.

## Color System

```ts
// chartColors.ts
const BS_VARS = [
  '--bs-primary', '--bs-success', '--bs-danger',
  '--bs-warning', '--bs-info', '--bs-secondary',
  '--bs-dark', '--bs-light'
]

export function resolveColors(
  datasets: ChartDataset[],
  el: HTMLElement
): string[]
```

- Per-dataset `color` prop wins
- Otherwise cycles `--bs-*` vars via `getComputedStyle(el)` at draw time
- Dark mode automatic — reads current computed value each redraw
- Cycles with `i % BS_VARS.length` for unlimited datasets

## Tooltip

```ts
// chartTooltip.ts
export interface TooltipHit {
  datasetIndex: number
  pointIndex: number
  value: number
  label: string
}

export function bindTooltip(
  canvas: HTMLCanvasElement,
  hitTest: (x: number, y: number) => TooltipHit | null,
  redraw: () => void
): () => void  // returns cleanup fn
```

- `mousemove` listener on canvas
- Each component provides its own `hitTest(x, y)` fn
- On hit: redraws base chart then draws rounded-rect overlay at cursor
- `mouseleave`: clears tooltip (redraw base only)
- Single canvas — no overlay element

## Legend

HTML, not canvas. Order in DOM determines visual position.

```html
<div v-if="legend !== 'none'" :class="['vibe-chart-legend', `vibe-chart-legend--${legend}`]">
  <span v-for="(ds, i) in data.datasets" :key="i" class="vibe-chart-legend-item">
    <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }"></span>
    {{ ds.label }}
  </span>
</div>
<canvas ref="canvasEl" />
```

- `legend="top"`: div before canvas
- `legend="bottom"`: div after canvas
- `legend="none"`: v-if removes it

## Exports

`src/types.ts`: add `ChartDataset`, `ChartData`, `ChartLegendPosition`

`src/index.ts`:
```ts
export { default as VibeChartLine } from './components/VibeChartLine.vue'
export { default as VibeChartBar } from './components/VibeChartBar.vue'
export { default as VibeChartPie } from './components/VibeChartPie.vue'
export type { ChartData, ChartDataset, ChartLegendPosition } from './types'
```

`src/components/index.ts`: register all three in plugin.

No new peer dependencies. Zero external imports in chart code.
