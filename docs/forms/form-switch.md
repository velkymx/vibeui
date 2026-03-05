# VibeFormSwitch

Toggle switch component for boolean values.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const isEnabled = ref(false)
</script>

<template>
  <VibeFormSwitch
    v-model="isEnabled"
    label="Enable notifications"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | `false` | The toggle state (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `disabled` | `Boolean` | `false` | Disable the switch |
| `required` | `Boolean` | `false` | Mark as required |
| `inline` | `Boolean` | `false` | Display inline |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Important Notes

**Automatic ID Generation:** This component automatically generates a unique ID if one is not provided.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID to ensure proper label association and accessibility.

## Bootstrap CSS Classes

- `.form-check`, `.form-switch`
- `.form-check-input`
- `.form-check-label`
- `.is-valid`, `.is-invalid`
