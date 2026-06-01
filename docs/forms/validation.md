# Form Validation

VibeUI provides a comprehensive validation system for all form components with support for both synchronous and asynchronous validation.

## Built-in Validators

### Import

```typescript
import { validators } from '@velkymx/vibeui'
```

### Available Validators

#### required()

```typescript
validators.required(message?: string)
```

Ensures the field has a value.

```vue
<script setup lang="ts">
import { validators } from '@velkymx/vibeui'

const rules = [
  validators.required('This field is required')
]
</script>
```

#### email()

```typescript
validators.email(message?: string)
```

Validates email format.

```vue
<script setup lang="ts">
const rules = [
  validators.email('Please enter a valid email address')
]
</script>
```

#### minLength()

```typescript
validators.minLength(min: number, message?: string)
```

Validates minimum string length.

```vue
<script setup lang="ts">
const rules = [
  validators.minLength(8, 'Password must be at least 8 characters')
]
</script>
```

#### maxLength()

```typescript
validators.maxLength(max: number, message?: string)
```

Validates maximum string length.

```vue
<script setup lang="ts">
const rules = [
  validators.maxLength(50, 'Username must not exceed 50 characters')
]
</script>
```

#### min()

```typescript
validators.min(min: number, message?: string)
```

Validates minimum numeric value.

```vue
<script setup lang="ts">
const rules = [
  validators.min(18, 'You must be at least 18 years old')
]
</script>
```

#### max()

```typescript
validators.max(max: number, message?: string)
```

Validates maximum numeric value.

```vue
<script setup lang="ts">
const rules = [
  validators.max(120, 'Please enter a valid age')
]
</script>
```

#### pattern()

```typescript
validators.pattern(regex: RegExp, message?: string)
```

Validates against a custom regex pattern.

```vue
<script setup lang="ts">
const rules = [
  validators.pattern(/^\d{5}$/, 'ZIP code must be 5 digits'),
  validators.pattern(/^[A-Z]/, 'Must start with uppercase letter')
]
</script>
```

#### url()

```typescript
validators.url(message?: string)
```

Validates URL format.

```vue
<script setup lang="ts">
const rules = [
  validators.url('Please enter a valid URL')
]
</script>
```

#### async()

```typescript
validators.async(validatorFn: (value: any) => Promise<boolean | string>)
```

Creates a custom async validator for API validation.

```vue
<script setup lang="ts">
const checkUsername = validators.async(async (value) => {
  const response = await fetch(`/api/check-username?username=${value}`)
  const data = await response.json()
  return data.available || 'Username is already taken'
})

const rules = [
  validators.required(),
  checkUsername
]
</script>
```

## Custom Validators

### Simple Custom Validator

```vue
<script setup lang="ts">
const customValidator = {
  validator: (value) => {
    return value === 'correct' || 'Value must be "correct"'
  },
  message: 'Value must be "correct"'
}

const rules = [customValidator]
</script>
```

### Complex Custom Validator

```vue
<script setup lang="ts">
const passwordStrengthValidator = {
  validator: (value) => {
    if (!value) return true

    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*]/.test(value)

    if (!hasUpperCase) return 'Password must contain an uppercase letter'
    if (!hasLowerCase) return 'Password must contain a lowercase letter'
    if (!hasNumber) return 'Password must contain a number'
    if (!hasSpecialChar) return 'Password must contain a special character'

    return true
  },
  message: 'Password does not meet requirements'
}

const rules = [
  validators.required(),
  validators.minLength(8),
  passwordStrengthValidator
]
</script>
```

## Using the Validation Composable

### Basic Usage

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
    label="Email"
    :validation-state="email.validationState"
    :validation-message="email.validationMessage"
    @validate="validateEmail"
  />
</template>
```

### Composable API

```typescript
const field = useFormValidation(initialValue)

// Properties
field.value                // The field value
field.validationState      // 'valid' | 'invalid' | null
field.validationMessage    // Validation message
field.isDirty             // Has the value changed
field.isTouched           // Has the field been focused
field.isValidating        // Is validation in progress
field.isValid             // Computed: validationState === 'valid'
field.isInvalid           // Computed: validationState === 'invalid'

// Methods
await field.validate(rules)  // Run validation
field.reset()                // Reset to initial value
field.markAsTouched()        // Mark as touched
field.markAsDirty()          // Mark as dirty
```

## Validation Patterns

### Validate on Blur

```vue
<template>
  <VibeFormInput
    v-model="email"
    id="email"
    @validate="validateEmail"
    validate-on="blur"
  />
</template>
```

### Validate on Change

```vue
<template>
  <VibeFormInput
    v-model="password"
    id="password"
    @validate="validatePassword"
    validate-on="change"
  />
</template>
```

### Validate on Input

```vue
<template>
  <VibeFormInput
    v-model="username"
    id="username"
    @validate="validateUsername"
    validate-on="input"
  />
