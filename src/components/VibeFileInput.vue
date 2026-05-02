<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useId } from '../composables/useId'
import type { Size } from '../types'

const props = defineProps({
  modelValue: { type: Array as PropType<File[]>, default: () => [] },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  multiple: { type: Boolean, default: false },
  accept: { type: String, default: undefined },
  maxSize: { type: Number, default: undefined },
  dragDrop: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: undefined },
  helpText: { type: String, default: undefined },
  dropzoneText: { type: String, default: 'Drag files here or click to browse' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', files: File[]): void
  (e: 'change', files: File[]): void
  (e: 'invalid', rejected: File[]): void
}>()

const computedId = computed(() => props.id || useId('file-input'))
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const inputClass = computed(() => {
  const c = ['form-control']
  if (props.size) c.push(`form-control-${props.size}`)
  return c.join(' ')
})

const matchesAccept = (file: File, accept: string): boolean => {
  // accept is a comma-separated list of MIME types ("image/*", "text/plain")
  // and/or extensions (".pdf", ".docx").
  const tokens = accept.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (tokens.length === 0) return true
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  for (const token of tokens) {
    if (token.startsWith('.')) {
      if (fileName.endsWith(token)) return true
      continue
    }
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, token.length - 1) // keep trailing slash
      if (fileType.startsWith(prefix)) return true
      continue
    }
    if (fileType === token) return true
  }
  return false
}

const partition = (files: File[]): { accepted: File[]; rejected: File[] } => {
  const accepted: File[] = []
  const rejected: File[] = []
  for (const f of files) {
    if (props.maxSize !== undefined && f.size > props.maxSize) {
      rejected.push(f)
      continue
    }
    if (props.accept && !matchesAccept(f, props.accept)) {
      rejected.push(f)
      continue
    }
    accepted.push(f)
  }
  return { accepted, rejected }
}

const processFiles = (files: File[]) => {
  const { accepted, rejected } = partition(files)
  emit('update:modelValue', accepted)
  emit('change', accepted)
  if (rejected.length > 0) emit('invalid', rejected)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  processFiles(files)
  // Reset so that re-selecting the same file fires `change` again.
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  if (props.disabled) return
  const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : []
  processFiles(files)
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  if (!props.disabled) isDragging.value = true
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const openFileBrowser = () => {
  if (props.disabled) return
  inputRef.value?.click()
}

const dropzoneClass = computed(() => {
  const c = ['vibe-file-input-dropzone']
  if (isDragging.value) c.push('vibe-file-input-dropzone-active')
  if (props.disabled) c.push('vibe-file-input-dropzone-disabled')
  return c.join(' ')
})
</script>

<template>
  <div class="vibe-file-input">
    <label v-if="label" :for="computedId" class="form-label">{{ label }}</label>

    <div
      v-if="dragDrop"
      :class="dropzoneClass"
      @drop="handleDrop"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileBrowser"
    >
      <slot name="dropzone">
        <p class="mb-0">{{ dropzoneText }}</p>
      </slot>
    </div>

    <!-- Hidden input is a SIBLING of the dropzone (not a child) so the
         programmatic .click() it dispatches cannot bubble back into the
         dropzone's @click handler and re-trigger this method. -->
    <input
      :id="computedId"
      ref="inputRef"
      type="file"
      :class="dragDrop ? '' : inputClass"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      :style="dragDrop ? 'display: none' : undefined"
      @change="handleChange"
    />

    <div v-if="helpText" class="form-text">{{ helpText }}</div>
  </div>
</template>

<style scoped>
.vibe-file-input-dropzone {
  border: 2px dashed var(--bs-border-color, #ced4da);
  border-radius: 0.375rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.vibe-file-input-dropzone-active {
  border-color: var(--bs-primary, #0d6efd);
  background-color: var(--bs-primary-bg-subtle, rgba(13, 110, 253, 0.05));
}

.vibe-file-input-dropzone-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
