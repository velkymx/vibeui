# Form Validation

VibeUI ships a validation system for all form components, supporting synchronous and asynchronous rules. Use it with the `useFormValidation` composable (single field), the `useForm` composable (whole form), or by passing rule results directly.

## Built-in Validators

```ts
import { validators } from '@velkymx/vibeui'
```

Each validator returns a `ValidationRule`. A validator function returns `true` for valid, `false` to use the rule's `message`, or a non-empty `string` as the error message. Most validators skip empty values — pair them with `required()` to make a field mandatory.

| Validator | Signature | Description |
|-----------|-----------|-------------|
| `required` | `(message?)` | Non-empty value (also checks array length). |
| `email` | `(message?)` | Valid email format. |
| `minLength` | `(min, message?)` | String length ≥ `min`. |
| `maxLength` | `(max, message?)` | String length ≤ `max`. |
| `min` | `(min, message?)` | Numeric value ≥ `min`. |
| `max` | `(max, message?)` | Numeric value ≤ `max`. |
| `pattern` | `(regex, message?)` | Matches the regex. |
| `url` | `(message?)` | Parses as a valid URL. |
| `async` | `(fn)` | Wraps an async validator `(value) => Promise<boolean \| string>`. |

```ts
const rules = [
  validators.required('Email is required'),
  validators.email()
]
```

## Custom Rules

A rule is `{ validator, message? }`. The validator may be sync or async.

```ts
const passwordStrength = {
  validator: (value: unknown) => {
    const v = String(value ?? '')
    if (!v) return true
    if (!/[A-Z]/.test(v)) return 'Needs an uppercase letter'
    if (!/\d/.test(v)) return 'Needs a number'
    return true
  }
}

const rules = [validators.required(), validators.minLength(8), passwordStrength]
```

## Single-field validation: `useFormValidation`

```ts
import { useFormValidation } from '@velkymx/vibeui'

const field = useFormValidation('')   // initial value
```

Returns:

| Member | Type | Description |
|--------|------|-------------|
| `value` | `Ref` | The field value (bind with `v-model="field.value"`). |
| `validationState` | `Ref<'valid' \| 'invalid' \| null>` | Current state. |
| `validationMessage` | `Ref<string>` | Current message. |
| `isDirty` | `Ref<boolean>` | Set via `markAsDirty()`. |
| `isTouched` | `Ref<boolean>` | Set via `markAsTouched()`. |
| `isValidating` | `Ref<boolean>` | True while an async rule is running. |
| `isValid` | `ComputedRef<boolean>` | `validationState === 'valid'`. |
| `isInvalid` | `ComputedRef<boolean>` | `validationState === 'invalid'`. |
| `validate(rules)` | `(rules) => Promise<FormValidationResult>` | Runs rules; concurrency-safe (only the latest call wins). |
| `reset()` | `() => void` | Reset to initial value and clear state. |
| `markAsTouched()` / `markAsDirty()` | `() => void` | Manual flag setters. |

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

Editing an invalid field clears its `invalid` state automatically until you re-validate.

## Whole-form validation: `useForm`

```ts
import { useForm } from '@velkymx/vibeui'

const form = useForm({ username: '', email: '', age: 0 })
```

Returns:

| Member | Type | Description |
|--------|------|-------------|
| `fields` | reactive `T` | Form values; bind with `v-model="form.fields.x"`. |
| `errors` | reactive map | Per-field error messages (`''` when valid). |
| `touched` | reactive map | Per-field touched flags. |
| `isDirty` | `ComputedRef<boolean>` | True once any field differs from its initial value. |
| `isValid` | `ComputedRef<boolean>` | **`false` until the first `validate()`/`validateField()` call**, then reflects whether all errors are empty. |
| `values` | `ComputedRef<T>` | Snapshot copy of `fields`. |
| `validate(rules)` | `(rules) => Promise<{ valid, errors }>` | Validate the listed fields. |
| `validateField(key, rule)` | `(key, rule) => Promise<string>` | Validate one field; returns its message. |
| `reset()` | `() => void` | Restore initial values and clear errors/touched/validated state. |
| `markTouched(key)` / `markAllTouched()` | — | Touched flag setters. |
| `setField(key, value)` | — | Programmatically set a field. |

```vue
<script setup lang="ts">
import { useForm, validators } from '@velkymx/vibeui'

const form = useForm({ username: '', email: '', password: '' })

const rules = {
  username: [validators.required(), validators.minLength(3)],
  email: [validators.required(), validators.email()],
  password: [validators.required(), validators.minLength(8)]
}

const onSubmit = async () => {
  const { valid } = await form.validate(rules)
  if (valid) console.log('submit', form.values.value)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <VibeFormGroup label="Username" :validation-message="form.errors.username"
      :validation-state="form.errors.username ? 'invalid' : null">
      <VibeFormInput v-model="form.fields.username"
        @validate="form.validateField('username', rules.username)" />
    </VibeFormGroup>

    <VibeFormGroup label="Email" :validation-message="form.errors.email"
      :validation-state="form.errors.email ? 'invalid' : null">
      <VibeFormInput v-model="form.fields.email" type="email"
        @validate="form.validateField('email', rules.email)" />
    </VibeFormGroup>

    <VibeFormGroup label="Password" :validation-message="form.errors.password"
      :validation-state="form.errors.password ? 'invalid' : null">
      <VibeFormInput v-model="form.fields.password" type="password"
        @validate="form.validateField('password', rules.password)" />
    </VibeFormGroup>

    <VibeButton type="submit" variant="primary" :disabled="!form.isValid">
      Register
    </VibeButton>
  </form>
</template>
```

## When validation runs: `validateOn`

Form controls emit `validate` based on `validateOn`:

- Text-like controls (input, textarea, datepicker, spinbutton, wysiwyg): `'input' \| 'blur' \| 'change'`, default `'blur'`.
- Choice controls (checkbox, radio, switch, select): `'change' \| 'blur'`, default `'change'`.

Wire `@validate` to your validation call:

```vue
<VibeFormInput v-model="field.value" validate-on="input" @validate="run" />
```

## Async / API Validation

`validators.async` runs an async check (e.g. uniqueness). Because `useFormValidation.validate` is concurrency-safe, only the latest call applies its result.

```vue
<script setup lang="ts">
import { useFormValidation, validators } from '@velkymx/vibeui'

const username = useFormValidation('')

const isAvailable = validators.async(async (value) => {
  const res = await fetch(`/api/check-username?u=${encodeURIComponent(String(value))}`)
  const data = await res.json()
  return data.available || 'Username is already taken'
})

const validateUsername = () =>
  username.validate([validators.required(), validators.minLength(3), isAvailable])
</script>

<template>
  <VibeFormGroup
    label="Username"
    :validation-state="username.validationState"
    :validation-message="username.validationMessage"
  >
    <VibeFormInput v-model="username.value" @validate="validateUsername" />
  </VibeFormGroup>
</template>
```

## Notes

- **`useForm.isValid` starts `false`** and only becomes meaningful after the first validation runs — safe to use for disabling a submit button before any input.
- **Editing clears `invalid`** (in `useFormValidation`) so messages don't linger while the user fixes the field.
- **Empty-value skipping:** most validators pass on empty values; add `required()` to enforce presence.
