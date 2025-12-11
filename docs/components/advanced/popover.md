# VibePopover

Popovers for displaying rich content overlays. Requires Bootstrap JS and initialization.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | `undefined` | Popover title |
| `content` | `String` | Required | Popover content text |
| `placement` | `Placement` | `'top'` | Popover position: `'top'`, `'bottom'`, `'start'`, `'end'` |
| `trigger` | `String` | `'click'` | Trigger events (space-separated) |
| `html` | `Boolean` | `false` | Allow HTML content |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Element that triggers the popover |

## Usage

### Basic Popover

```vue
<template>
  <VibePopover
    title="Popover Title"
    content="This is the popover content"
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
      content="Popover on top"
      placement="top"
    >
      <VibeButton variant="secondary">Top</VibeButton>
    </VibePopover>

    <VibePopover
      title="End Popover"
      content="Popover on right"
      placement="end"
    >
      <VibeButton variant="secondary">End</VibeButton>
    </VibePopover>

    <VibePopover
      title="Bottom Popover"
      content="Popover on bottom"
      placement="bottom"
    >
      <VibeButton variant="secondary">Bottom</VibeButton>
    </VibePopover>

    <VibePopover
      title="Start Popover"
      content="Popover on left"
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
    content="This appears on hover"
    trigger="hover focus"
  >
    <VibeButton variant="info">Hover me</VibeButton>
  </VibePopover>
</template>
```

### HTML Content

```vue
<template>
  <VibePopover
    title="<strong>HTML Title</strong>"
    content="<em>HTML</em> content with <a href='#'>link</a>"
    html
  >
    <VibeButton variant="warning">HTML Popover</VibeButton>
  </VibePopover>
</template>
```

### No Title

```vue
<template>
  <VibePopover content="Just content, no title">
    <VibeButton variant="success">No Title</VibeButton>
  </VibePopover>
</template>
```

## Important Notes

**Bootstrap JS Required:** This component requires Bootstrap's JavaScript to be included in your project and popovers must be initialized:

```javascript
// Initialize all popovers
import { Popover } from 'bootstrap'

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new Popover(popoverTriggerEl))
```

Or in Vue:

```vue
<script setup>
import { onMounted } from 'vue'
import { Popover } from 'bootstrap'

onMounted(() => {
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
  const popoverList = [...popoverTriggerList].map(el => new Popover(el))
})
</script>
```

## Bootstrap CSS Classes

- Uses Bootstrap's `data-bs-toggle="popover"` attributes
- `.popover`
- `.popover-arrow`
- `.popover-header`
- `.popover-body`
