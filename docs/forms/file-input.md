# VibeFileInput

File attachment input with optional drag-drop zone. v-model exposes selected files as `File[]`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `File[]` | `[]` | Selected files (v-model) |
| `id` | `String` | auto | |
| `label` | `String` | `undefined` | |
| `multiple` | `Boolean` | `false` | Allow multi-select |
| `accept` | `String` | `undefined` | MIME / extension filter (e.g. `'image/*'`) |
| `maxSize` | `Number` | `undefined` | Max bytes per file. Files over this go to `invalid`. |
| `dragDrop` | `Boolean` | `false` | Render a drop zone variant |
| `disabled` | `Boolean` | `false` | |
| `size` | `'sm' \| 'lg'` | `undefined` | Bootstrap form-control sizing |
| `helpText` | `String` | `undefined` | Subtle hint below the input |
| `dropzoneText` | `String` | `'Drag files here or click to browse'` | Drop zone copy |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `File[]` | Accepted files |
| `change` | `File[]` | Same payload |
| `invalid` | `File[]` | Files rejected by `maxSize` |

### Slots

| Slot | Description |
|------|-------------|
| `dropzone` | Replace default drop-zone copy when `dragDrop=true` |

## Examples

### Plain input

```vue
<VibeFileInput v-model="files" multiple accept=".pdf,.docx" />
```

### Drop zone with size limit

```vue
<script setup>
import { ref } from 'vue'
const files = ref([])
const rejected = ref([])

function onInvalid(rejectedFiles) {
  rejected.value = rejectedFiles
}
</script>

<template>
  <VibeFileInput
    v-model="files"
    drag-drop
    multiple
    :max-size="5 * 1024 * 1024"
    accept="image/*"
    help-text="Up to 5 MB each. Images only."
    @invalid="onInvalid"
  />

  <VibeAlert v-if="rejected.length" variant="warning">
    Skipped {{ rejected.length }} oversize file(s).
  </VibeAlert>
</template>
```
