# VibePopover

Popovers for displaying contextual content overlays. Bootstrap's popover JS is initialized automatically when the component mounts.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `String` | `undefined` | Popover body content (preferred) |
| `content` | `String` | `undefined` | Alias for `text` |
| `title` | `String` | `undefined` | Popover title |
| `placement` | `TooltipPlacement` | `'top'` | Popover position: `'top'`, `'bottom'`, `'start'`, `'end'` |
| `trigger` | `String` | `'click'` | Trigger events (space-separated): `'click'`, `'hover'`, `'focus'` |

Provide either `text` or `content` (they are interchangeable). Content is always rendered as plain text — HTML is not supported (this is intentional, to avoid XSS).

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `{ message, componentName, originalError }` | Emitted if Bootstrap JS is unavailable at mount |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Element that triggers the popover |

## Exposed

> **Escape hatch:** `_unsafe_bsInstance` (the underlying Bootstrap `Popover` instance) is exposed via a template ref. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on it directly WILL break the component.

## Usage

### Basic Popover

```vue
<template>
  <VibePopover
    title="Popover Title"
    text="This is the popover content"
  >
    <VibeButton variant="danger">Click me</VibeButton>
  </VibePopover>
</template>
```

### Placement Options

```vue
<template>
  <div>
    <VibePopover
      title="Top Popover"
      text="Popover on top"
      placement="top"
    >
      <VibeButton variant="secondary">Top</VibeButton>
    </VibePopover>

    <VibePopover
      title="End Popover"
      text="Popover on right"
      placement="end"
    >
      <VibeButton variant="secondary">End</VibeButton>
    </VibePopover>

    <VibePopover
      title="Bottom Popover"
      text="Popover on bottom"
      placement="bottom"
    >
      <VibeButton variant="secondary">Bottom</VibeButton>
    </VibePopover>

    <VibePopover
      title="Start Popover"
      text="Popover on left"
      placement="start"
    >
      <VibeButton variant="secondary">Start</VibeButton>
    </VibePopover>
  </div>
</template>
```

### Hover Trigger

```vue
<template>
  <VibePopover
    title="Hover Popover"
    text="This appears on hover"
    trigger="hover focus"
  >
    <VibeButton variant="info">Hover me</VibeButton>
  </VibePopover>
</template>
```

### No Title

```vue
<template>
  <VibePopover text="Just content, no title">
    <VibeButton variant="success">No Title</VibeButton>
  </VibePopover>
</template>
```

## Important Notes

**Automatic Initialization:** This component initializes Bootstrap's Popover for you when it mounts. Bootstrap's JS is loaded internally — do not import or initialize Bootstrap JS yourself.

**Touch Optimization:** On touch devices, if the trigger is `hover focus`, it automatically switches to `click` for reliable behavior on mobile screens. Initialization is SSR-safe.

**Reactive content:** Updating `text`/`content`/`title` updates the live popover without a re-init.

## Bootstrap CSS Classes

- `.popover`
- `.popover-arrow`
- `.popover-header`
- `.popover-body`
