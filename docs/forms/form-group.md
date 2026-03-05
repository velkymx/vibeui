# VibeFormGroup

Form group container component for organizing form fields with labels, help text, and validation feedback.

## Basic Usage

VibeFormGroup automatically links its label to the child VibeUI form component using automatic ID injection.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <VibeFormGroup
    label="Email Address"
    help-text="We'll never share your email with anyone else."
  >
    <VibeFormInput
      v-model="email"
      type="email"
      placeholder="Enter email"
    />
  </VibeFormGroup>
</template>
```

## Floating Labels

```vue
<template>
  <VibeFormGroup
    label="Email Address"
    floating
  >
    <VibeFormInput
      v-model="email"
      type="email"
      placeholder="name@example.com"
    />
  </VibeFormGroup>
</template>
```

## Horizontal Layout

```vue
<template>
  <VibeFormGroup
    label="Email"
    row
    :label-cols="3"
    label-align="end"
  >
    <VibeFormInput v-model="email" type="email" />
  </VibeFormGroup>
</template>
```

## Important Notes

**Automatic ID Injection:** VibeFormGroup uses Vue's provide/inject to share a unique ID with its child VibeUI components (like `VibeFormInput`, `VibeFormSelect`, etc.). This ensures that labels and ARIA attributes are correctly linked without requiring manual `id` or `label-for` props.

**Manual Linking:** If you are using native HTML elements instead of VibeUI components inside the group, you must still provide a `label-for` on the group and a matching `id` on your element.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `undefined` | Label text |
| `labelFor` | `String` | `Auto-generated` | ID of the form control |
| `required` | `Boolean` | `false` | Show required asterisk |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `helpText` | `String` | `undefined` | Help text |
| `floating` | `Boolean` | `false` | Use floating label layout |
| `row` | `Boolean` | `false` | Use horizontal row layout |
| `labelCols` | `Number \| String` | `undefined` | Number of columns for label (1-12) |
| `labelAlign` | `'start' \| 'center' \| 'end'` | `undefined` | Label text alignment |
