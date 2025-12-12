# VibeUI Form Components

Comprehensive form components with built-in validation support for both front-end and API-based validation.

## Overview

VibeUI provides a complete set of form components that seamlessly integrate with Bootstrap 5 styling and include powerful validation capabilities out of the box.

### Features

- ✅ **Full Bootstrap 5 Integration** - Uses native Bootstrap classes and styling
- ✅ **Two-Way Data Binding** - v-model support on all components
- ✅ **Built-in Validation** - Comprehensive validation system with custom validators
- ✅ **Async Validation** - Support for API-based validation
- ✅ **Accessible** - ARIA attributes and keyboard navigation
- ✅ **TypeScript** - Fully typed components and APIs
- ✅ **Flexible** - Highly customizable with props and events

## Components

### Input Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **VibeFormInput** | Text, email, password, number, and other input types | [Docs](./form-input.md) |
| **VibeFormTextarea** | Multi-line text input with character count | [Docs](./form-textarea.md) |
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
| **VibeFormGroup** | Form group container for layout and validation | [Docs](./form-group.md) |

## Quick Start

### Installation

```bash
npm install @velkymx/vibeui bootstrap
```

### Basic Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const email = ref('')
const emailValidationState = ref(null)
const emailValidationMessage = ref('')

const validateEmail = async () => {
  const rules = [
    validators.required('Email is required'),
    validators.email('Please enter a valid email')
  ]

  for (const rule of rules) {
    const result = await rule.validator(email.value)
    if (result !== true) {
      emailValidationState.value = 'invalid'
      emailValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  emailValidationState.value = 'valid'
  emailValidationMessage.value = ''
}
</script>

<template>
  <VibeFormInput
    v-model="email"
    id="email"
    type="email"
    label="Email Address"
    :validation-state="emailValidationState"
    :validation-message="emailValidationMessage"
    @validate="validateEmail"
    required
  />
</template>
```

### Using the Composable

```vue
<script setup lang="ts">
import { useFormValidation, validators } from '@velkymx/vibeui'

const email = useFormValidation('')

const validateEmail = () => {
  email.validate([
    validators.required('Email is required'),
    validators.email('Please enter a valid email')
  ])
}
</script>

<template>
  <VibeFormInput
    v-model="email.value"
    id="email"
    type="email"
    label="Email Address"
    :validation-state="email.validationState"
    :validation-message="email.validationMessage"
    @validate="validateEmail"
    required
  />
</template>
```

## Validation

### Built-in Validators

VibeUI includes a comprehensive set of built-in validators:

```typescript
import { validators } from '@velkymx/vibeui'

// Required field
validators.required(message?)

// Email format
validators.email(message?)

// String length
validators.minLength(min, message?)
validators.maxLength(max, message?)

// Numeric range
validators.min(min, message?)
validators.max(max, message?)

// Custom pattern
validators.pattern(regex, message?)

// URL format
validators.url(message?)

// Async validation
validators.async(validatorFn)
```

[See full validation documentation →](./validation.md)

### Custom Validators

Create custom validators for your specific needs:

```typescript
const customValidator = {
  validator: (value) => {
    // Your validation logic
    return value === 'expected' || 'Custom error message'
  },
  message: 'Custom error message'
}
```

### API Validation

Validate against your backend API:

```typescript
const checkUsername = validators.async(async (value) => {
  const response = await fetch(`/api/check-username?username=${value}`)
  const data = await response.json()
  return data.available || 'Username is already taken'
})
```

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  age: 0,
  country: '',
  acceptTerms: false
})

const validation = ref({
  firstName: { state: null, message: '' },
  lastName: { state: null, message: '' },
  email: { state: null, message: '' },
  age: { state: null, message: '' },
  country: { state: null, message: '' },
  acceptTerms: { state: null, message: '' }
})

const countries = [
  { value: 'us', text: 'United States' },
  { value: 'ca', text: 'Canada' },
  { value: 'uk', text: 'United Kingdom' }
]

const validateField = async (field, rules) => {
  for (const rule of rules) {
    const result = await rule.validator(form.value[field])
    if (result !== true) {
      validation.value[field].state = 'invalid'
      validation.value[field].message = typeof result === 'string' ? result : rule.message
      return false
    }
  }
  validation.value[field].state = 'valid'
  validation.value[field].message = ''
  return true
}

const handleSubmit = async () => {
  const results = await Promise.all([
    validateField('firstName', [validators.required()]),
    validateField('lastName', [validators.required()]),
    validateField('email', [validators.required(), validators.email()]),
    validateField('age', [validators.required(), validators.min(18)]),
    validateField('country', [validators.required()]),
    validateField('acceptTerms', [validators.required()])
  ])

  if (results.every(r => r)) {
    console.log('Form submitted:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="row">
      <div class="col-md-6">
        <VibeFormInput
          v-model="form.firstName"
          id="firstName"
          label="First Name"
          :validation-state="validation.firstName.state"
          :validation-message="validation.firstName.message"
          @validate="validateField('firstName', [validators.required()])"
          required
        />
      </div>
      <div class="col-md-6">
        <VibeFormInput
          v-model="form.lastName"
          id="lastName"
          label="Last Name"
          :validation-state="validation.lastName.state"
          :validation-message="validation.lastName.message"
          @validate="validateField('lastName', [validators.required()])"
          required
        />
      </div>
    </div>

    <VibeFormInput
      v-model="form.email"
      id="email"
      type="email"
      label="Email Address"
      :validation-state="validation.email.state"
      :validation-message="validation.email.message"
      @validate="validateField('email', [validators.required(), validators.email()])"
      required
    />

    <VibeFormSpinbutton
      v-model="form.age"
      id="age"
      label="Age"
      :min="0"
      :max="120"
      :validation-state="validation.age.state"
      :validation-message="validation.age.message"
      @validate="validateField('age', [validators.required(), validators.min(18)])"
      help-text="You must be at least 18 years old"
      required
    />

    <VibeFormSelect
      v-model="form.country"
      id="country"
      label="Country"
      :options="countries"
      :validation-state="validation.country.state"
      :validation-message="validation.country.message"
      @validate="validateField('country', [validators.required()])"
      placeholder="Select a country"
      required
    />

    <VibeFormCheckbox
      v-model="form.acceptTerms"
      id="terms"
      label="I accept the terms and conditions"
      :validation-state="validation.acceptTerms.state"
      :validation-message="validation.acceptTerms.message"
      @validate="validateField('acceptTerms', [validators.required()])"
      required
    />

    <div class="mt-3">
      <VibeButton type="submit" variant="primary">Submit</VibeButton>
    </div>
  </form>
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

## Support

For issues, questions, or contributions, please visit:
- [GitHub Repository](https://github.com/velkymx/vibeui)
- [Issue Tracker](https://github.com/velkymx/vibeui/issues)

## License

MIT License - see [LICENSE](../../LICENSE) for details.
