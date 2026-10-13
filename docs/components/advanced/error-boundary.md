# VibeErrorBoundary

Contains render/lifecycle failures to a region of the page. When a descendant throws, the boundary shows a fallback, reports the failure, and stops the error from blanking the whole app. The app-level counterpart is the `error:component` bus channel (see the event bus docs).

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `error` | `unknown` | The captured descendant error |
| `component-error` | `ComponentError` | Structured report, also published on the bus `error:component` channel |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | — | Protected content |
| `fallback` | `{ error, reset }` | Custom fallback; `reset()` clears the error and re-renders the default slot |

Without a `#fallback` slot, a minimal Bootstrap danger alert renders.

## Exposed

`reset()` (template ref) clears the error and re-renders the default slot. If the child still throws, the boundary captures again: reset recovers only fixed content.

## Usage

### Wrapping a heavy region

```vue
<template>
  <VibeErrorBoundary>
    <VibeChartLine :data="chartData" />
  </VibeErrorBoundary>
</template>
```

### Custom fallback with retry

```vue
<script setup>
import { ref } from 'vue'

const boundary = ref(null)
const query = ref('')

function retry() {
  query.value = ''
  boundary.value?.reset()
}
</script>

<template>
  <VibeErrorBoundary ref="boundary">
    <VibeDataTable :items="rows" :columns="columns" />

    <template #fallback="{ error }">
      <div class="alert alert-warning" role="alert">
        <p class="mb-2">This table failed to render: {{ error.message }}</p>
        <button type="button" class="btn btn-sm btn-warning" @click="retry">
          Reset table
        </button>
      </div>
    </template>
  </VibeErrorBoundary>
</template>
```
