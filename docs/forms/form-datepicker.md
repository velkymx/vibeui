# VibeFormDatepicker

Date and time input component using native browser pickers.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const date = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="date"
    label="Choose a date"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | The date string (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `disabled` | `Boolean` | `false` | Disable the picker |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `min` | `String` | `undefined` | Minimum date |
| `max` | `String` | `undefined` | Maximum date |
| `size` | `'sm' \| 'lg'` | `undefined` | Picker size |
| `type` | `String` | `'date'` | Type: `'date'`, `'time'`, `'datetime-local'`, etc. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-control`
- `.form-control-{size}`
- `.is-valid`, `.is-invalid`
