# VibeToast

Push notifications for lightweight alerts. Requires Bootstrap JS.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `undefined` | Unique identifier |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `title` | `String` | `''` | Toast title |
| `variant` | `Variant` | `undefined` | Color variant |
| `autohide` | `Boolean` | `true` | Auto hide after delay |
| `delay` | `Number` | `5000` | Delay in milliseconds |

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

### Basic Toast

```vue
<template>
  <VibeToast id="basicToast" title="Notification">
    This is a toast message
  </VibeToast>
</template>
```

### Colored Toasts

```vue
<template>
  <div>
    <VibeToast id="toast1" title="Success" variant="success">
      Operation completed successfully!
    </VibeToast>

    <VibeToast id="toast2" title="Warning" variant="warning">
      Please review your changes
    </VibeToast>

    <VibeToast id="toast3" title="Error" variant="danger">
      An error occurred
    </VibeToast>
  </div>
</template>
```

### Custom Delay

```vue
<template>
  <VibeToast id="delayToast" title="Quick Toast" :delay="2000">
    This will auto-hide after 2 seconds
  </VibeToast>
</template>
```

### No Auto Hide

```vue
<template>
  <VibeToast id="persistentToast" title="Important" :autohide="false">
    This toast won't auto-hide
  </VibeToast>
</template>
```

### Toast Container Example

```vue
<script setup>
import { ref } from 'vue'

const showToast = ref(false)

const triggerToast = () => {
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}
</script>

<template>
  <div>
    <VibeButton @click="triggerToast">Show Toast</VibeButton>

    <!-- Toast Container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <VibeToast
        v-if="showToast"
        id="notificationToast"
        title="Notification"
        variant="primary"
      >
        Toast message content
      </VibeToast>
    </div>
  </div>
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

## Bootstrap CSS Classes

- `.toast`
- `.toast-header`
- `.toast-body`
- `.text-bg-{variant}`
