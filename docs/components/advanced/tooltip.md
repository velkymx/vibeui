# VibeTooltip

Tooltips for displaying contextual information. Bootstrap's tooltip JS is initialized automatically when the component mounts.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `String` | `undefined` | Tooltip text content (preferred) |
| `content` | `String` | `undefined` | **Deprecated.** Use `text` instead |
| `placement` | `TooltipPlacement` | `'top'` | Tooltip position: `'top'`, `'bottom'`, `'start'`, `'end'` |
| `trigger` | `String` | `'hover focus'` | Trigger events (space-separated): `'hover'`, `'focus'`, `'click'` |

Content is always rendered as plain text — HTML is not supported (this is intentional, to avoid XSS).

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `{ message, componentName, originalError }` | Emitted if Bootstrap JS is unavailable at mount |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Element that triggers the tooltip |

## Exposed

> **Escape hatch:** `_unsafe_bsInstance` (the underlying Bootstrap `Tooltip` instance) is exposed via a template ref. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on it directly WILL break the component.

## Usage

### Basic Tooltip

```vue
<template>
  <VibeTooltip text="Tooltip text">
    <VibeButton variant="secondary">Hover me</VibeButton>
  </VibeTooltip>
</template>
```

### Placement Options

```vue
<template>
  <div>
    <VibeTooltip text="Tooltip on top" placement="top">
      <VibeButton variant="secondary">Top</VibeButton>
    </VibeTooltip>

    <VibeTooltip text="Tooltip on right" placement="end">
      <VibeButton variant="secondary">End</VibeButton>
    </VibeTooltip>

    <VibeTooltip text="Tooltip on bottom" placement="bottom">
      <VibeButton variant="secondary">Bottom</VibeButton>
    </VibeTooltip>

    <VibeTooltip text="Tooltip on left" placement="start">
      <VibeButton variant="secondary">Start</VibeButton>
    </VibeTooltip>
  </div>
</template>
```

### Custom Trigger

```vue
<template>
  <VibeTooltip text="Click to see tooltip" trigger="click">
    <VibeButton variant="primary">Click me</VibeButton>
  </VibeTooltip>
</template>
```

## Important Notes

**Automatic Initialization:** This component initializes Bootstrap's Tooltip for you when it mounts. Bootstrap's JS is loaded internally — do not import or initialize Bootstrap JS yourself.

**Touch Optimization:** On touch devices, when the trigger is `hover focus` it automatically switches to `click` for reliable behavior on mobile screens. Initialization is SSR-safe.

**Reactive content:** Updating `text` (or the deprecated `content`) updates the live tooltip without a re-init.

## Bootstrap CSS Classes

- `.tooltip`
- `.tooltip-arrow`
- `.tooltip-inner`
