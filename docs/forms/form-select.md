# VibeFormSelect

Custom select component with support for single and multiple selection.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const selected = ref('')
const options = [
  { value: '1', text: 'Option 1' },
  { value: '2', text: 'Option 2' }
]
</script>

<template>
  <VibeFormSelect
    v-model="selected"
    label="Choose an option"
    :options="options"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `any` | `''` | Selected value (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `options` | `FormSelectOption[]` | `[]` | Array of options |
| `multiple` | `Boolean` | `false` | Enable multiple selection |
| `selectSize` | `Number` | `undefined` | Visible rows |
| `disabled` | `Boolean` | `false` | Disable the select |
| `required` | `Boolean` | `false` | Mark as required |
| `size` | `'sm' \| 'lg'` | `undefined` | Select size |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-select`
- `.form-select-{size}`
- `.is-valid`, `.is-invalid`
