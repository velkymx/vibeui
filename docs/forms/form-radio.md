# VibeFormRadio

Radio button for exclusive selection within a named group.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| boolean` | `''` | Selected value shared across the group (v-model). |
| `value` | `string \| number \| boolean` | — (required) | This radio's value. |
| `name` | `string` | — (required) | Group name; all radios in a group share the same `name`. |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Radio label text. |
| `disabled` | `boolean` | `false` | Disable the radio. |
| `required` | `boolean` | `false` | Mark as required. |
| `inline` | `boolean` | `false` | Render inline (`.form-check-inline`). |
| `reverse` | `boolean` | `false` | Place the label before the radio (`.form-check-reverse`). |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the radio. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| boolean` | Emitted with this radio's `value` when selected. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

None.

## Usage

### Recommended: a group inside VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
const plan = ref('free')
</script>

<template>
  <VibeFormGroup label="Plan">
    <VibeFormRadio v-model="plan" name="plan" value="free" label="Free" />
    <VibeFormRadio v-model="plan" name="plan" value="pro" label="Pro" />
    <VibeFormRadio v-model="plan" name="plan" value="team" label="Team" />
  </VibeFormGroup>
</template>
```

### Inline

```vue
<script setup lang="ts">
import { ref } from 'vue'
const size = ref('m')
</script>

<template>
  <VibeFormRadio v-model="size" name="size" value="s" label="Small" inline />
  <VibeFormRadio v-model="size" name="size" value="m" label="Medium" inline />
  <VibeFormRadio v-model="size" name="size" value="l" label="Large" inline />
</template>
```

## Important Notes

- **Shared `name`:** every radio in the same logical group must share a `name` so the browser enforces exclusivity.
- **Group linking:** the first radio in a `VibeFormGroup` consumes the group id; subsequent radios generate their own ids.

## Bootstrap CSS Classes

- `.form-check`
- `.form-check-input`, `.form-check-label`
- `.form-check-inline`, `.form-check-reverse`
- `.is-valid`, `.is-invalid`
