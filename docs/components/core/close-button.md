# VibeCloseButton

Generic close button for dismissing content like modals and alerts.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `Boolean` | `false` | Disable the close button |
| `white` | `Boolean` | `false` | Use white variant for dark backgrounds |
| `ariaLabel` | `String` | `'Close'` | Accessible label for screen readers |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when button is clicked (unless disabled) |
| `component-error` | `Object` | Emitted when an error occurs |

## Usage

### Basic Close Button

```vue
<template>
  <VibeCloseButton @click="handleClose" />
</template>

<script setup>
const handleClose = () => {
  console.log('Closed!')
}
</script>
```

### White Variant

```vue
<template>
  <div class="bg-dark p-3">
    <VibeCloseButton white />
  </div>
</template>
```

### Custom Aria Label

```vue
<template>
  <VibeCloseButton aria-label="Dismiss notification" />
</template>
```

### Disabled State

```vue
<template>
  <VibeCloseButton disabled />
</template>
```

### In Alert Context

```vue
<script setup>
import { ref } from 'vue'

const showAlert = ref(true)
</script>

<template>
  <div v-if="showAlert" class="alert alert-warning d-flex justify-content-between">
    <span>Warning message</span>
    <VibeCloseButton @click="showAlert = false" />
  </div>
</template>
```

## Bootstrap CSS Classes

- `.btn-close`
- `.btn-close-white`
