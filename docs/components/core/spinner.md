# VibeSpinner

Loading spinner with border or grow animation styles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `undefined` | Text color variant |
| `type` | `SpinnerType` | `'border'` | Spinner type: `'border'` or `'grow'` |
| `size` | `Size` | `undefined` | Spinner size: `'sm'` or `'lg'` |
| `label` | `String` | `'Loading...'` | Screen reader text |
| `tag` | `String` | `'div'` | HTML tag to render |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Usage

### Basic Spinner

```vue
<template>
  <VibeSpinner />
</template>
```

### Grow Spinner

```vue
<template>
  <VibeSpinner type="grow" />
</template>
```

### Colored Spinners

```vue
<template>
  <div>
    <VibeSpinner variant="primary" />
    <VibeSpinner variant="success" />
    <VibeSpinner variant="danger" />
    <VibeSpinner variant="warning" />
    <VibeSpinner variant="info" />
  </div>
</template>
```

### Small Spinners

```vue
<template>
  <div>
    <VibeSpinner size="sm" />
    <VibeSpinner type="grow" size="sm" />
  </div>
</template>
```

### In Button

```vue
<template>
  <VibeButton variant="primary" disabled>
    <VibeSpinner size="sm" tag="span" />
    Loading...
  </VibeButton>
</template>
```

### Custom Label

```vue
<template>
  <VibeSpinner label="Please wait while we load your data..." />
</template>
```

### Loading State Example

```vue
<script setup>
import { ref } from 'vue'

const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 3000)
</script>

<template>
  <div>
    <VibeSpinner v-if="loading" variant="primary" />
    <div v-else>Content loaded!</div>
  </div>
</template>
```

## Bootstrap CSS Classes

- `.spinner-border` or `.spinner-grow`
- `.text-{variant}`
- `.spinner-{type}-{size}`
- `.visually-hidden` (for label)
