# VibeLink

A flexible link component that supports Bootstrap 5.3's new link and underline utilities.

## Basic Usage

```vue
<VibeLink href="https://example.com">Standard Link</VibeLink>

<VibeLink variant="danger" underline="0">Link without underline</VibeLink>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `undefined` | Link color variant (`primary`, `success`, etc.) |
| `underline` | `Boolean \| '0' \| '1' \| '2' \| '3'` | `true` | Underline behavior. `'0'` removes underline. |
| `underlineVariant` | `Variant` | `undefined` | Color of the underline |
| `underlineOpacity` | `0 \| 10 \| 25 \| 50 \| 75 \| 100` | `undefined` | Opacity of the underline |
| `offset` | `1 \| 2 \| 3` | `undefined` | Underline offset from text |
| `opacity` | `10 \| 25 \| 50 \| 75 \| 100` | `undefined` | Link text opacity |
| `focusRing` | `Boolean` | `false` | Enable the focus-ring helper |
| `href` | `String` | `undefined` | URL for standard links |
| `to` | `String \| Object` | `undefined` | Router link destination |
| `tag` | `String` | `'a'` | HTML tag to use (if not a router-link) |

## Bootstrap 5.3 Utilities
This component maps directly to the following Bootstrap classes:
- `.link-{variant}`
- `.link-underline-0`
- `.link-underline-{variant}`
- `.link-underline-opacity-{value}`
- `.link-offset-{value}`
- `.link-opacity-{value}`
- `.focus-ring`
