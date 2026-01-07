# VibeProgress

Data-driven progress bar component supporting single or multiple bars.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `String` | `undefined` | Custom height (e.g., `'20px'`, `'2rem'`) |
| `bars` | `ProgressBar[]` | Required | Array of progress bars to display |

### ProgressBar Interface

```typescript
interface ProgressBar {
  value: number
  max?: number
  variant?: Variant
  striped?: boolean
  animated?: boolean
  label?: string
  showValue?: boolean
}
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `label` | `{ bar, index }` | Custom label rendering for each bar |

## Usage

### Basic Progress

```vue
<template>
  <VibeProgress :bars="[{ value: 25 }]" />
</template>
```

### With Label

```vue
<template>
  <VibeProgress :bars="[{ value: 75, showValue: true }]" />
</template>
```

### Custom Height

```vue
<template>
  <VibeProgress height="20px" :bars="[{ value: 50 }]" />
</template>
```

### Colored Progress Bars

```vue
<template>
  <div class="d-flex flex-column gap-2">
    <VibeProgress :bars="[{ value: 25, variant: 'success' }]" />
    <VibeProgress :bars="[{ value: 50, variant: 'info' }]" />
    <VibeProgress :bars="[{ value: 75, variant: 'warning' }]" />
    <VibeProgress :bars="[{ value: 100, variant: 'danger' }]" />
  </div>
</template>
```

### Striped and Animated

```vue
<template>
  <div class="d-flex flex-column gap-2">
    <!-- Striped -->
    <VibeProgress :bars="[{ value: 60, variant: 'success', striped: true }]" />

    <!-- Animated stripes -->
    <VibeProgress :bars="[{ value: 75, variant: 'info', animated: true }]" />
  </div>
</template>
```

### Multiple Bars

Stack multiple progress bars in a single component:

```vue
<template>
  <VibeProgress :bars="progressBars" />
</template>

<script setup>
const progressBars = [
  { value: 15, variant: 'success' },
  { value: 30, variant: 'warning' },
  { value: 20, variant: 'danger' }
]
</script>
```

### Dynamic Progress

```vue
<script setup>
import { ref, onMounted } from 'vue'

const progress = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 10
    } else {
      clearInterval(interval)
    }
  }, 500)
})
</script>

<template>
  <VibeProgress :bars="[{
    value: progress,
    variant: 'primary',
    showValue: true
  }]" />
</template>
```

### Custom Label Rendering

Use the `label` scoped slot for custom labels:

```vue
<template>
  <VibeProgress :bars="progressBars">
    <template #label="{ bar }">
      <strong>{{ bar.value }}% Complete</strong>
    </template>
  </VibeProgress>
</template>

<script setup>
const progressBars = [{ value: 75, variant: 'success' }]
</script>
```

### Complex Example

```vue
<script setup>
import { ref } from 'vue'

const tasks = ref([
  { name: 'Design', value: 100, variant: 'success' },
  { name: 'Development', value: 75, variant: 'primary', animated: true },
  { name: 'Testing', value: 50, variant: 'warning', striped: true },
  { name: 'Deployment', value: 0, variant: 'secondary' }
])
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <div v-for="task in tasks" :key="task.name">
      <div class="d-flex justify-content-between mb-1">
        <span>{{ task.name }}</span>
        <span>{{ task.value }}%</span>
      </div>
      <VibeProgress :bars="[task]" />
    </div>
  </div>
</template>
```

## Bootstrap CSS Classes

- `.progress`
- `.progress-bar`
- `.bg-{variant}`
- `.progress-bar-striped`
- `.progress-bar-animated`
