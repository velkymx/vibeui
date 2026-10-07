# Lazy hydration for heavy components

`VibeChartLine` / `VibeChartBar` / `VibeChartPie` (canvas drawing) and `VibeFormWysiwyg` (Quill-backed editor) cost more JS and hydration work than the rest of the library. On server-rendered pages, defer both with Vue's async components plus a lazy-hydration strategy (Vue 3.5, within the `vue@^3.5.0` peer floor).

## Chart below the fold

Load and hydrate only when scrolled into view:

```vue
<script setup lang="ts">
import { defineAsyncComponent, hydrateOnVisible } from 'vue'
import type { ChartData } from '@velkymx/vibeui'

const LazyChartLine = defineAsyncComponent({
  loader: () => import('@velkymx/vibeui').then((m) => m.VibeChartLine),
  hydrate: hydrateOnVisible(),
})

const data: ChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{ label: 'Revenue', data: [3, 7, 5] }],
}
</script>

<template>
  <Suspense>
    <LazyChartLine :data="data" height="240" />
  </Suspense>
</template>
```

## Editor on idle

Hydrate a secondary editor when the browser is idle instead of during first paint:

```vue
<script setup lang="ts">
import { defineAsyncComponent, hydrateOnIdle } from 'vue'

const LazyWysiwyg = defineAsyncComponent({
  loader: () => import('@velkymx/vibeui').then((m) => m.VibeFormWysiwyg),
  hydrate: hydrateOnIdle(2000),
})
</script>

<template>
  <Suspense>
    <LazyWysiwyg v-model="body" />
  </Suspense>
</template>
```

(Provide the Quill loader and sanitizer via the plugin `wysiwyg` option as usual; see the `VibeFormWysiwyg` docs.)

## Picking a strategy

| Strategy | Hydrates when | Good for |
|----------|---------------|----------|
| `hydrateOnVisible()` | The component scrolls into view | Below-the-fold charts |
| `hydrateOnIdle(timeout)` | The browser is idle | Secondary editors, dialogs |
| `hydrateOnInteraction(events)` | The user interacts (default: pointerenter, focus) | Rarely-used controls |
| `hydrateOnMediaQuery(query)` | A media query matches | Viewport-specific widgets |

Props, slots, `v-model`, and events pass through async wrappers unchanged. A loader failure surfaces like any render error: wrap the region in `VibeErrorBoundary` to contain it.

## Trade-offs

- **Coarse chunk.** The loader imports the package root, so the deferred download is the whole library, not just the chart. Per-component sub-path entries (finer splitting) are possible follow-up work; they need a multi-entry build, which the current single-entry UMD pipeline does not support.
- **SSR only.** Hydration strategies apply to server-rendered markup. On a pure client-rendered page the loader still code-splits the download, but there is nothing to hydrate.
- **Eager alternative.** If the component is above the fold, import it statically; lazy hydration only adds latency there.
