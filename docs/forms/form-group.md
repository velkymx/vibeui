# VibeFormGroup

Form group container component for organizing form fields with labels, help text, and validation feedback.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
</script>

<template>
  <VibeFormGroup
    label="Email Address"
    label-for="email"
    help-text="We'll never share your email with anyone else."
  >
    <input
      id="email"
      v-model="email"
      type="email"
      class="form-control"
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
    label-for="email"
    floating
  >
    <input
      id="email"
      v-model="email"
      type="email"
      class="form-control"
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
    label-for="email"
    row
    :label-cols="3"
    label-align="end"
  >
    <input
      id="email"
      v-model="email"
      type="email"
      class="form-control"
    />
  </VibeFormGroup>

  <VibeFormGroup
    label="Password"
    label-for="password"
    row
    :label-cols="3"
    label-align="end"
  >
    <input
      id="password"
      v-model="password"
      type="password"
      class="form-control"
    />
  </VibeFormGroup>
</template>
```

## With Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const emailValidationState = ref(null)
const emailValidationMessage = ref('')

const validateEmail = () => {
  if (!email.value) {
    emailValidationState.value = 'invalid'
    emailValidationMessage.value = 'Email is required'
  } else if (!email.value.includes('@')) {
    emailValidationState.value = 'invalid'
    emailValidationMessage.value = 'Please enter a valid email'
  } else {
    emailValidationState.value = 'valid'
    emailValidationMessage.value = 'Looks good!'
  }
}
</script>

<template>
  <VibeFormGroup
    label="Email Address"
    label-for="email"
    :validation-state="emailValidationState"
    :validation-message="emailValidationMessage"
    required
  >
    <input
      id="email"
      v-model="email"
      type="email"
      :class="['form-control', {
        'is-valid': emailValidationState === 'valid',
        'is-invalid': emailValidationState === 'invalid'
      }]"
      @blur="validateEmail"
    />
  </VibeFormGroup>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `undefined` | Label text |
| `labelFor` | `String` | `undefined` | ID of the form control |
| `required` | `Boolean` | `false` | Show required asterisk |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `helpText` | `String` | `undefined` | Help text |
| `floating` | `Boolean` | `false` | Use floating label layout |
| `row` | `Boolean` | `false` | Use horizontal row layout |
| `labelCols` | `Number \| String` | `undefined` | Number of columns for label (1-12) |
| `labelAlign` | `'start' \| 'center' \| 'end'` | `undefined` | Label text alignment |

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  address: ''
})

const validation = ref({
  fullName: { state: null, message: '' },
  email: { state: null, message: '' },
  phone: { state: null, message: '' }
})

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
  validation.value[field].message = 'Looks good!'
  return true
}

const handleSubmit = async () => {
  const isValid = await Promise.all([
    validateField('fullName', [validators.required()]),
    validateField('email', [validators.required(), validators.email()]),
    validateField('phone', [validators.required(), validators.pattern(/^\d{10}$/, 'Phone must be 10 digits')])
  ])

  if (isValid.every(v => v)) {
    console.log('Form submitted:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormGroup
      label="Full Name"
      label-for="fullName"
      :validation-state="validation.fullName.state"
      :validation-message="validation.fullName.message"
      required
    >
      <input
        id="fullName"
        v-model="form.fullName"
        type="text"
        :class="['form-control', {
          'is-valid': validation.fullName.state === 'valid',
          'is-invalid': validation.fullName.state === 'invalid'
        }]"
        @blur="validateField('fullName', [validators.required()])"
      />
    </VibeFormGroup>

    <VibeFormGroup
      label="Email Address"
      label-for="email"
      :validation-state="validation.email.state"
      :validation-message="validation.email.message"
      help-text="We'll never share your email"
      required
    >
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="['form-control', {
          'is-valid': validation.email.state === 'valid',
          'is-invalid': validation.email.state === 'invalid'
        }]"
        @blur="validateField('email', [validators.required(), validators.email()])"
      />
    </VibeFormGroup>

    <VibeFormGroup
      label="Phone Number"
      label-for="phone"
      :validation-state="validation.phone.state"
      :validation-message="validation.phone.message"
      help-text="10 digits, no spaces or dashes"
      required
    >
      <input
        id="phone"
        v-model="form.phone"
        type="tel"
        :class="['form-control', {
          'is-valid': validation.phone.state === 'valid',
          'is-invalid': validation.phone.state === 'invalid'
        }]"
        placeholder="5551234567"
        @blur="validateField('phone', [validators.required(), validators.pattern(/^\d{10}$/, 'Phone must be 10 digits')])"
      />
    </VibeFormGroup>

    <VibeFormGroup
      label="Address"
      label-for="address"
      help-text="Optional"
    >
      <textarea
        id="address"
        v-model="form.address"
        class="form-control"
        rows="3"
      ></textarea>
    </VibeFormGroup>

    <VibeButton type="submit" variant="primary">Submit</VibeButton>
  </form>
</template>
```
