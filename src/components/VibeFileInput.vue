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

const partition = (files: File[]): { accepted: File[]; rejected: File[] } => {
  if (props.maxSize === undefined) return { accepted: files, rejected: [] }
  const accepted: File[] = []
  const rejected: File[] = []
  for (const f of files) {
    if (f.size > props.maxSize) rejected.push(f)
    else accepted.push(f)
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
      <input
        :id="computedId"
        ref="inputRef"
        type="file"
        :class="inputClass"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        style="display: none"
        @change="handleChange"
      />
    </div>

    <input
      v-else
      :id="computedId"
      ref="inputRef"
      type="file"
      :class="inputClass"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
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
