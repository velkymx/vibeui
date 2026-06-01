# VibeFormCheckbox

Checkbox component for single boolean values or multiple selections.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const agreed = ref(false)
</script>

<template>
  <VibeFormCheckbox
    v-model="agreed"
    label="I agree to the terms"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `any` | `false` | The checked state (v-model) |
| `value` | `any` | `true` | Value when checked |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `disabled` | `Boolean` | `false` | Disable the checkbox |
| `required` | `Boolean` | `false` | Mark as required |
| `inline` | `Boolean` | `false` | Display inline |
| `indeterminate` | `Boolean` | `false` | Set indeterminate state |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |
| `reverse` | `Boolean` | `false` | Reverse label and input |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-check`
- `.form-check-input`
- `.form-check-label`
- `.is-valid`, `.is-invalid`
