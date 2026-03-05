# VibeFormInput

Text input component with built-in validation support for various input types.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const name = ref('')
</script>

<template>
  <VibeFormInput
    v-model="name"
    label="Full Name"
    placeholder="Enter your name"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number` | `''` | The input value (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `type` | `InputType` | `'text'` | HTML input type |
| `placeholder` | `String` | `undefined` | Placeholder text |
| `disabled` | `Boolean` | `false` | Disable the input |
| `readonly` | `Boolean` | `false` | Make the input readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `size` | `'sm' \| 'lg'` | `undefined` | Input size |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |
| `plaintext` | `Boolean` | `false` | Display as plain text |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-control`
- `.form-control-{size}`
- `.is-valid`, `.is-invalid`
- `.form-control-plaintext`
