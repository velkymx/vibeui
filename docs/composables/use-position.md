# usePosition

JS positioning helper for anchoring one element relative to another. Wraps `@floating-ui/dom` with a natural-language anchor-point API similar to jQuery UI's `.position()`.

Use this when CSS position utilities (`docs/utilities/position.md`) aren't enough — typically dynamic menus, callouts, picker overlays, drag ghosts.

## Quick start

```vue
<script setup>
import { ref } from 'vue'
import { usePosition } from '@velkymx/vibeui'

const anchor = ref(null)
const target = ref(null)

const { x, y, placement, update, stop } = usePosition(target, anchor, {
  my: 'top center',
  at: 'bottom center',
  offset: [0, 8],
  collision: 'flip+shift'
})
</script>

<template>
  <button ref="anchor">Anchor</button>
  <div ref="target">I float below the button.</div>
</template>
```

The composable applies `position`, `left`, and `top` styles directly to the target element.

## Anchor points

Both `my` and `at` accept any of the 9 natural-language points:

```
top start    | top center    | top end
center start | center center | center end
bottom start | bottom center | bottom end
```

`my` is the point on the target that is being placed; `at` is the point on the anchor that the target is aligned to.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `my` | anchor point | `'top center'` | Point on target |
| `at` | anchor point | `'bottom center'` | Point on anchor |
| `offset` | `[skid, distance]` | `[0, 0]` | Tweak placement |
| `collision` | `'flip' \| 'shift' \| 'flip+shift' \| 'none'` | `'flip+shift'` | Viewport handling |
| `autoUpdate` | `boolean` | `true` | Reposition on scroll/resize/mutation |
| `strategy` | `'absolute' \| 'fixed'` | `'absolute'` | CSS positioning strategy |

## Returns

| Key | Type | Description |
|---|---|---|
| `x` | `Ref<number>` | Latest left coordinate |
| `y` | `Ref<number>` | Latest top coordinate |
| `placement` | `Ref<Placement>` | Resolved placement (post-flip) |
| `update()` | `() => Promise<void>` | Recompute manually |
| `stop()` | `() => void` | Tear down `autoUpdate` listeners |

## Internal use

Future v0.9 work will route `VibeDropdown`, `VibeTooltip`, `VibePopover`, `VibeDatePicker`, and `VibeAutocomplete` through `usePosition` for consistent collision handling. They currently use Bootstrap's bundled Popper or component-local positioning.
