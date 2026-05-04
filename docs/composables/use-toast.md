# useToast

Global toast service. Call `useToast()` from anywhere and dispatch toast messages without managing a `<VibeToast>` component instance per call site. A single `<VibeToastHost />` mounted at the root renders the queue.

## Setup

Mount `<VibeToastHost />` once in your app shell:

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <VibeToastHost />
</template>
```

## API

```ts
import { useToast } from '@velkymx/vibeui'

const toast = useToast()
```

| Method | Variant | Notes |
|--------|---------|-------|
| `show(body, options?)` | `options.variant` | Generic |
| `success(body, options?)` | `success` | |
| `error(body, options?)` | `danger` | |
| `warn(body, options?)` | `warning` | |
| `info(body, options?)` | `info` | |
| `dismiss(id)` | — | Remove a specific toast. Returns `true` if found. |
| `clear()` | — | Remove all toasts |
| `toasts` | — | Read-only reactive list |

### Options

```ts
interface ToastShowOptions {
  id?: string             // override auto-generated id
  title?: string
  variant?: Variant
  placement?: ToastPlacement   // 'top-end' (default) etc.
  autohide?: boolean      // default true
  delay?: number          // ms, default 5000
}
```

Each call returns the resolved `ToastSpec`, including the assigned `id` if you didn't provide one. Use it later to `dismiss(id)`.

## Examples

```ts
const toast = useToast()

toast.success('Saved successfully')
toast.error('Could not save: network error', { delay: 8000 })

const sticky = toast.warn('Long-running export…', { autohide: false })
// later
toast.dismiss(sticky.id)
```

### Programmatic clear on route change

```ts
import { useToast } from '@velkymx/vibeui'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()
router.afterEach(() => toast.clear())
```

## Coexistence with `<VibeToast>`

The component-form `<VibeToast v-model="show">` still works — useful when a toast lives logically inside a single view. `useToast` is for app-wide notifications dispatched from composables, async handlers, or non-component code.

> Mixing both in the same app produces two `.toast-container`s at the same placement (one from `<VibeToastHost>`, one per standalone `<VibeToast>`), which Bootstrap stacks side-by-side rather than vertically. If that's visually unwanted, pick one form per app.

## SSR

The toast queue is a module-level singleton. In SSR runtimes the same store is reused across requests; call `resetToastStoreForSSR()` from your server entry's per-request reset hook to avoid leaking one request's pending toasts into another's render output.

```ts
import { resetToastStoreForSSR } from '@velkymx/vibeui'

// In your server's request handler:
resetToastStoreForSSR()
const app = createSSRApp(/* ... */)
```
