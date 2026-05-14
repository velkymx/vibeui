# VibeChartPie

Canvas-based pie chart with interactive tooltips, Bootstrap-aware color cycling, and responsive sizing.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ChartData` | Required | Chart data: labels array + single dataset |
| `legend` | `'top' \| 'bottom' \| 'none'` | `'bottom'` | Legend position |
| `height` | `Number \| String` | `'auto'` | Fixed height in px or CSS string. `'auto'` uses 1:1 aspect ratio |

## Data Shape

Pie charts use a single dataset. Each value in `data` corresponds to one slice, identified by the matching index in `labels`.

```ts
interface ChartData {
  labels: string[]       // One label per slice
  datasets: ChartDataset[]  // Use one dataset for pie charts
}

interface ChartDataset {
  label: string          // Series name (used in tooltip prefix)
  data: number[]         // One value per slice (raw values; chart computes percentages)
  color?: string         // Not used for pie — slice colors are auto-cycled from Bootstrap
                         // CSS variables (--bs-primary, --bs-success, --bs-danger, ...)
}
```

Slice colors are always auto-assigned from Bootstrap CSS variables in order — individual slice color overrides via `dataset.color` are not supported on pie charts.

Import from `@velkymx/vibeui`:

```ts
import type { ChartData } from '@velkymx/vibeui'
```

## Usage

### Basic Pie Chart

```vue
<script setup>
const data = {
  labels: ['Direct', 'Organic', 'Referral', 'Social'],
  datasets: [
    { label: 'Traffic', data: [40, 30, 20, 10] }
  ]
}
</script>

<template>
  <VibeChartPie :data="data" />
</template>
```

### Fixed Height, Legend at Top

```vue
<template>
  <VibeChartPie :data="data" :height="300" legend="top" />
</template>
```

### No Legend

```vue
<template>
  <VibeChartPie :data="data" legend="none" />
</template>
```

### Reactive Data

```vue
<script setup>
import { ref } from 'vue'

const data = ref({
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Share', data: [50, 30, 20] }]
})

function refresh() {
  data.value.datasets[0].data = [35, 45, 20]
}
</script>

<template>
  <VibeChartPie :data="data" />
  <button @click="refresh">Refresh</button>
</template>
```

## Notes

- **No external dependency.** VibeChartPie draws directly on a `<canvas>` element — no Chart.js or other charting library required.
- **Color cycling.** Slice colors cycle through Bootstrap CSS variables (`--bs-primary`, `--bs-success`, `--bs-danger`, `--bs-warning`, `--bs-info`, ...) resolved from the container's computed styles. Colors follow your Bootstrap theme and dark mode.
- **Responsive.** Defaults to a square 1:1 aspect ratio. The canvas resizes via `ResizeObserver` and redraws at device pixel ratio for crisp HiDPI output.
- **Tooltips.** Hover over a slice to see the label and value.
- **Single dataset.** Pass exactly one dataset. Multiple datasets are silently ignored.
