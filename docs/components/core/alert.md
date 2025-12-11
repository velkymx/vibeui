# VibeAlert

Alert messages with Bootstrap 5.3 styling, supporting variants, dismissible functionality, and v-model binding.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `'primary'` | Color variant: `'primary'`, `'secondary'`, `'success'`, `'danger'`, `'warning'`, `'info'`, `'light'`, `'dark'` |
| `modelValue` | `Boolean` | `true` | Controls visibility (v-model support) |
| `dismissable` | `Boolean` | `false` | Shows close button when true |
| `message` | `String` | Required | Alert message text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when alert is dismissed |
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Alert content (overrides `message` prop) |

## Usage

### Basic Alert

```vue
<template>
  <VibeAlert variant="success" message="Operation completed successfully!" />
</template>
```

### Dismissible Alert with v-model

```vue
<script setup>
import { ref } from 'vue'

const showAlert = ref(true)
</script>

<template>
  <VibeAlert
    variant="warning"
    dismissable
    v-model="showAlert"
    message="This alert can be dismissed"
  />
</template>
```

### Using Slots

```vue
<template>
  <VibeAlert variant="info" dismissable>
    <strong>Hey!</strong> This is custom content.
  </VibeAlert>
</template>
```

### All Variants

```vue
<template>
  <div>
    <VibeAlert variant="primary" message="Primary alert" />
    <VibeAlert variant="secondary" message="Secondary alert" />
    <VibeAlert variant="success" message="Success alert" />
    <VibeAlert variant="danger" message="Danger alert" />
    <VibeAlert variant="warning" message="Warning alert" />
    <VibeAlert variant="info" message="Info alert" />
    <VibeAlert variant="light" message="Light alert" />
    <VibeAlert variant="dark" message="Dark alert" />
  </div>
</template>
```

## Bootstrap CSS Classes

This component uses the following Bootstrap classes:
- `.alert`
- `.alert-{variant}`
- `.btn-close`
