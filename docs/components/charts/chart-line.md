# VibeChartLine

Canvas-based line chart with responsive sizing, interactive tooltips, and Bootstrap-aware color cycling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ChartData` | Required | Chart data: labels array + datasets array |
| `legend` | `'top' \| 'bottom' \| 'none'` | `'bottom'` | Legend position |
| `height` | `Number \| String` | `'auto'` | Fixed height in px or CSS string. `'auto'` uses 16:9 aspect ratio |
| `showAxes` | `Boolean` | `true` | Render X and Y axes |
| `showGrid` | `Boolean` | `true` | Render horizontal grid lines |
| `smooth` | `Boolean` | `false` | Render lines as bezier curves instead of straight segments |
| `fill` | `Boolean` | `false` | Fill the area under each line |

## Data Shape

```ts
interface ChartData {
  labels: string[]       // X-axis labels
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

### Basic Line Chart

```vue
<script setup>
import { ref } from 'vue'

const data = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: 'Revenue', data: [12000, 18000, 15000, 22000, 19000, 27000] }
  ]
})
</script>

<template>
  <VibeChartLine :data="data" />
</template>
```

### Multiple Series

```vue
<template>
  <VibeChartLine :data="{
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Sales', data: [45, 62, 58, 75] },
      { label: 'Costs', data: [30, 35, 32, 40] }
    ]
  }" />
</template>
```

### Smooth Filled Curves

```vue
<template>
  <VibeChartLine :data="data" smooth fill />
</template>
```

### Fixed Height, Legend at Top

```vue
<template>
  <VibeChartLine :data="data" :height="300" legend="top" />
</template>
```

### Custom Colors

Override per-dataset colors with any CSS color string:

```vue
<template>
  <VibeChartLine :data="{
    labels: ['A', 'B', 'C'],
    datasets: [
      { label: 'Alpha', data: [1, 3, 2], color: '#e74c3c' },
      { label: 'Beta',  data: [2, 1, 4], color: '#3498db' }
    ]
  }" />
</template>
```

### Reactive Data

The chart redraws whenever `data` changes:

```vue
<script setup>
import { ref } from 'vue'

const data = ref({
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{ label: 'Visits', data: [100, 200, 150] }]
})

function addMonth() {
  data.value.labels.push('Apr')
  data.value.datasets[0].data.push(180)
}
</script>

<template>
  <VibeChartLine :data="data" />
  <button @click="addMonth">Add Month</button>
</template>
```

## Notes

- **No external dependency.** VibeChartLine draws directly on a `<canvas>` element — no Chart.js or other charting library required.
- **Color cycling.** When `color` is omitted on a dataset, colors cycle through Bootstrap's CSS variables (`--bs-primary`, `--bs-success`, `--bs-danger`, ...) resolved from the computed styles of the container. Colors automatically follow your Bootstrap theme, including dark mode.
- **Responsive.** The canvas resizes via `ResizeObserver` on the container element and redraws at the device pixel ratio for crisp output on HiDPI screens.
- **Tooltips.** Hover over a data point to see the label and value. The chart redraws on each tooltip state change.
