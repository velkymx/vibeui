# VibeFormTextarea

Multi-line text input component.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <VibeFormTextarea
    v-model="text"
    label="Comments"
    placeholder="Enter your comments here..."
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | The textarea value (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `placeholder` | `String` | `undefined` | Placeholder text |
| `rows` | `Number \| String` | `3` | Number of visible rows |
| `disabled` | `Boolean` | `false` | Disable the textarea |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `size` | `'sm' \| 'lg'` | `undefined` | Textarea size |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |
| `noResize` | `Boolean` | `false` | Disable resizing |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-control`
- `.form-control-{size}`
- `.is-valid`, `.is-invalid`
