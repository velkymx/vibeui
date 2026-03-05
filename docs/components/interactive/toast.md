# VibeToast

Push notifications for lightweight alerts.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `title` | `String` | `''` | Toast title |
| `variant` | `Variant` | `undefined` | Color variant |
| `autohide` | `Boolean` | `true` | Auto hide after delay |
| `delay` | `Number` | `5000` | Delay in milliseconds |
| `teleport` | `Boolean\|String` | `'body'` | Destination for Vue Teleport |
| `placement` | `ToastPlacement` | `'top-end'` | Position of the toast |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when visibility changes |
| `show` | - | Emitted when toast starts showing |
| `shown` | - | Emitted when toast is fully shown |
| `hide` | - | Emitted when toast starts hiding |
| `hidden` | - | Emitted when toast is fully hidden |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Toast body content |
| `header` | Custom header content |

## Usage

### Reactive Usage (v-model)

```vue
<template>
  <div>
    <VibeButton @click="showToast = true">Show Toast</VibeButton>

    <VibeToast v-model="showToast" title="Notification" variant="primary">
      This toast is controlled via Vue state.
    </VibeToast>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showToast = ref(false)
</script>
```

### Placed Toasts

```vue
<template>
  <div>
    <VibeToast title="Success" variant="success" placement="bottom-end">
      Operation completed successfully!
    </VibeToast>

    <VibeToast title="Center" variant="info" placement="middle-center">
      I am in the middle of the screen
    </VibeToast>
  </div>
</template>
```

### Colored Toasts

```vue
<template>
  <div>
    <VibeToast title="Success" variant="success">
      Operation completed successfully!
    </VibeToast>

    <VibeToast title="Warning" variant="warning">
      Please review your changes
    </VibeToast>
  </div>
</template>
```

### Custom Delay

```vue
<template>
  <VibeToast title="Quick Toast" :delay="2000">
    This will auto-hide after 2 seconds
  </VibeToast>
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Toast functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Automatic Container:** Unlike raw Bootstrap, VibeToast automatically manages its own `toast-container` and positioning based on the `placement` prop.

**Teleportation:** By default, this component teleports to the `<body>` to ensure it is always visible on top of other elements.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

## Bootstrap CSS Classes

- `.toast`
- `.toast-header`
- `.toast-body`
- `.text-bg-{variant}`
- `.toast-container`
