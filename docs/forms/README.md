# VibeUI Form Components

Comprehensive form components with built-in validation support for both front-end and API-based validation.

## Overview

VibeUI provides a complete set of form components that seamlessly integrate with Bootstrap styling and include powerful validation capabilities out of the box.

### Features

- ✅ **Full Bootstrap Integration** - Uses native Bootstrap classes and styling
- ✅ **Zero-Boilerplate IDs** - `id` props are now optional and automatically generated
- ✅ **Form Automation** - `VibeFormGroup` automatically links its label to child inputs via ID injection
- ✅ **Two-Way Data Binding** - v-model support on all components
- ✅ **Built-in Validation** - Comprehensive validation system with custom validators
- ✅ **Accessible** - Automatic ARIA attribute management and label linking
- ✅ **TypeScript** - Fully typed components and APIs

## Components

### Input Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **VibeFormInput** | Text, email, password, number, and other input types | [Docs](./form-input.md) |
| **VibeFormTextarea** | Multi-line text input | [Docs](./form-textarea.md) |
| **VibeFormSelect** | Single and multiple selection dropdowns | [Docs](./form-select.md) |
| **VibeFormSpinbutton** | Number input with increment/decrement buttons | [Docs](./form-spinbutton.md) |
| **VibeFormDatepicker** | Date, time, and datetime inputs | [Docs](./form-datepicker.md) |

### Choice Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **VibeFormCheckbox** | Single checkboxes and checkbox groups | [Docs](./form-checkbox.md) |
| **VibeFormRadio** | Radio button groups for exclusive selection | [Docs](./form-radio.md) |
| **VibeFormSwitch** | Toggle switches for boolean settings | [Docs](./form-switch.md) |

### Advanced Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **VibeFormWysiwyg** | WYSIWYG editor powered by QuillJS | [Docs](./form-wysiwyg.md) |
| **VibeFormGroup** | Form group container for layout and automated label linking | [Docs](./form-group.md) |

## Quick Start

### Basic Example (Automated)

VibeUI automatically handles ID generation and label linking. No `id` or `label-for` is required when using `VibeFormGroup`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <VibeFormGroup label="Email Address">
    <VibeFormInput
      v-model="email"
      type="email"
      placeholder="Enter email"
    />
  </VibeFormGroup>
</template>
```

## Documentation

### Component Documentation

- [VibeFormInput](./form-input.md) - Text inputs with validation
- [VibeFormSelect](./form-select.md) - Select dropdowns
- [VibeFormTextarea](./form-textarea.md) - Multi-line text input
- [VibeFormSpinbutton](./form-spinbutton.md) - Number input with buttons
- [VibeFormDatepicker](./form-datepicker.md) - Date and time inputs
- [VibeFormCheckbox](./form-checkbox.md) - Checkboxes and groups
- [VibeFormRadio](./form-radio.md) - Radio button groups
- [VibeFormSwitch](./form-switch.md) - Toggle switches
- [VibeFormGroup](./form-group.md) - Form group container
- [VibeFormWysiwyg](./form-wysiwyg.md) - WYSIWYG editor

### Guides

- [Validation Guide](./validation.md) - Comprehensive validation documentation
