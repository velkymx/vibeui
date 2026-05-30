# useColorMode

Manages Bootstrap 5.3 color modes (`light`, `dark`, `auto`) for the entire app. Sets the `data-bs-theme` attribute on `<html>`, persists the user's preference to `localStorage`, and provides a reactive ref that components can watch.

**Singleton** — every call to `useColorMode()` returns the same shared state. There is one active color mode per app.

## Import

```ts
import { useColorMode } from '@velkymx/vibeui'
```

## Return Values

| Name | Type | Description |
|---|---|---|
| `colorMode` | `Ref<ColorMode>` | Reactive current mode. Bind to template or watch for changes. |
| `setColorMode(mode)` | `(mode: ColorMode) => void` | Set a specific mode. Persists to `localStorage` and updates `<html data-bs-theme>`. |
| `toggleColorMode()` | `() => void` | Cycle through `light → dark → auto → light`. |
| `initColorMode()` | `() => void` | Restore the saved preference from `localStorage` and attach the system-theme listener. **Call once at app startup, before mount.** Subsequent calls are no-ops while already initialized. |
| `clearColorMode()` | `() => void` | Reset to `auto`, remove the `localStorage` key, and **keep the system listener attached** so auto mode stays reactive to OS theme changes. |
| `onColorModeChange(cb)` | `(cb: (mode: ColorMode) => void) => () => void` | Register a callback that fires whenever the mode changes. Returns an **unsubscribe function** — call it to remove the callback and avoid leaks. Useful for hybrid app status bars. |

## Type

```ts
type ColorMode = 'light' | 'dark' | 'auto'
```

| Value | Behavior |
|---|---|
| `'light'` | Forces light theme regardless of OS setting |
| `'dark'` | Forces dark theme regardless of OS setting |
| `'auto'` | Follows the OS `prefers-color-scheme` media query |

## Setup

Call `initColorMode()` once in `main.ts` before mounting the app. This restores the user's last saved preference.

```ts
// main.ts
import { createApp } from 'vue'
import VibeUI, { useColorMode } from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.vue'

const { initColorMode } = useColorMode()
initColorMode()

createApp(App).use(VibeUI).mount('#app')
```

## Usage

### Toggle button

The most common use case — a button that cycles through all three modes.

```vue
<script setup lang="ts">
import { useColorMode } from '@velkymx/vibeui'

const { colorMode, toggleColorMode } = useColorMode()
</script>

<template>
  <VibeButton variant="secondary" @click="toggleColorMode">
    Theme: {{ colorMode }}
  </VibeButton>
</template>
```

### Explicit mode switcher

A select or set of buttons that lets the user pick a specific mode.

```vue
<script setup lang="ts">
import { useColorMode } from '@velkymx/vibeui'
import type { ColorMode } from '@velkymx/vibeui'

const { colorMode, setColorMode } = useColorMode()

const options: { label: string; value: ColorMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'auto' },
]
</script>

<template>
  <div class="btn-group">
    <VibeButton
      v-for="option in options"
      :key="option.value"
      :variant="colorMode === option.value ? 'primary' : 'secondary'"
      :outline="colorMode !== option.value"
      @click="setColorMode(option.value)"
    >
      {{ option.label }}
    </VibeButton>
  </div>
</template>
```

### Watching for changes

React to color mode changes anywhere in the app — for example, to swap a chart theme.

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useColorMode } from '@velkymx/vibeui'

const { colorMode } = useColorMode()

watch(colorMode, (mode) => {
  console.log('Color mode changed to:', mode)
  // e.g. update a third-party chart library's theme
})
</script>
```

### Subscribing outside a component

`onColorModeChange` is for non-reactive sinks (a hybrid app status bar, an analytics call). It returns an unsubscribe function — call it on teardown.

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useColorMode } from '@velkymx/vibeui'

const { onColorModeChange } = useColorMode()

const off = onColorModeChange((mode) => {
  // e.g. sync the native status bar color in a Capacitor app
})

onUnmounted(off)
</script>
```

### Resetting to system default

`clearColorMode` removes the saved preference and returns to `auto`. The OS theme listener stays attached, so the app keeps tracking system theme changes afterward.

```vue
<script setup lang="ts">
import { useColorMode } from '@velkymx/vibeui'

const { clearColorMode } = useColorMode()
</script>

<template>
  <VibeButton variant="secondary" outline @click="clearColorMode">
    Use system default
  </VibeButton>
</template>
```

### Scoping color mode to a single component

Bootstrap's `data-bs-theme` attribute works on any element, not just `<html>`. For cases where one section of the page should always be dark regardless of the app-level setting, apply it directly in the template instead of using the composable.

```vue
<template>
  <div data-bs-theme="dark">
    <!-- This section is always dark -->
    <VibeCard>Always dark card</VibeCard>
  </div>
</template>
```
## Behavior Notes

- **Persistence** — the selected mode is stored in `localStorage` under the key `vibe-color-mode`. It survives page reloads.
- **System Theme Reactivity** — when the mode is set to `'auto'`, VibeUI automatically listens for OS-level theme changes (via `matchMedia`) and updates the DOM immediately without a page reload.
- **SSR-safe** — all `document` and `localStorage` access is guarded. The composable is safe to import in server-rendered environments; applying the theme simply does nothing when `document` is undefined. On the client, `initColorMode()` is the real init path that reads storage and attaches the listener.
- **Invalid values** — `setColorMode` silently ignores any value that is not `'light'`, `'dark'`, or `'auto'`. No error is thrown.
- **`initColorMode` is idempotent** — while initialized, repeat calls are no-ops and do not overwrite changes the user made after init. Calling `clearColorMode()` un-initializes the singleton, so a later `initColorMode()` can re-read storage.
