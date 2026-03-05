# VibeFormWysiwyg

WYSIWYG (What You See Is What You Get) editor component powered by QuillJS.

## Installation

First, install Quill as a dependency:

```bash
npm install quill
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
const content = ref('')
</script>

<template>
  <VibeFormWysiwyg
    v-model="content"
    label="Content"
    placeholder="Write something amazing..."
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | The HTML content (v-model) |
| `id` | `String` | `Auto-generated` | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `placeholder` | `String` | `'Write something...'` | Placeholder text |
| `disabled` | `Boolean` | `false` | Disable the editor |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `theme` | `'snow' \| 'bubble'` | `'snow'` | Quill theme |
| `toolbar` | `Array \| String \| Boolean` | default toolbar | Toolbar configuration |
| `height` | `String` | `'200px'` | Minimum height |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Important Notes

**Automatic Initialization:** This component dynamically imports Quill and initializes it when mounted. If Quill is not installed in your project, it will display a helpful error message.

**Lifecycle Management:** VibeFormWysiwyg automatically cleans up its internal Quill instance and removes orphaned toolbar elements from the DOM on unmount to prevent memory leaks.

**Automatic ID Injection:** When used inside a `VibeFormGroup`, this component will automatically inherit the group's ID for proper label association.

## Bootstrap CSS Classes

- `.vibe-wysiwyg-container`
- `.is-valid`
- `.is-invalid`
- Uses native Quill CSS classes internally.
