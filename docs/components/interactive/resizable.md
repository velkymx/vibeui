# VibeResizable

Wrap a child element with up to 8 directional handles for user-driven resizing. Useful for dashboard panels, image crops, draggable widgets.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `handles` | `Handle[]` | `['se']` | Subset of `'n' \| 's' \| 'e' \| 'w' \| 'ne' \| 'nw' \| 'se' \| 'sw'` |
| `width` | `Number` | `200` | Initial width in px (use `update:width` v-model) |
| `height` | `Number` | `150` | Initial height in px (use `update:height` v-model) |
| `minWidth` | `Number` | `20` | |
| `maxWidth` | `Number` | `Infinity` | |
| `minHeight` | `Number` | `20` | |
| `maxHeight` | `Number` | `Infinity` | |
| `aspectRatio` | `Number` | `undefined` | Lock width/height ratio (e.g. `16/9`) |
| `grid` | `Number` | `1` | Snap step in px |
| `disabled` | `Boolean` | `false` | Hide handles, ignore drags |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:width` | `Number` | New width (use with `v-model:width`) |
| `update:height` | `Number` | New height |
| `resizestart` | `{ width, height }` | Drag began |
| `resize` | `{ width, height, handle }` | Continuous during drag |
| `resizeend` | `{ width, height }` | Drag committed |

## Examples

### Resizable card

```vue
<script setup>
import { ref } from 'vue'
const w = ref(320)
const h = ref(200)
</script>

<template>
  <VibeResizable
    v-model:width="w"
    v-model:height="h"
    :handles="['se', 's', 'e']"
    :grid="10"
    :min-width="160"
  >
    <div class="card h-100">
      <div class="card-body">
        Content reflows: {{ w }}×{{ h }}
      </div>
    </div>
  </VibeResizable>
</template>
```

## Layout caveat

Handles are positioned just outside the box (negative top/right/bottom/left) so they sit *on* the edge for easier grabbing. If the resizable lives inside a parent with `overflow: hidden`, or sits at the viewport edge, the handles may clip. Either lift `overflow` from the parent or wrap the resizable in extra padding.

### Aspect-locked image preview

```vue
<VibeResizable
  v-model:width="w"
  v-model:height="h"
  :aspect-ratio="16/9"
  :handles="['nw', 'ne', 'sw', 'se']"
>
  <img :src="src" class="w-100 h-100" />
</VibeResizable>
```
