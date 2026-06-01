# VibeModal

Modal dialogs for lightboxes, user notifications, or custom content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier for the modal |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `title` | `String` | `''` | Modal title |
| `size` | `Size\|'xl'` | `undefined` | Modal size: `'sm'`, `'lg'`, `'xl'` |
| `centered` | `Boolean` | `false` | Vertically center modal |
| `scrollable` | `Boolean` | `false` | Scrollable modal body |
| `fullscreen` | `Boolean\|String` | `false` | Fullscreen: `true` or breakpoint |
| `staticBackdrop` | `Boolean` | `false` | Don't close on backdrop click |
| `hideHeader` | `Boolean` | `false` | Hide header section |
| `hideFooter` | `Boolean` | `false` | Hide footer section |
| `teleport` | `Boolean\|String` | `'body'` | Destination for Vue Teleport |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when modal visibility changes |
| `show` | - | Emitted when modal starts showing |
| `shown` | - | Emitted when modal is fully shown |
| `hide` | - | Emitted when modal starts hiding |
| `hidden` | - | Emitted when modal is fully hidden |
| `component-error` | `ComponentError` | Emitted if Bootstrap JS fails to load |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Modal body content |
| `header` | Custom header content |
| `footer` | Custom footer content |

## Usage

### Reactive Usage (v-model)

```vue
<template>
  <div>
    <VibeButton variant="primary" @click="showModal = true">
      Open Modal
    </VibeButton>

    <VibeModal v-model="showModal" title="Reactive Modal">
      <p>This modal is controlled via Vue state.</p>
    </VibeModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
```

### Sized Modals

```vue
<template>
  <div>
    <VibeModal title="Small Modal" size="sm">
      Small modal content
    </VibeModal>

    <VibeModal title="Large Modal" size="lg">
      Large modal content
    </VibeModal>
  </div>
</template>
```

### Centered Modal

```vue
<template>
  <VibeModal title="Centered Modal" centered>
    This modal is vertically centered.
  </VibeModal>
</template>
```

### Custom Footer

```vue
<template>
  <VibeModal v-model="showModal" title="Custom Footer">
    <p>Modal with custom footer buttons.</p>

    <template #footer>
      <VibeButton variant="secondary" @click="showModal = false">Close</VibeButton>
      <VibeButton variant="primary" @click="save">Save changes</VibeButton>
    </template>
  </VibeModal>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(true)
function save() {
  // persist changes...
  showModal.value = false
}
</script>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Modal functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Teleportation:** By default, this component teleports its DOM elements to the `<body>` to avoid stacking context issues. You can customize this with the `teleport` prop.

**Focus Return (WCAG 2.4.3):** When the modal closes, focus is automatically returned to the element that opened it, including for programmatically opened modals.

**Escape Hatch:** The exposed `_unsafe_bsInstance` template ref gives raw access to the underlying Bootstrap Modal instance. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on it directly **will** break the component. Prefer `v-model` and the exposed `show()` / `hide()` methods.

## Mobile Optimization

**Safe Areas:** In fullscreen mode, the modal header and footer automatically respect device safe areas (notches) in hybrid apps.

**Hardware Back Button:** On Android devices in hybrid environments, the hardware back button will automatically close the modal if it is open.

**Dynamic Height:** Fullscreen modals use `dvh` (dynamic viewport height) units to ensure they occupy the full screen height even when mobile browser bars are visible.

## Bootstrap CSS Classes

- `.modal`
- `.modal-dialog`
- `.modal-content`
- `.modal-header`
- `.modal-title`
- `.modal-body`
- `.modal-footer`
- `.modal-{size}`
- `.modal-dialog-centered`
- `.modal-dialog-scrollable`
- `.modal-fullscreen`
