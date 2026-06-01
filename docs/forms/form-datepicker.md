# VibeFormDatepicker

Date, time, and datetime input using the native browser pickers, with built-in validation and accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The value (v-model) as an ISO-style string matching the chosen `type` (e.g. `2026-05-28`). |
| `type` | `'date' \| 'time' \| 'datetime-local' \| 'month' \| 'week'` | `'date'` | Native picker type. |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Standalone label text. |
| `disabled` | `boolean` | `false` | Disable the input. |
| `readonly` | `boolean` | `false` | Make the input read-only. |
| `required` | `boolean` | `false` | Mark as required. |
| `min` | `string` | `undefined` | Minimum allowed value. |
| `max` | `string` | `undefined` | Maximum allowed value. |
| `size` | `'sm' \| 'lg'` | `undefined` | Control size. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the input. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted on input. |
| `input` | `Event` | Native input event. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

None.

## Usage

### Recommended: inside a VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
const startDate = ref('')
</script>

<template>
  <VibeFormGroup label="Start Date">
    <VibeFormDatepicker v-model="startDate" type="date" min="2026-01-01" />
  </VibeFormGroup>
</template>
```

### Standalone

```vue
<script setup lang="ts">
import { ref } from 'vue'
const meetingTime = ref('')
</script>

<template>
  <VibeFormDatepicker v-model="meetingTime" label="Meeting Time" type="datetime-local" />
</template>
```

## Important Notes

- **String model only:** `modelValue` must be a string. When using a validation composable, bind to `.value` (e.g. `v-model="field.value"`), not the field object — a dev-mode warning is logged otherwise.
- **Native pickers:** rendering and locale formatting come from the browser's native input, so the on-screen appearance varies by platform.
- **Group linking:** wrapped in a `VibeFormGroup`, the input consumes the group id so the label and feedback link automatically.

## Bootstrap CSS Classes

- `.form-control`
- `.form-control-{sm|lg}`
- `.is-valid`, `.is-invalid`
