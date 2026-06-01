# useForm

Multi-field form composable for managing groups of related fields with reactive values, errors, and touched state. For single-field validation use `useFormValidation` instead.

## Quick start

```ts
import { useForm, validators } from '@velkymx/vibeui'

const { fields, errors, touched, isDirty, isValid, validate, reset, markTouched } = useForm({
  name: '',
  email: '',
  age: 0
})

const submit = async () => {
  const result = await validate({
    name: [validators.required('Name is required')],
    email: [validators.required(), validators.email()]
  })
  if (!result.valid) return
  // submit fields...
}
```

## Why a separate composable?

`useFormValidation` returns `{ value: Ref<T>, ... }` for a single field. In TypeScript templates the nested `value` ref does not auto-unwrap deeply — to keep template type-checking clean you must destructure once at script level (`const { value: name } = useFormValidation('')`).

For multi-field forms, that destructure pattern multiplied per field becomes noisy. `useForm` returns a single reactive `fields` object: properties are auto-unwrapped reactively, so `{{ fields.name }}` works directly in templates with full TypeScript inference.

## Returned API

| Key | Type | Description |
|---|---|---|
| `fields` | `T` (reactive) | Mutable field values. `fields.name = 'x'` updates state. |
| `errors` | `Record<keyof T, string>` (reactive) | Per-field error message. Empty string = no error. |
| `touched` | `Record<keyof T, boolean>` (reactive) | Per-field touched flag. |
| `isDirty` | `ComputedRef<boolean>` | True if any field differs from initial. |
| `isValid` | `ComputedRef<boolean>` | True if no field has an error. |
| `values` | `ComputedRef<T>` | Snapshot of current field values. |
| `validate(rules)` | `(rules) => Promise<{ valid, errors }>` | Run rules; populates `errors` map. |
| `validateField(key, rule)` | `(key, rule) => Promise<string>` | Run rules for one field. |
| `reset()` | `() => void` | Restore initial values, clear errors/touched. |
| `markTouched(key)` | `(key) => void` | Mark single field touched. |
| `markAllTouched()` | `() => void` | Mark every field touched (use on submit). |
| `setField(key, value)` | `(key, value) => void` | Programmatic field update. |

## Validation rules

`validate(rules)` accepts a record mapping field keys to either a `ValidatorFunction` or a `ValidationRule[]` array. Reuse the built-in validators or pass arbitrary functions.

```ts
const result = await validate({
  email: [validators.required(), validators.email()],
  age:   [validators.min(18, 'Must be 18+')],
  bio:   (value) => typeof value === 'string' && value.length <= 500
})
```

## Single-field destructure pattern

If you only have one field, prefer `useFormValidation` and destructure at the call site:

```ts
import { useFormValidation } from '@velkymx/vibeui'

const { value: name, validationState, validationMessage, validate } = useFormValidation('')
```

In the template, top-level refs auto-unwrap:

```vue
<input v-model="name" />
<span v-if="validationState === 'invalid'">{{ validationMessage }}</span>
```

Avoid `const form = useFormValidation('')` followed by `{{ form.value }}` in templates — the nested ref type does not unwrap cleanly under Volar.
