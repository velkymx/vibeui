# VibeOffcanvas

Hidden sidebar for navigation or additional content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `title` | `String` | `''` | Offcanvas title |
| `placement` | `OffcanvasPlacement` | `'start'` | Placement: `'start'`, `'end'`, `'top'`, `'bottom'` |
| `backdrop` | `Boolean\|String` | `true` | Backdrop: `true`, `false`, or `'static'` |
| `scroll` | `Boolean` | `false` | Allow body scrolling |
| `teleport` | `Boolean\|String` | `'body'` | Destination for Vue Teleport |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when visibility changes |
| `show` | - | Emitted when offcanvas starts showing |
| `shown` | - | Emitted when offcanvas is fully shown |
| `hide` | - | Emitted when offcanvas starts hiding |
| `hidden` | - | Emitted when offcanvas is fully hidden |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Offcanvas body content |
| `header` | Custom header content |

## Usage

### Reactive Usage (v-model)

```vue
<template>
  <div>
    <VibeButton variant="primary" @click="showOffcanvas = true">
      Open Offcanvas
    </VibeButton>

    <VibeOffcanvas v-model="showOffcanvas" title="Reactive Offcanvas">
      This offcanvas is controlled via Vue state.
    </VibeOffcanvas>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showOffcanvas = ref(false)
</script>
```

### Placement Options

```vue
<template>
  <VibeOffcanvas title="Right Side" placement="end">
    Content on the right
  </VibeOffcanvas>
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Offcanvas functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Teleportation:** By default, this component teleports its DOM elements to the `<body>` to avoid stacking context issues. You can customize this with the `teleport` prop.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

## Mobile Optimization

**Safe Areas:** When used in hybrid apps with `viewport-fit=cover`, the offcanvas header automatically adds padding to account for device notches.

**Hardware Back Button:** On Android devices in hybrid environments, the hardware back button will automatically close the offcanvas if it is open.

**Dynamic Height:** The offcanvas uses `dvh` (dynamic viewport height) units to ensure it occupies the full screen height even when mobile browser bars are visible.

## Bootstrap CSS Classes

- `.offcanvas`
- `.offcanvas-{placement}`
- `.offcanvas-header`
- `.offcanvas-title`
- `.offcanvas-body`
