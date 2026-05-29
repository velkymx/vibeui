# VibeFormCheckbox

Checkbox for a single boolean value or as part of a grouped multi-select (array model).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean \| string \| number \| (string \| number \| boolean)[]` | `false` | v-model. A boolean (or `value`/`uncheckedValue`) for single checkboxes; an array for grouped checkboxes. |
| `value` | `string \| number \| boolean` | `true` | Value emitted/added to the array when checked. |
| `uncheckedValue` | `string \| number \| boolean` | `false` | Value emitted when unchecked (non-array model only). |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Checkbox label text. |
| `disabled` | `boolean` | `false` | Disable the checkbox. |
| `required` | `boolean` | `false` | Mark as required. |
| `inline` | `boolean` | `false` | Render inline (`.form-check-inline`). |
| `indeterminate` | `boolean` | `false` | Show the indeterminate (mixed) state. |
| `reverse` | `boolean` | `false` | Place the label before the checkbox (`.form-check-reverse`). |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the checkbox. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean \| string \| number \| (string \| number \| boolean)[]` | Emitted on toggle. Array result when the model is an array. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

None.

## Usage

### Single checkbox

```vue
<script setup lang="ts">
import { ref } from 'vue'
const agreed = ref(false)
</script>

<template>
  <VibeFormCheckbox v-model="agreed" label="I accept the terms" />
</template>
```

### Custom checked / unchecked values

```vue
<script setup lang="ts">
import { ref } from 'vue'
const status = ref('off')
</script>

<template>
  <VibeFormCheckbox
    v-model="status"
    value="on"
    unchecked-value="off"
    label="Enable feature"
  />
</template>
```

### Grouped checkboxes (array model)

```vue
<script setup lang="ts">
import { ref } from 'vue'
const selected = ref<string[]>([])
</script>

<template>
  <VibeFormGroup label="Interests">
    <VibeFormCheckbox v-model="selected" value="vue" label="Vue" />
    <VibeFormCheckbox v-model="selected" value="ts" label="TypeScript" />
    <VibeFormCheckbox v-model="selected" value="css" label="CSS" />
  </VibeFormGroup>
</template>
```

## Important Notes

- **Array vs. single model:** if `modelValue` is an array, checking adds `value` and unchecking removes it. Otherwise the model toggles between `value` and `uncheckedValue`.
- **Indeterminate:** purely visual; it does not change the checked value and is reset once the user toggles.
- **Group linking:** in a grouped layout, the first checkbox consumes the `VibeFormGroup` id; subsequent checkboxes generate their own ids.

## Bootstrap CSS Classes

- `.form-check`
- `.form-check-input`, `.form-check-label`
- `.form-check-inline`, `.form-check-reverse`
- `.is-valid`, `.is-invalid`
