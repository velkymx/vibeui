# VibeFormRadio

Radio button component for exclusive selection within a group.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const picked = ref('one')
</script>

<template>
  <VibeFormRadio
    v-model="picked"
    name="myGroup"
    value="one"
    label="Option One"
  />
  <VibeFormRadio
    v-model="picked"
    name="myGroup"
    value="two"
    label="Option Two"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `any` | `''` | The picked value (v-model) |
| `value` | `any` | Required | Value of this radio |
| `name` | `String` | Required | Shared name for the radio group |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `disabled` | `Boolean` | `false` | Disable the radio |
| `required` | `Boolean` | `false` | Mark as required |
| `inline` | `Boolean` | `false` | Display inline |
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
