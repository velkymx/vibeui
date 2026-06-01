# VibeUI Form Components

Form controls with built-in validation, accessibility, and Bootstrap 5.3 styling.

## Overview

VibeUI form controls integrate with Bootstrap and include validation and accessibility out of the box.

### Features

- **Bootstrap 5.3 styling** via native classes
- **Zero-boilerplate ids** — `id` props are optional and auto-generated
- **Accessible by default** — `VibeFormGroup` auto-links labels, help text, and feedback to its first child control
- **Two-way binding** with `v-model` on every control
- **Validation** — `useFormValidation`, `useForm`, and built-in `validators`
- **Fully typed** props, events, and APIs

## Recommended pattern: VibeFormGroup

Wrap a control in `VibeFormGroup` to auto-generate the id and wire the `<label>`, `aria-describedby`, help text, and validation feedback. The first child control consumes the group id (single-consumer rule).

```vue
<script setup lang="ts">
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <VibeFormGroup label="Email Address" help-text="We'll never share it.">
    <VibeFormInput v-model="email" type="email" placeholder="Enter email" />
  </VibeFormGroup>
</template>
```

## Components

### Inputs

| Component | Description | Docs |
|-----------|-------------|------|
| VibeFormInput | Text, email, password, number, and other input types | [form-input.md](./form-input.md) |
| VibeInputGroup | Prepend/append text, buttons, or elements | [input-group.md](./input-group.md) |
| VibeFormTextarea | Multi-line text with optional char count | [form-textarea.md](./form-textarea.md) |
| VibeFormSelect | Single and multiple selection | [form-select.md](./form-select.md) |
| VibeFormSpinbutton | Number input with increment/decrement | [form-spinbutton.md](./form-spinbutton.md) |
| VibeFormDatepicker | Date, time, and datetime inputs | [form-datepicker.md](./form-datepicker.md) |
| VibeAutocomplete | Search-as-you-type with array/async source | [autocomplete.md](./autocomplete.md) |
| VibeFileInput | File picker with optional drag-and-drop | [file-input.md](./file-input.md) |

### Choice controls

| Component | Description | Docs |
|-----------|-------------|------|
| VibeFormCheckbox | Single checkbox or checkbox group | [form-checkbox.md](./form-checkbox.md) |
| VibeFormRadio | Radio button groups | [form-radio.md](./form-radio.md) |
| VibeFormSwitch | Toggle switch | [form-switch.md](./form-switch.md) |

### Advanced

| Component | Description | Docs |
|-----------|-------------|------|
| VibeFormWysiwyg | Rich-text editor (requires `quill` + `dompurify`) | [form-wysiwyg.md](./form-wysiwyg.md) |
| VibeFormGroup | Layout + automatic label/id/feedback linking | [form-group.md](./form-group.md) |

## Validation

See the [Validation Guide](./validation.md) for `useFormValidation`, `useForm`, the built-in `validators`, and async/API validation.

```vue
<script setup lang="ts">
import { useFormValidation, validators } from '@velkymx/vibeui'

const email = useFormValidation('')
const validateEmail = () =>
  email.validate([validators.required(), validators.email()])
</script>

<template>
  <VibeFormGroup
    label="Email"
    :validation-state="email.validationState"
    :validation-message="email.validationMessage"
  >
    <VibeFormInput v-model="email.value" type="email" @validate="validateEmail" />
  </VibeFormGroup>
</template>
```
