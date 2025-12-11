# VibeTooltip

Tooltips for displaying contextual information. Requires Bootstrap JS and initialization.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `String` | Required | Tooltip text content |
| `placement` | `Placement` | `'top'` | Tooltip position: `'top'`, `'bottom'`, `'start'`, `'end'` |
| `trigger` | `String` | `'hover focus'` | Trigger events (space-separated) |
| `html` | `Boolean` | `false` | Allow HTML content |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Element that triggers the tooltip |

## Usage

### Basic Tooltip

```vue
<template>
  <VibeTooltip content="Tooltip text">
    <VibeButton variant="secondary">Hover me</VibeButton>
  </VibeTooltip>
</template>
```

### Placement Options

```vue
<template>
  <div>
    <VibeTooltip content="Tooltip on top" placement="top">
      <VibeButton variant="secondary">Top</VibeButton>
    </VibeTooltip>

    <VibeTooltip content="Tooltip on right" placement="end">
      <VibeButton variant="secondary">End</VibeButton>
    </VibeTooltip>

    <VibeTooltip content="Tooltip on bottom" placement="bottom">
      <VibeButton variant="secondary">Bottom</VibeButton>
    </VibeTooltip>

    <VibeTooltip content="Tooltip on left" placement="start">
      <VibeButton variant="secondary">Start</VibeButton>
    </VibeTooltip>
  </div>
</template>
```

### Custom Trigger

```vue
<template>
  <VibeTooltip content="Click to see tooltip" trigger="click">
    <VibeButton variant="primary">Click me</VibeButton>
  </VibeTooltip>
</template>
```

### HTML Content

```vue
<template>
  <VibeTooltip content="<em>Tooltip</em> with <strong>HTML</strong>" html>
    <VibeButton variant="info">HTML Tooltip</VibeButton>
  </VibeTooltip>
</template>
```

## Important Notes

**Bootstrap JS Required:** This component requires Bootstrap's JavaScript to be included in your project and tooltips must be initialized:

```javascript
// Initialize all tooltips
import { Tooltip } from 'bootstrap'

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl))
```

Or in Vue:

```vue
<script setup>
import { onMounted } from 'vue'
import { Tooltip } from 'bootstrap'

onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(el => new Tooltip(el))
})
</script>
```

## Bootstrap CSS Classes

- Uses Bootstrap's `data-bs-toggle="tooltip"` attributes
- `.tooltip`
- `.tooltip-arrow`
- `.tooltip-inner`
