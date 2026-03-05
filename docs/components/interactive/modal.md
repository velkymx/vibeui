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

### Basic Modal (Data Attributes)

```vue
<template>
  <div>
    <!-- You can still use standard Bootstrap data attributes -->
    <VibeButton variant="primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
      Launch Modal
    </VibeButton>

    <VibeModal id="exampleModal" title="Modal Title">
      <p>Modal body text goes here.</p>
    </VibeModal>
  </div>
</template>
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
  <VibeModal title="Custom Footer">
    <p>Modal with custom footer buttons.</p>

    <template #footer>
      <VibeButton variant="secondary" @click="showModal = false">Close</VibeButton>
      <VibeButton variant="primary">Save changes</VibeButton>
    </template>
  </VibeModal>
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Modal functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Teleportation:** By default, this component teleports its DOM elements to the `<body>` to avoid stacking context issues. You can customize this with the `teleport` prop.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

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
