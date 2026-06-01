# VibeFormSpinbutton

Numeric input component with increment and decrement buttons.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <VibeFormSpinbutton
    v-model="count"
    label="Quantity"
    :min="0"
    :max="10"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Number` | `0` | The numeric value (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `disabled` | `Boolean` | `false` | Disable the spinbutton |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `min` | `Number` | `undefined` | Minimum value |
| `max` | `Number` | `undefined` | Maximum value |
| `step` | `Number` | `1` | Increment/decrement step |
| `size` | `'sm' \| 'lg'` | `undefined` | Button and input size |
| `wrap` | `Boolean` | `false` | Wrap around when min/max reached |
| `vertical` | `Boolean` | `false` | Stack buttons vertically |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-control`
- `.input-group`
- `.btn`
- `.is-valid`, `.is-invalid`
