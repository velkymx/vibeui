# VibeFormErrorSummary

Top-of-form error summary that lists all field errors in one place with links to the offending fields. Satisfies WCAG 3.3.1 (Error Identification) for forms with multiple validation errors.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `errors` | `Record<string, string>` | yes | Map of field name → error message. Entries with an empty string are ignored. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `focus` | `string` | Emitted when the user clicks an error link. Payload is the field key. Use it to programmatically focus the field. |

## Slots

None.

## Usage

### Basic

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const errors = reactive<Record<string, string>>({
  email: '',
  password: '',
})

function handleSubmit() {
  errors.email = ''
  errors.password = ''
  if (!form.email) errors.email = 'Email is required.'
  if (!form.password) errors.password = 'Password must be at least 8 characters.'
}

function focusField(key: string) {
  document.getElementById(`field-${key}`)?.focus()
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormErrorSummary :errors="errors" @focus="focusField" />

    <VibeFormGroup label="Email" required :validation-state="errors.email ? 'invalid' : null" :validation-message="errors.email">
      <VibeFormInput id="field-email" v-model="form.email" type="email" autocomplete="email" />
    </VibeFormGroup>

    <VibeFormGroup label="Password" required :validation-state="errors.password ? 'invalid' : null" :validation-message="errors.password">
      <VibeFormInput id="field-password" v-model="form.password" type="password" autocomplete="current-password" />
    </VibeFormGroup>

    <VibeButton type="submit" variant="primary">Sign in</VibeButton>
  </form>
</template>
```

### With useForm

```vue
<script setup lang="ts">
import { useForm, validators } from '@velkymx/vibeui'

const { fields, errors, handleSubmit } = useForm({
  email: { value: '', rules: [validators.required(), validators.email()] },
  password: { value: '', rules: [validators.required(), validators.minLength(8)] },
})

function focusField(key: string) {
  document.getElementById(`field-${key}`)?.focus()
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormErrorSummary :errors="errors" @focus="focusField" />
    <!-- fields … -->
  </form>
</template>
```

## Important Notes

- **Anchor convention:** error links use `href="#field-{key}"`. Set `:id="\`field-${key}\`"` on each input so the links resolve (and so `focusField` can look them up). The component itself does not set these ids — you control the field ids.
- **`role="alert"` (WCAG 4.1.3):** the container carries `role="alert" aria-live="polite"` so screen readers announce the error list automatically when errors appear, without requiring focus.
- **Auto-hides when clean:** when all `errors` values are empty strings the summary renders nothing. No need to conditionally mount it.
- **`@focus` vs native anchor:** the `@click.prevent` on each link suppresses the default scroll-to-anchor jump and lets you implement the focus strategy (e.g. scroll + focus, or open a collapsed section first).

## Bootstrap CSS Classes

- `.alert`, `.alert-danger`
