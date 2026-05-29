# VibeFileInput

File attachment input with optional drag-and-drop zone. `v-model` exposes the selected files as `File[]`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `File[]` | `[]` | The accepted files (v-model). |
| `id` | `string` | auto-generated | Element id. |
| `label` | `string` | `undefined` | Label text. |
| `multiple` | `boolean` | `false` | Allow selecting multiple files. |
| `accept` | `string` | `undefined` | Comma-separated MIME types and/or extensions (e.g. `image/*,.pdf`). Used both as the native filter and for rejection. |
| `maxSize` | `number` | `undefined` | Maximum file size in bytes; larger files are rejected. |
| `dragDrop` | `boolean` | `false` | Render a drag-and-drop zone instead of the native control. |
| `disabled` | `boolean` | `false` | Disable the input. |
| `size` | `'sm' \| 'lg'` | `undefined` | Control size (native control only). |
| `helpText` | `string` | `undefined` | Help text below the input. |
| `dropzoneText` | `string` | `'Drag files here or click to browse'` | Text shown inside the drop zone. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `File[]` | Emitted with the accepted files. |
| `change` | `File[]` | Emitted with the accepted files (mirrors `update:modelValue`). |
| `invalid` | `File[]` | Emitted with files rejected by `accept` or `maxSize`. |

## Slots

| Slot | Description |
|------|-------------|
| `dropzone` | Custom content for the drop zone (only when `dragDrop` is set). |

## Exposed methods

| Method | Description |
|--------|-------------|
| `clearFiles()` | Clears the native input and emits an empty selection. |

## Usage

### Native input

```vue
<script setup lang="ts">
import { ref } from 'vue'
const files = ref<File[]>([])
</script>

<template>
  <VibeFileInput
    v-model="files"
    label="Attachment"
    accept="image/*,.pdf"
    :max-size="5 * 1024 * 1024"
    help-text="Images or PDF, up to 5 MB."
  />
</template>
```

### Drag-and-drop with rejection handling

```vue
<script setup lang="ts">
import { ref } from 'vue'
const files = ref<File[]>([])

const onInvalid = (rejected: File[]) => {
  console.warn('Rejected:', rejected.map((f) => f.name))
}
</script>

<template>
  <VibeFileInput
    v-model="files"
    multiple
    drag-drop
    accept="image/*"
    :max-size="2 * 1024 * 1024"
    @invalid="onInvalid"
  />
</template>
```

## Important Notes

- **Same-file reselection:** the native input is reset after each change so picking the same file again still fires `change`.
- **Rejection:** files failing `accept` or exceeding `maxSize` are excluded from the model and reported via the `invalid` event.
- **Drag safety:** a document-level fallback resets the dragging state if a drag ends or drops outside the zone.

## Bootstrap CSS Classes

- `.form-control`, `.form-control-{sm|lg}`
- `.form-label`, `.form-text`

The drop zone uses VibeUI's own `.vibe-file-input-dropzone*` classes.
