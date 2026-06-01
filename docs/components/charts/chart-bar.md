# VibeChartBar

Canvas-based bar chart with responsive sizing, interactive tooltips, stacked mode, and Bootstrap-aware color cycling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ChartData` | Required | Chart data: labels array + datasets array |
| `legend` | `'top' \| 'bottom' \| 'none'` | `'bottom'` | Legend position |
| `height` | `Number \| String` | `'auto'` | Fixed height in px or CSS string. `'auto'` uses 16:9 aspect ratio |
| `showAxes` | `Boolean` | `true` | Render X and Y axes |
| `showGrid` | `Boolean` | `true` | Render horizontal grid lines |
| `stacked` | `Boolean` | `false` | Stack datasets on top of each other instead of grouping side-by-side |

## Data Shape

```ts
interface ChartData {
  labels: string[]       // X-axis category labels
  datasets: ChartDataset[]
}

interface ChartDataset {
  label: string          // Series name (shown in legend and tooltip)
  data: number[]         // One value per label
  color?: string         // CSS color string. Defaults to Bootstrap CSS variables cycling through
                         // --bs-primary, --bs-success, --bs-danger, --bs-warning, --bs-info, ...
}
```

Import from `@velkymx/vibeui`:

```ts
import type { ChartData } from '@velkymx/vibeui'
```

## Usage

### Basic Bar Chart

```vue
<script setup>
const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    { label: 'Orders', data: [34, 52, 48, 61, 44] }
  ]
}
</script>

<template>
  <VibeChartBar :data="data" />
</template>
```

### Grouped Bars (Multiple Datasets)

```vue
<template>
  <VibeChartBar :data="{
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Product A', data: [120, 145, 132, 170] },
      { label: 'Product B', data: [ 80,  95,  88, 105] }
    ]
  }" />
</template>
```

### Stacked Bar Chart

```vue
<template>
  <VibeChartBar :data="data" stacked />
</template>
```

### Fixed Height, Legend at Top

```vue
<template>
  <VibeChartBar :data="data" :height="250" legend="top" />
</template>
```

### Custom Colors

```vue
<template>
  <VibeChartBar :data="{
    labels: ['A', 'B', 'C'],
    datasets: [
      { label: 'Wins',   data: [8, 5, 7], color: '#2ecc71' },
      { label: 'Losses', data: [2, 5, 3], color: '#e74c3c' }
    ]
  }" />
</template>
```

### Reactive Data

```vue
<script setup>
import { ref } from 'vue'

const data = ref({
  labels: ['Jan', 'Feb'],
  datasets: [{ label: 'Sales', data: [100, 150] }]
})

function addWeek() {
  data.value.labels.push('Mar')
  data.value.datasets[0].data.push(130)
}
</script>

<template>
  <VibeChartBar :data="data" />
  <button @click="addWeek">Add Month</button>
</template>
```

## Notes

- **No external dependency.** VibeChartBar draws directly on a `<canvas>` element — no Chart.js or other charting library required.
- **Color cycling.** When `color` is omitted on a dataset, colors cycle through Bootstrap's CSS variables (`--bs-primary`, `--bs-success`, `--bs-danger`, ...) resolved from the container's computed styles. Colors follow your Bootstrap theme and dark mode automatically.
- **Responsive.** The canvas resizes via `ResizeObserver` and redraws at device pixel ratio for crisp HiDPI output.
- **Tooltips.** Hover over any bar to see the category, series name, and value.
