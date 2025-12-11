# VibeModal

Modal dialogs for lightboxes, user notifications, or custom content. Requires Bootstrap JS.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier for the modal |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `title` | `String` | `''` | Modal title |
| `size` | `Size\|'xl'` | `undefined` | Modal size: `'sm'`, `'lg'`, `'xl'` |
| `centered` | `Boolean` | `false` | Vertically center modal |
| `scrollable` | `Boolean` | `false` | Scrollable modal body |
| `fullscreen` | `Boolean\|String` | `false` | Fullscreen: `true` or breakpoint |
| `staticBackdrop` | `Boolean` | `false` | Don't close on backdrop click |
| `hideHeader` | `Boolean` | `false` | Hide header section |
| `hideFooter` | `Boolean` | `false` | Hide footer section |

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

### Basic Modal

```vue
<template>
  <div>
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
    <VibeModal id="smallModal" title="Small Modal" size="sm">
      Small modal content
    </VibeModal>

    <VibeModal id="largeModal" title="Large Modal" size="lg">
      Large modal content
    </VibeModal>

    <VibeModal id="xlModal" title="Extra Large Modal" size="xl">
      Extra large modal content
    </VibeModal>
  </div>
</template>
```

### Centered Modal

```vue
<template>
  <VibeModal id="centeredModal" title="Centered Modal" centered>
    This modal is vertically centered.
  </VibeModal>
</template>
```

### Custom Footer

```vue
<template>
  <VibeModal id="customModal" title="Custom Footer">
    <p>Modal with custom footer buttons.</p>

    <template #footer>
      <VibeButton variant="secondary" data-bs-dismiss="modal">Close</VibeButton>
      <VibeButton variant="primary">Save changes</VibeButton>
    </template>
  </VibeModal>
</template>
```

### Fullscreen Modal

```vue
<template>
  <VibeModal id="fullscreenModal" title="Fullscreen Modal" fullscreen>
    This is a fullscreen modal.
  </VibeModal>
</template>
```

### Static Backdrop

```vue
<template>
  <VibeModal id="staticModal" title="Static Modal" static-backdrop>
    Click outside won't close this modal.
  </VibeModal>
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

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
