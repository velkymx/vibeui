# VibeFormWysiwyg

Rich-text editor powered by Quill. HTML is sanitized with a consumer-provided sanitizer (typically DOMPurify) on the way in and on the way out (XSS defense-in-depth).

## Peer dependencies (consumer-injected)

> **Changed in 2.0.** VibeUI no longer imports `quill` or `dompurify` itself — so the library's build contains **no** reference to them, and a project that never uses `VibeFormWysiwyg` gets no bundler warnings/errors even under warnings-as-errors. You provide the peers.

Install the peers and import Quill's theme CSS in your own app:

```bash
npm install quill dompurify
```

```ts
// main.ts
import 'quill/dist/quill.snow.css'   // YOU import the editor theme CSS
```

Then provide a Quill **loader** and an optional **sanitizer** — app-wide via the plugin option (recommended):

```ts
import { createApp } from 'vue'
import VibeUI, { makeDomPurifySanitizer } from '@velkymx/vibeui'
import DOMPurify from 'dompurify'

createApp(App).use(VibeUI, {
  wysiwyg: {
    quillLoader: () => import('quill'),                 // your bundler resolves 'quill' here
    sanitizer: makeDomPurifySanitizer(DOMPurify),       // optional; see below
  },
}).mount('#app')
```

…or per instance via props (these override the app-level config):

```vue
<VibeFormWysiwyg
  v-model="content"
  :quill-loader="() => import('quill')"
  :sanitizer="mySanitizer"
/>
```

What happens if you skip one:

| Skipped | Result |
|---------|--------|
| `quillLoader` | The editor does not load. A warning alert renders in its place and a `component-error` event is emitted (no crash; DEV logs a `console.warn`). |
| `sanitizer` | The editor works, but the sanitizing pass is the identity function and `modelValue` HTML reaches Quill unsanitized. Quill's Delta conversion still applies its own allowlist, but you lose the defence-in-depth pass. DEV logs a `console.warn`. |

`makeDomPurifySanitizer(DOMPurify)` builds a sanitizer bound to DOMPurify and VibeUI's `WYSIWYG_PURIFY_CONFIG` allowlist (both exported from the package). You can also pass any `(html: string) => string`.

## Migration from 1.x

1.x auto-imported `quill`, its snow CSS, and `dompurify`. In 2.0 you must:

1. `import 'quill/dist/quill.snow.css'` in your app.
2. Provide `quillLoader` (and, for sanitization, `sanitizer`) via `app.use(VibeUI, { wysiwyg: { … } })` or the `:quill-loader` / `:sanitizer` props.

No other props or events changed.

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
| `quillLoader` | `() => Promise<unknown>` | `undefined` | Loads the Quill constructor (e.g. `() => import('quill')`). Overrides the app-level `wysiwyg.quillLoader`. Required (here or app-level) for the editor to load. |
| `sanitizer` | `(html: string) => string` | `undefined` | Sanitizes HTML in and out. Overrides the app-level `wysiwyg.sanitizer`. Omitted ⇒ identity (see the peer table). |

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
- **Inject the peers:** provide `quillLoader` (required) and `sanitizer` (recommended) via the plugin option or props — VibeUI never imports `quill`/`dompurify` itself. See [Peer dependencies (consumer-injected)](#peer-dependencies-consumer-injected).
- **`height` is validated:** only CSS length values are accepted; anything else falls back to `200px`.
- **Responsive toolbar:** at mobile breakpoints `mobileToolbar` (or a compact default) is used, and the editor re-initializes while preserving content.
- **Group linking:** wrapped in a `VibeFormGroup`, the editor consumes the group id so the label and feedback link automatically.

## Bootstrap CSS Classes

- `.form-label`, `.form-text`
- `.alert`, `.alert-warning` (load-failure message)
- `.valid-feedback`, `.invalid-feedback`

The editor shell uses VibeUI's own `.vibe-wysiwyg-container` class plus Quill's `.ql-*` classes.
