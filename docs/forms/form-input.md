# VibeFormInput

Text input component with built-in validation support for various input types including text, email, password, number, URL, and more.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <VibeFormInput
    v-model="name"
    id="name"
    label="Full Name"
    placeholder="Enter your name"
  />
</template>
```

## Input Types

VibeFormInput supports all HTML5 input types:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const age = ref(0)
const phone = ref('')
const website = ref('')
const search = ref('')
</script>

<template>
  <!-- Email Input -->
  <VibeFormInput
    v-model="email"
    id="email"
    type="email"
    label="Email Address"
    placeholder="user@example.com"
  />

  <!-- Password Input -->
  <VibeFormInput
    v-model="password"
    id="password"
    type="password"
    label="Password"
  />

  <!-- Number Input -->
  <VibeFormInput
    v-model="age"
    id="age"
    type="number"
    label="Age"
  />

  <!-- Tel Input -->
  <VibeFormInput
    v-model="phone"
    id="phone"
    type="tel"
    label="Phone Number"
  />

  <!-- URL Input -->
  <VibeFormInput
    v-model="website"
    id="website"
    type="url"
    label="Website"
    placeholder="https://example.com"
  />

  <!-- Search Input -->
  <VibeFormInput
    v-model="search"
    id="search"
    type="search"
    label="Search"
  />
</template>
```

## Sizes

```vue
<template>
  <!-- Small -->
  <VibeFormInput
    v-model="name"
    id="name-sm"
    label="Small Input"
    size="sm"
  />

  <!-- Default -->
  <VibeFormInput
    v-model="name"
    id="name-default"
    label="Default Input"
  />

  <!-- Large -->
  <VibeFormInput
    v-model="name"
    id="name-lg"
    label="Large Input"
    size="lg"
  />
</template>
```

## Validation

### Basic Validation

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
  emailValidationMessage.value = 'Email looks good!'
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

const username = useFormValidation('')

const validateUsername = () => {
  username.validate([
    validators.required(),
    validators.minLength(3, 'Username must be at least 3 characters'),
    validators.maxLength(20, 'Username must not exceed 20 characters')
  ])
}
</script>

<template>
  <VibeFormInput
    v-model="username.value"
    id="username"
    label="Username"
    :validation-state="username.validationState"
    :validation-message="username.validationMessage"
    @validate="validateUsername"
    validate-on="blur"
    required
  />
</template>
```

### API Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const username = ref('')
const usernameValidationState = ref(null)
const usernameValidationMessage = ref('')

const checkUsername = validators.async(async (value) => {
  const response = await fetch(`/api/check-username?username=${value}`)
  const data = await response.json()
  return data.available || 'Username is already taken'
})

const validateUsername = async () => {
  const rules = [
    validators.required(),
    validators.minLength(3),
    checkUsername
  ]

  for (const rule of rules) {
    const result = await rule.validator(username.value)
    if (result !== true) {
      usernameValidationState.value = 'invalid'
      usernameValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  usernameValidationState.value = 'valid'
  usernameValidationMessage.value = 'Username is available!'
}
</script>

<template>
  <VibeFormInput
    v-model="username"
    id="username"
    label="Username"
    :validation-state="usernameValidationState"
    :validation-message="usernameValidationMessage"
    @validate="validateUsername"
    validate-on="blur"
    required
  />
</template>
```

## States

```vue
<script setup lang="ts">
import { ref } from 'vue'

const disabled = ref('')
const readonly = ref('This is readonly')
</script>

<template>
  <!-- Disabled -->
  <VibeFormInput
    v-model="disabled"
    id="disabled"
    label="Disabled Input"
    disabled
  />

  <!-- Readonly -->
  <VibeFormInput
    v-model="readonly"
    id="readonly"
    label="Readonly Input"
    readonly
  />

  <!-- Plaintext (for read-only text styled as plain text) -->
  <VibeFormInput
    v-model="readonly"
    id="plaintext"
    label="Plaintext Input"
    plaintext
  />
</template>
```

## Help Text

```vue
<template>
  <VibeFormInput
    v-model="password"
    id="password"
    type="password"
    label="Password"
    help-text="Password must be at least 8 characters long and contain a mix of letters and numbers."
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number` | `''` | The input value (v-model) |
| `id` | `String` | required | Unique identifier for the input |
| `label` | `String` | `undefined` | Label text |
| `type` | `InputType` | `'text'` | HTML input type (text, email, password, number, tel, url, search, date, time, etc.) |
| `placeholder` | `String` | `undefined` | Placeholder text |
| `disabled` | `Boolean` | `false` | Disable the input |
| `readonly` | `Boolean` | `false` | Make the input readonly |
| `required` | `Boolean` | `false` | Mark as required (adds asterisk to label) |
| `size` | `'sm' \| 'lg'` | `undefined` | Input size |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation feedback message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to trigger validation |
| `helpText` | `String` | `undefined` | Help text displayed below input |
| `plaintext` | `Boolean` | `false` | Display as plain text (readonly styling) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Number` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `input` | `Event` | Native input event |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Examples

### Complete Form Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  age: 0
})

const validation = ref({
  firstName: { state: null, message: '' },
  lastName: { state: null, message: '' },
  email: { state: null, message: '' },
  age: { state: null, message: '' }
})

const validateField = async (field: string, rules: any[]) => {
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
  const isValid = await Promise.all([
    validateField('firstName', [validators.required()]),
    validateField('lastName', [validators.required()]),
    validateField('email', [validators.required(), validators.email()]),
    validateField('age', [validators.required(), validators.min(18)])
  ])

  if (isValid.every(v => v)) {
    console.log('Form submitted:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormInput
      v-model="form.firstName"
      id="firstName"
      label="First Name"
      :validation-state="validation.firstName.state"
      :validation-message="validation.firstName.message"
      @validate="validateField('firstName', [validators.required()])"
      required
    />

    <VibeFormInput
      v-model="form.lastName"
      id="lastName"
      label="Last Name"
      :validation-state="validation.lastName.state"
      :validation-message="validation.lastName.message"
      @validate="validateField('lastName', [validators.required()])"
      required
    />

    <VibeFormInput
      v-model="form.email"
      id="email"
      type="email"
      label="Email"
      :validation-state="validation.email.state"
      :validation-message="validation.email.message"
      @validate="validateField('email', [validators.required(), validators.email()])"
      required
    />

    <VibeFormInput
      v-model="form.age"
      id="age"
      type="number"
      label="Age"
      :validation-state="validation.age.state"
      :validation-message="validation.age.message"
      @validate="validateField('age', [validators.required(), validators.min(18)])"
      help-text="You must be at least 18 years old"
      required
    />

    <VibeButton type="submit" variant="primary">Submit</VibeButton>
  </form>
</template>
```
