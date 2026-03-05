# VibeAlert

Alert messages with Bootstrap styling, supporting variants, dismissible functionality, and v-model binding.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `'primary'` | Color variant |
| `modelValue` | `Boolean` | `true` | Controls visibility (v-model support) |
| `dismissable` | `Boolean` | `false` | Shows close button when true |
| `message` | `String` | Required | Alert message text |
| `fade` | `Boolean` | `true` | Use fade animation on dismissal |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when alert is dismissed |
| `close` | - | Emitted when dismissal starts |
| `closed` | - | Emitted when dismissal completes |

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

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Alert functionality when it is mounted, ensuring smooth dismissal animations.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

## Bootstrap CSS Classes

- `.alert`
- `.alert-{variant}`
- `.alert-dismissible`
- `.fade`, `.show`
