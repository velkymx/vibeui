# VibeLink

A flexible link component that supports Bootstrap 5.3's link color and underline utilities, plus Vue Router integration.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `Tag \| 'a'` | `'a'` | HTML tag to render (ignored when `to` is set — renders a router-link) |
| `href` | `String` | `undefined` | URL for standard links. Sanitized — see Important Notes. |
| `to` | `String \| Object` | `undefined` | Router link destination (renders `router-link`) |
| `variant` | `Variant` | `undefined` | Link color variant (`primary`, `success`, etc.) |
| `underline` | `Boolean \| '0'` | `true` | Underline behavior. `false` or `'0'` removes the underline. |
| `underlineVariant` | `Variant` | `undefined` | Color of the underline |
| `underlineOpacity` | `0 \| 10 \| 25 \| 50 \| 75 \| 100` | `undefined` | Opacity of the underline |
| `offset` | `1 \| 2 \| 3` | `undefined` | Underline offset from text |
| `opacity` | `10 \| 25 \| 50 \| 75 \| 100` | `undefined` | Link text opacity |
| `focusRing` | `Boolean` | `false` | Enable the Bootstrap 5.3 focus-ring helper |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Link content |

## Usage

### Basic Link

```vue
<template>
  <VibeLink href="https://example.com">Standard Link</VibeLink>
</template>
```

### Colored Link Without Underline

```vue
<template>
  <VibeLink variant="danger" underline="0">Link without underline</VibeLink>
</template>
```

### Underline Styling

```vue
<template>
  <VibeLink
    href="https://example.com"
    underline-variant="success"
    :underline-opacity="50"
    :offset="2"
  >
    Styled underline
  </VibeLink>
</template>
```

### Router Link

```vue
<template>
  <VibeLink :to="{ name: 'home' }">Home</VibeLink>
</template>
```

## Important Notes

**`href` sanitization:** The `href` prop is sanitized. Only `https://`/`http://` URLs, absolute paths (`/path`), relative paths (`./`, `../`), and anchors (`#section`) are allowed. Dangerous values such as `javascript:`, `data:`, `vbscript:`, and protocol-relative `//host` URLs are stripped — the `href` attribute is omitted entirely. Use `to` for in-app navigation via Vue Router.

**`href` and `to` are mutually exclusive:** unlike the other components, `VibeLink` gives `to` precedence when both are set (matching its `tag` behaviour). Only the winning one is bound, so a router link never carries a stray `href` and a plain anchor never carries a stray `to`.

**`to` requires Vue Router:** it renders a `router-link`, which resolves the `href` and handles navigation. Without `app.use(router)` the tag does not resolve.

## Bootstrap CSS Classes

- `.link-{variant}`
- `.link-underline-opacity-0` (when `underline` is `false`/`'0'`)
- `.link-underline-{variant}`
- `.link-underline-opacity-{value}`
- `.link-offset-{value}`
- `.link-opacity-{value}`
- `.focus-ring`
