# VibeIcon

Renders a [Bootstrap Icons](https://icons.getbootstrap.com/) glyph as an `<i class="bi bi-…">`, with sizing, color, flip/rotate and accessibility helpers.

> **Peer dependency:** VibeIcon needs the `bootstrap-icons` package and its stylesheet. Install it (`npm install bootstrap-icons`) and import the CSS once in your app: `import 'bootstrap-icons/font/bootstrap-icons.css'`. It is an optional peer dependency — the rest of VibeUI works without it.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | — (required) | Bootstrap Icons name **without** the `bi-` prefix, e.g. `'house'`, `'heart-fill'`, `'star'`. Rendered as `bi bi-{icon}`. |
| `size` | `'sm' \| 'lg' \| '1x' \| '2x' \| '3x' \| '4x' \| '5x'` | `undefined` | Preset font-size. `sm` = 0.875rem, `lg` = 1.25rem, `1x`–`5x` = 1rem–5rem. |
| `fontSize` | `string` | `undefined` | Explicit CSS font-size (e.g. `'1.5rem'`, `'24px'`). Overrides `size`. Sanitized. |
| `color` | `string` | `undefined` | CSS color (e.g. `'red'`, `'#0d6efd'`, `'var(--bs-primary)'`). Sanitized. |
| `customClass` | `string` | `undefined` | Extra class(es) appended to the `<i>`. |
| `flipH` | `boolean` | `false` | Mirror horizontally (`scaleX(-1)`). |
| `flipV` | `boolean` | `false` | Mirror vertically (`scaleY(-1)`). |
| `rotate` | `90 \| 180 \| 270` | `undefined` | Rotate by the given degrees. |
| `ariaHidden` | `boolean` | `true` | Hide from assistive tech (decorative default). Ignored when `ariaLabel` is set. |
| `ariaLabel` | `string` | `undefined` | Accessible name. When set, the icon renders `role="img"` with this label and is **not** `aria-hidden` — use it for meaningful icons. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Emitted on click **only when the icon is non-decorative** — i.e. `ariaLabel` is set or `ariaHidden` is `false`. A purely decorative icon does not emit click. |
| `component-error` | `ComponentError` | Emitted on an internal error. |

## Slots

None — the glyph is chosen by the `icon` prop.

## Usage

### Basic

```vue
<template>
  <VibeIcon icon="house" />
  <VibeIcon icon="heart-fill" color="red" />
</template>
```

### Sizing

```vue
<template>
  <VibeIcon icon="star" size="lg" />
  <VibeIcon icon="star" size="3x" />
  <VibeIcon icon="star" font-size="2.5rem" />
</template>
```

### Flip and Rotate

```vue
<template>
  <VibeIcon icon="arrow-right" :rotate="90" />
  <VibeIcon icon="reply" flip-h />
</template>
```

### Accessibility

```vue
<template>
  <!-- Decorative (default): hidden from screen readers -->
  <VibeButton>
    <VibeIcon icon="download" /> Download
  </VibeButton>

  <!-- Meaningful: exposed with an accessible name -->
  <VibeIcon icon="check-circle-fill" color="green" aria-label="Verified" />
</template>
```

## Important Notes

- **Decorative by default:** with no `ariaLabel`, the icon is `aria-hidden="true"`. Pair icons that convey meaning with `ariaLabel` (or nearby visible text) so screen-reader users aren't left without context.
- **Icon names:** pass the Bootstrap Icons name without `bi-`. Browse the full set at [icons.getbootstrap.com](https://icons.getbootstrap.com/).
- **Cursor & selection:** the glyph uses `cursor: inherit` and `user-select: none`, so it does not show a text cursor or become selectable inside links/buttons.

## Bootstrap CSS Classes

- `.bi`, `.bi-{icon}`
- Any classes passed via `customClass`