</template>
```

### Manual Validation

```vue
<script setup lang="ts">
const email = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const validateEmail = async () => {
  const rules = [validators.required(), validators.email()]

  for (const rule of rules) {
    const result = await rule.validator(email.value)
    if (result !== true) {
      validationState.value = 'invalid'
      validationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  validationState.value = 'valid'
  validationMessage.value = ''
}

const handleSubmit = async () => {
  await validateEmail()

  if (validationState.value === 'valid') {
    // Submit form
  }
}
</script>
```

## API Validation

### Check Username Availability

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const username = ref('')
const validationState = ref(null)
const validationMessage = ref('')
const isChecking = ref(false)

const checkUsernameAvailability = validators.async(async (value) => {
  isChecking.value = true

  try {
    const response = await fetch(`/api/users/check-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: value })
    })

    const data = await response.json()

    if (!data.available) {
      return data.message || 'Username is already taken'
    }

    return true
  } catch (error) {
    return 'Error checking username availability'
  } finally {
    isChecking.value = false
  }
})

const validateUsername = async () => {
  const rules = [
    validators.required('Username is required'),
    validators.minLength(3, 'Username must be at least 3 characters'),
    validators.maxLength(20, 'Username must not exceed 20 characters'),
    validators.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    checkUsernameAvailability
  ]

  for (const rule of rules) {
    const result = await rule.validator(username.value)
    if (result !== true) {
      validationState.value = 'invalid'
      validationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  validationState.value = 'valid'
  validationMessage.value = 'Username is available!'
}
</script>

<template>
  <VibeFormInput
    v-model="username"
    id="username"
    label="Username"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateUsername"
    validate-on="blur"
    :disabled="isChecking"
  >
    <template v-if="isChecking">
      <VibeSpinner size="sm" class="position-absolute end-0 top-50 translate-middle-y me-3" />
    </template>
  </VibeFormInput>
</template>
```

### Debounced API Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

// Debounce helper
function debounce(fn, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(fn(...args)), delay)
    })
  }
}

const email = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const checkEmailDebounced = debounce(async (value) => {
  const response = await fetch(`/api/check-email?email=${value}`)
  const data = await response.json()
  return data.available || 'Email is already registered'
}, 500)

const checkEmail = validators.async(checkEmailDebounced)

const validateEmail = async () => {
  const rules = [
    validators.required(),
    validators.email(),
    checkEmail
  ]

  for (const rule of rules) {
    const result = await rule.validator(email.value)
    if (result !== true) {
      validationState.value = 'invalid'
      validationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  validationState.value = 'valid'
  validationMessage.value = 'Email is available!'
}
</script>

<template>
  <VibeFormInput
    v-model="email"
    id="email"
    type="email"
    label="Email"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateEmail"
    validate-on="input"
  />
</template>
```

## Form-Level Validation

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { validators } from '@velkymx/vibeui'

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validation = reactive({
  username: { state: null, message: '' },
  email: { state: null, message: '' },
  password: { state: null, message: '' },
  confirmPassword: { state: null, message: '' }
})

const isFormValid = ref(false)

const validateField = async (field, rules) => {
  for (const rule of rules) {
    const result = await rule.validator(form[field])
    if (result !== true) {
      validation[field].state = 'invalid'
      validation[field].message = typeof result === 'string' ? result : rule.message
      return false
    }
  }

  validation[field].state = 'valid'
  validation[field].message = ''
  return true
}

const validateForm = async () => {
  const results = await Promise.all([
    validateField('username', [validators.required(), validators.minLength(3)]),
    validateField('email', [validators.required(), validators.email()]),
    validateField('password', [validators.required(), validators.minLength(8)]),
    validateField('confirmPassword', [
      validators.required(),
      {
        validator: (value) => value === form.password || 'Passwords do not match',
        message: 'Passwords do not match'
      }
    ])
  ])

  isFormValid.value = results.every(result => result === true)
  return isFormValid.value
}

const handleSubmit = async () => {
  if (await validateForm()) {
    console.log('Form is valid, submitting...', form)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormInput
      v-model="form.username"
      id="username"
      label="Username"
      :validation-state="validation.username.state"
      :validation-message="validation.username.message"
      @validate="validateField('username', [validators.required(), validators.minLength(3)])"
    />

    <VibeFormInput
      v-model="form.email"
      id="email"
      type="email"
      label="Email"
      :validation-state="validation.email.state"
      :validation-message="validation.email.message"
      @validate="validateField('email', [validators.required(), validators.email()])"
    />

    <VibeFormInput
      v-model="form.password"
      id="password"
      type="password"
      label="Password"
      :validation-state="validation.password.state"
      :validation-message="validation.password.message"
      @validate="validateField('password', [validators.required(), validators.minLength(8)])"
    />

    <VibeFormInput
      v-model="form.confirmPassword"
      id="confirmPassword"
      type="password"
      label="Confirm Password"
      :validation-state="validation.confirmPassword.state"
      :validation-message="validation.confirmPassword.message"
      @validate="validateField('confirmPassword', [
        validators.required(),
        { validator: (v) => v === form.password || 'Passwords do not match', message: 'Passwords do not match' }
      ])"
    />

    <VibeButton type="submit" variant="primary">Register</VibeButton>
  </form>
</template>
```
