# VibeFormTextarea

Multi-line text input with optional character counting, built-in validation, and accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The textarea value (v-model). |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Standalone label text. |
| `placeholder` | `string` | `undefined` | Placeholder text. |
| `rows` | `number \| string` | `3` | Number of visible text rows. |
| `maxlength` | `number \| string` | `undefined` | Maximum character count (also shown in the counter when `showCharCount` is set). |
| `disabled` | `boolean` | `false` | Disable the textarea. |
| `readonly` | `boolean` | `false` | Make the textarea read-only. |
| `required` | `boolean` | `false` | Mark as required. |
| `size` | `'sm' \| 'lg'` | `undefined` | Control size. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the textarea. |
| `noResize` | `boolean` | `false` | Disable manual resizing (`resize: none`). |
| `showCharCount` | `boolean` | `false` | Show a character counter (`count` or `count / maxlength`). |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted on input. |
| `input` | `Event` | Native input event. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

None.

## Usage

### Recommended: inside a VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
const bio = ref('')
</script>

<template>
  <VibeFormGroup label="Bio">
    <VibeFormTextarea v-model="bio" :rows="5" :maxlength="280" show-char-count />
  </VibeFormGroup>
</template>
```

### Standalone

```vue
<script setup lang="ts">
import { ref } from 'vue'
const notes = ref('')
</script>

<template>
  <VibeFormTextarea v-model="notes" label="Notes" no-resize />
</template>
```

## Important Notes

- **Character counter:** `showCharCount` renders inside the help-text row. When inside a `VibeFormGroup` that provides its own help text, the counter is suppressed (the group owns help rendering).
- **Group linking:** wrapped in a `VibeFormGroup`, the textarea consumes the group id so the label and feedback link automatically.

## Bootstrap CSS Classes

- `.form-control`
- `.form-control-{sm|lg}`
- `.is-valid`, `.is-invalid`
- `.form-text`
