# VibeFormWysiwyg

Rich-text editor powered by Quill. HTML is sanitized with DOMPurify on the way in and on the way out (XSS defense-in-depth).

## Peer dependencies

This component requires two optional peers — install both:

```bash
npm install quill dompurify
```

Quill and DOMPurify are loaded lazily on mount. If `quill` is missing, the component shows a warning alert and emits a `component-error` event instead of crashing.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | HTML content (v-model). Sanitized with DOMPurify before being rendered. |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Label text. |
| `placeholder` | `string` | `'Write something...'` | Placeholder shown when empty. |
| `disabled` | `boolean` | `false` | Disable editing. |
| `readonly` | `boolean` | `false` | Make the editor read-only. |
| `required` | `boolean` | `false` | Mark as required. |
| `theme` | `'snow' \| 'bubble'` | `'snow'` | Quill theme. |
| `toolbar` | `unknown[] \| string \| boolean` | `undefined` | Toolbar config: a Quill toolbar array, a preset name (`'minimal'`, `'standard'`, `'full'`), `false` to hide, or omit for the default toolbar. |
| `mobileToolbar` | `unknown[] \| string \| boolean` | `undefined` | Toolbar used at mobile breakpoints (same value forms as `toolbar`). |
| `height` | `string` | `'200px'` | Minimum editor height. Must be a valid CSS length; invalid values fall back to `200px`. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the editor. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted with sanitized HTML as content changes. |
| `change` | — | Emitted on content change. |
| `blur` | — | Emitted on blur. |
| `focus` | — | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |
| `ready` | `unknown` | Emitted with the Quill instance once initialized. |
| `component-error` | `ComponentError` | Emitted if Quill fails to load (e.g. peer not installed). |

## Slots

None.

## Usage

### Recommended: inside a VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
const content = ref('<p>Hello <strong>world</strong></p>')
</script>

<template>
  <VibeFormGroup label="Description">
    <VibeFormWysiwyg v-model="content" toolbar="standard" height="300px" />
  </VibeFormGroup>
</template>
```

### Handling a missing peer

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentError } from '@velkymx/vibeui'

const content = ref('')
const onError = (err: ComponentError) => console.error(err.message)
</script>

<template>
  <VibeFormWysiwyg v-model="content" @component-error="onError" />
</template>
```

## Important Notes

- **Sanitization:** incoming `modelValue` HTML is sanitized before it is rendered, and the emitted HTML is sanitized too. Unsafe tags and attributes (e.g. `<script>`, inline event handlers) are stripped. Do not rely on the editor to preserve dangerous markup.
- **Both peers required:** `dompurify` is needed for sanitization and `quill` for the editor; install them together.
- **`height` is validated:** only CSS length values are accepted; anything else falls back to `200px`.
- **Responsive toolbar:** at mobile breakpoints `mobileToolbar` (or a compact default) is used, and the editor re-initializes while preserving content.
- **Group linking:** wrapped in a `VibeFormGroup`, the editor consumes the group id so the label and feedback link automatically.

## Bootstrap CSS Classes

- `.form-label`, `.form-text`
- `.alert`, `.alert-warning` (load-failure message)
- `.valid-feedback`, `.invalid-feedback`

The editor shell uses VibeUI's own `.vibe-wysiwyg-container` class plus Quill's `.ql-*` classes.
