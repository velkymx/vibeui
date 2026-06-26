# VibeFormInput

Single-line text input supporting all standard HTML input types, with built-in validation and accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number` | `''` | The input value (v-model). Coerced to a number when `type="number"`. |
| `type` | `InputType` | `'text'` | HTML input type (`text`, `email`, `password`, `number`, `tel`, `url`, `search`, `date`, `time`, `datetime-local`, `month`, `week`, `color`). |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Standalone label text (omit when inside a `VibeFormGroup`). |
| `placeholder` | `string` | `undefined` | Placeholder text. |
| `disabled` | `boolean` | `false` | Disable the input. |
| `readonly` | `boolean` | `false` | Make the input read-only. |
| `required` | `boolean` | `false` | Mark as required (renders a `*` next to a standalone label). |
| `size` | `'sm' \| 'lg'` | `undefined` | Control size. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message shown for the current `validationState`. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the input. |
| `plaintext` | `boolean` | `false` | Render as read-only plain text (`.form-control-plaintext`). |
| `noWrapper` | `boolean` | `false` | Render only the `<input>` (no wrapper/label/feedback). Use inside `VibeInputGroup`. |
| `focusRing` | `boolean` | `false` | Add the Bootstrap 5.3 `.focus-ring` helper. |
| `showToggle` | `boolean` | `false` | Show a show/hide password toggle button. Only applies when `type="password"`. |
| `showPasswordStrength` | `boolean` | `false` | Show a 4-segment strength meter and `aria-live` strength label below the input. Only applies when `type="password"`. |
| `autocomplete` | `AutocompleteType` | auto-detected | HTML `autocomplete` attribute. Auto-detected: `type="email"` → `"email"`. Set `"off"` to disable. |
| `inputmode` | `InputMode` | auto-detected | Mobile keyboard hint. Auto-detected: `number` → `decimal`, `email` → `email`, `tel` → `tel`, `url` → `url`, `search` → `search`. Override explicitly when needed. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number` | Emitted on input (number-coerced for `type="number"`). |
| `input` | `Event` | Native input event. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

None.

## Usage

### Recommended: inside a VibeFormGroup

`VibeFormGroup` generates the id, links the `<label>`, and wires `aria-describedby`, help text, and validation feedback for the first child control.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const name = ref('')
</script>

<template>
  <VibeFormGroup label="Full Name" help-text="As it appears on your ID.">
    <VibeFormInput v-model="name" placeholder="Jane Doe" />
  </VibeFormGroup>
</template>
```

### With validation

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
    <VibeFormInput
      v-model="email.value"
      type="email"
      @validate="validateEmail"
    />
  </VibeFormGroup>
</template>
```

### Standalone

```vue
<script setup lang="ts">
import { ref } from 'vue'
const search = ref('')
</script>

<template>
  <VibeFormInput v-model="search" label="Search" type="search" />
</template>
```

### Password field with toggle and strength meter

```vue
<script setup lang="ts">
import { ref } from 'vue'
const password = ref('')
</script>

<template>
  <VibeFormGroup label="Password" required>
    <VibeFormInput
      v-model="password"
      type="password"
      autocomplete="new-password"
      show-toggle
      show-password-strength
    />
  </VibeFormGroup>
</template>
```

## Important Notes

- **Automatic ID & label linking:** when wrapped in a `VibeFormGroup`, the first child control consumes the group id, so the group's `<label>`, help text, and feedback are linked automatically. Do not also set `label`/`helpText` on the input in that case — the group renders them.
- **Number coercion:** with `type="number"`, an empty field emits `''`; otherwise the emitted value is a `number`.
- **Plain text:** `plaintext` forces the control read-only.
- **Placeholder contrast (WCAG 1.4.3):** placeholder text is rendered at full opacity using `--bs-secondary-color`, overriding the browser-default ~0.6 alpha that drops contrast below 3:1.
- **`autocomplete` auto-detection:** the component sets `autocomplete="email"` automatically for `type="email"` inputs. For password fields, set `autocomplete="current-password"` (login) or `autocomplete="new-password"` (registration) explicitly — the component cannot infer intent from type alone.
- **`inputmode` auto-detection:** overrides only apply when the prop is not set. Pass an explicit `inputmode` to override (e.g. `inputmode="numeric"` for a 4-digit PIN field that uses `type="text"`).

## Bootstrap CSS Classes

- `.form-control`
- `.form-control-{sm|lg}`
- `.form-control-plaintext`
- `.is-valid`, `.is-invalid`
- `.focus-ring`
