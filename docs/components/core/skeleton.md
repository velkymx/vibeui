# VibeSkeleton

Loading placeholder with shimmer animation. Drop-in replacement for ad-hoc empty states while data loads.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'rect' \| 'circle' \| 'card'` | `'text'` | Shape preset |
| `width` | `String \| Number` | `undefined` | CSS dimension. Number = pixels. |
| `height` | `String \| Number` | `undefined` | CSS dimension. Number = pixels. |
| `lines` | `Number` | `1` | Lines rendered when `variant="text"` |
| `animated` | `Boolean` | `true` | Shimmer animation. Respects `prefers-reduced-motion`. |

## Variants

- **`text`**: stack of `lines` placeholder rows. Last line is shorter (60%).
- **`rect`**: rectangular block.
- **`circle`**: circular block. Setting `width` auto-applies same `height` for 1:1.
- **`card`**: rectangular preview area + 2 text lines (image-card pattern).

## Accessibility

Each skeleton element exposes `role="status"` and `aria-busy="true"` so assistive tech announces a loading state.

## Examples

```vue
<!-- 3 placeholder lines while a paragraph loads -->
<VibeSkeleton :lines="3" />

<!-- 64px avatar placeholder -->
<VibeSkeleton variant="circle" :width="64" />

<!-- 16:9 image area then text -->
<VibeSkeleton variant="card" />

<!-- Disable shimmer for low-power UI -->
<VibeSkeleton variant="rect" :width="200" :height="100" :animated="false" />
```
