<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, type PropType } from 'vue'
import { useFormField } from '../composables/useFormField'
import type { Size, ValidationState } from '../types'

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
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  helpText: { type: String, default: undefined },
  dropzoneText: { type: String, default: 'Drag files here or click to browse' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', files: File[]): void
  (e: 'change', files: File[]): void
  (e: 'invalid', rejected: File[]): void
}>()

// Consumer HTML attributes (name, capture, …) belong on the native file input, not
// the wrapper <div> — native multipart form submission needs `name` on the control.
// Auto-inheritance is disabled and $attrs is bound explicitly (first, so prop-driven
// bindings win any conflict).
defineOptions({ inheritAttrs: false })

// Same validation contract as the other form controls: consume the surrounding
// VibeFormGroup's id when present, and defer label/help/feedback rendering to
// the group so they aren't duplicated.
const {
  formGroup,
  computedId,
  helpId,
  feedbackId,
  ariaDescribedBy,
  shouldRenderLabel,
  shouldRenderFeedback,
  shouldRenderHelp
} = useFormField('file-input', props)
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)


const inputClass = computed(() => {
  const c = ['form-control']
  if (props.size) c.push(`form-control-${props.size}`)
  if (props.validationState === 'valid') c.push('is-valid')
  if (props.validationState === 'invalid') c.push('is-invalid')
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
  dragCounter = 0
  isDragging.value = false
  if (props.disabled) return
  const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : []
  processFiles(files)
}

let dragCounter = 0

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  if (!props.disabled) {
    dragCounter++
    isDragging.value = true
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  dragCounter = Math.max(0, dragCounter - 1)
  if (dragCounter === 0) isDragging.value = false
}

const openFileBrowser = () => {
  if (props.disabled) return
  inputRef.value?.click()
}

const clearFiles = () => {
  if (inputRef.value) inputRef.value.value = ''
  emit('update:modelValue', [])
  emit('change', [])
}

defineExpose({ clearFiles })

const dropzoneClass = computed(() => {
  const c = ['vibe-file-input-dropzone']
  if (isDragging.value) c.push('vibe-file-input-dropzone-active')
  if (props.disabled) c.push('vibe-file-input-dropzone-disabled')
  // The native input is hidden in dragDrop mode, so Bootstrap's is-invalid
  // border would be invisible — surface the invalid state on the dropzone.
  if (props.validationState === 'invalid') c.push('vibe-file-input-dropzone-invalid')
  return c.join(' ')
})

// Document-level safety net: if a drag escapes the dropzone (off the page,
// dropped on a different target, ESC), our local @dragleave doesn't always fire.
const onDocumentDragEnd = () => {
  dragCounter = 0
  isDragging.value = false
}

onMounted(() => {
  if (typeof document === 'undefined') return
  document.addEventListener('dragend', onDocumentDragEnd)
  document.addEventListener('drop', onDocumentDragEnd)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('dragend', onDocumentDragEnd)
  document.removeEventListener('drop', onDocumentDragEnd)
})
</script>

<template>
  <div class="vibe-file-input">
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">{{ label }}</label>

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
      v-bind="$attrs"
      :id="computedId"
      ref="inputRef"
      type="file"
      :class="dragDrop ? '' : inputClass"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      :style="dragDrop ? 'display: none' : undefined"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="ariaDescribedBy"
      @change="handleChange"
    />

    <div v-if="shouldRenderHelp" :id="helpId" class="form-text">{{ helpText }}</div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="feedbackId" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <!-- role="alert" announces errors to SR users without requiring refocus (WCAG 4.1.3) -->
      <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" role="alert" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide a valid file.' }}
      </div>
    </template>
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

.vibe-file-input-dropzone-invalid {
  border-color: var(--bs-form-invalid-border-color, #dc3545);
}
</style>
