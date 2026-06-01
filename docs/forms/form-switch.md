# VibeFormSwitch

Toggle switch for boolean values, rendered as an accessible `role="switch"` control.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | The toggle state (v-model). |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Switch label text. |
| `disabled` | `boolean` | `false` | Disable the switch. |
| `required` | `boolean` | `false` | Mark as required. |
| `inline` | `boolean` | `false` | Render inline (`.form-check-inline`). |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the switch. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted on toggle. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

None.

## Usage

### Standalone

```vue
<script setup lang="ts">
import { ref } from 'vue'
const notifications = ref(true)
</script>

<template>
  <VibeFormSwitch v-model="notifications" label="Email notifications" />
</template>
```

### Inside a VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
const darkMode = ref(false)
</script>

<template>
  <VibeFormGroup label="Appearance">
    <VibeFormSwitch v-model="darkMode" label="Dark mode" />
  </VibeFormGroup>
</template>
```

## Important Notes

- **Accessibility:** the underlying input is a checkbox with `role="switch"` and Bootstrap's `.form-switch` styling.
- **Group linking:** wrapped in a `VibeFormGroup`, the switch consumes the group id so the label and feedback link automatically.

## Bootstrap CSS Classes

- `.form-check`, `.form-switch`
- `.form-check-input`, `.form-check-label`
- `.form-check-inline`
- `.is-valid`, `.is-invalid`
