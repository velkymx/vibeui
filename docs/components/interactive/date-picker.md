# VibeDatePicker

Calendar-popover datepicker with single + range mode. Distinct from `VibeFormDatepicker`, which is a thin wrapper around `<input type="date">`.

Values are ISO `YYYY-MM-DD` strings.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| null \| [String\|null, String\|null]` | `null` | ISO date(s) (v-model) |
| `range` | `Boolean` | `false` | Range selection mode |
| `min` | `String` | `undefined` | ISO lower bound |
| `max` | `String` | `undefined` | ISO upper bound |
| `disabledDates` | `String[]` | `[]` | Specific ISO dates to disable |
| `format` | `(iso) => string` | `undefined` | Display formatter for input value |
| `placeholder` | `String` | `'Select date'` | |
| `weekStart` | `Number` | `0` | 0 = Sunday, 1 = Monday |
| `id` | `String` | auto | |
| `label` | `String` | `undefined` | |
| `disabled` | `Boolean` | `false` | |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| [String\|null, String\|null]` | Selection committed |
| `open` | — | Popover opened |
| `close` | — | Popover closed |

### Exposed methods

- `open()` — programmatically open the popover.
- `close()` — programmatically close.

## Single mode

```vue
<script setup>
import { ref } from 'vue'
const date = ref(null)
</script>

<template>
  <VibeDatePicker v-model="date" label="Due date" />
</template>
```

## Range mode

```vue
<VibeDatePicker
  v-model="range"
  range
  :min="'2026-01-01'"
  :max="'2026-12-31'"
  :format="iso => iso.split('-').reverse().join('/')"
/>
```

The first click sets `[start, null]`. The second click adds the end date and closes the popover; if the second pick is earlier than the first, the range is auto-swapped to stay ordered.

## Disabling dates

```vue
<VibeDatePicker
  v-model="date"
  :disabled-dates="['2026-04-29', '2026-04-30']"
/>
```
