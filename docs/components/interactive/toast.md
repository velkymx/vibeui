# VibeToast

Push notifications for lightweight alerts.

The recommended way to show toasts is the **`useToast()` service** with a single `<VibeToastHost />` mounted once near your app root. The `<VibeToast>` component is the lower-level primitive for when you need a toast bound directly to local component state.

## Toast Service (recommended)

Mount `<VibeToastHost />` once (typically in `App.vue`), then call `useToast()` anywhere to enqueue toasts. The host manages containers, positioning, and dismissal for you.

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <VibeToastHost />
</template>
```

```vue
<!-- AnyComponent.vue -->
<template>
  <VibeButton @click="save">Save</VibeButton>
</template>

<script setup>
import { useToast } from '@velkymx/vibeui'

const toast = useToast()

function save() {
  // ...persist...
  toast.success('Saved successfully')
  toast.error('Something went wrong', { title: 'Error' })
  toast.info('Heads up', { delay: 8000 })
}
</script>
```

### `useToast()` API

| Method | Signature | Description |
|--------|-----------|-------------|
| `show` | `(body, options?) => ToastSpec` | Enqueue a toast with explicit options |
| `success` | `(body, options?) => ToastSpec` | Shorthand for `variant: 'success'` |
| `error` | `(body, options?) => ToastSpec` | Shorthand for `variant: 'danger'` |
| `warn` | `(body, options?) => ToastSpec` | Shorthand for `variant: 'warning'` |
| `info` | `(body, options?) => ToastSpec` | Shorthand for `variant: 'info'` |
| `dismiss` | `(id) => boolean` | Remove a toast by id; returns `true` if found |
| `clear` | `() => void` | Remove all queued toasts |
| `toasts` | `readonly ToastSpec[]` | Reactive readonly snapshot of the queue |

`ToastShowOptions`: `{ id?, title?, variant?, placement?, autohide?, delay? }`. Passing an existing `id` updates that toast in place instead of adding a new one. The variant shorthands (`success`, `error`, `warn`, `info`) accept the same options minus `variant`.

### `<VibeToastHost />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultPlacement` | `ToastPlacement` | `'top-end'` | Placement used for toasts that don't specify one |

Toasts are grouped into one fixed container per placement, so toasts with different `placement` values render in the correct corner automatically.

## VibeToast Component (primitive)

Use the component directly when you want a toast tied to a local `v-model`.

### Props

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
| `noContainer` | `Boolean` | `false` | Render only the `.toast` element (no Teleport/container). Used internally by `VibeToastHost` to group toasts |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when visibility changes |
| `show` | - | Emitted when toast starts showing |
| `shown` | - | Emitted when toast is fully shown |
| `hide` | - | Emitted when toast starts hiding |
| `hidden` | - | Emitted when toast is fully hidden |
| `component-error` | `ComponentError` | Emitted if Bootstrap JS fails to load |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Toast body content |
| `header` | Custom header content |

### Usage

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

#### Placed Toasts

```vue
<template>
  <div>
    <VibeToast
      v-model="showSuccess"
      title="Success"
      variant="success"
      placement="bottom-end"
    >
      Operation completed successfully!
    </VibeToast>

    <VibeToast v-model="showInfo" title="Center" variant="info" placement="middle-center">
      I am in the middle of the screen
    </VibeToast>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showSuccess = ref(false)
const showInfo = ref(false)
</script>
```

#### Custom Delay

```vue
<template>
  <VibeToast v-model="show" title="Quick Toast" :delay="2000">
    This will auto-hide after 2 seconds
  </VibeToast>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>
```

## Important Notes

**Prefer the service:** Use `useToast()` + `<VibeToastHost />` for most cases. It dedupes/updates by `id`, queues multiple toasts, and handles container placement. Reach for `<VibeToast>` only when you need a toast bound to a single local boolean.

**Automatic Container:** Unlike raw Bootstrap, `<VibeToast>` automatically manages its own `toast-container` and positioning based on the `placement` prop (unless `noContainer` is set).

**Teleportation:** By default, the component teleports to the `<body>` so it is always visible on top of other elements.

**SSR:** The toast queue is a module singleton. In SSR runtimes call `resetToastStoreForSSR()` in your per-request reset hook to avoid leaking one request's pending toasts into another's render.

**Escape Hatch:** `<VibeToast>` exposes `_unsafe_bsInstance` (raw Bootstrap Toast instance) via template ref. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on it directly **will** break the component. Prefer `v-model` and the exposed `show()` / `hide()` methods.

## Bootstrap CSS Classes

- `.toast`
- `.toast-header`
- `.toast-body`
- `.text-bg-{variant}`
- `.toast-container`
