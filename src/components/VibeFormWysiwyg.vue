<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'

const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  label: { type: String, default: undefined },
  placeholder: { type: String, default: 'Write something...' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  theme: { type: String as () => 'snow' | 'bubble', default: 'snow' },
  toolbar: { type: [Array, String, Boolean], default: undefined },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as () => ValidationRule[] | ValidatorFunction | undefined, default: undefined },
  validateOn: { type: String as () => 'change' | 'blur', default: 'blur' },
  helpText: { type: String, default: undefined },
  height: { type: String, default: '200px' }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change', 'ready'])

const editorContainer = ref<HTMLElement | null>(null)
const quillInstance = ref<any>(null)
const isQuillLoaded = ref(false)
const loadError = ref<string | null>(null)

const internalValidationState = computed(() => props.validationState)

const containerClass = computed(() => {
  const classes = ['vibe-wysiwyg-container']

  if (internalValidationState.value === 'valid') classes.push('is-valid')
  if (internalValidationState.value === 'invalid') classes.push('is-invalid')
  if (props.disabled) classes.push('disabled')

  return classes.join(' ')
})

const defaultToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ color: [] }, { background: [] }],
  ['link', 'image'],
  ['clean']
]

const getToolbarConfig = () => {
  if (props.toolbar === false) return false
  if (props.toolbar === true || props.toolbar === undefined) return defaultToolbar
  return props.toolbar
}

onMounted(async () => {
  try {
    // Try to import Quill dynamically
    const QuillModule = await import('quill')
    const Quill = QuillModule.default || QuillModule

    // Import Quill CSS
    await import('quill/dist/quill.snow.css')

    if (editorContainer.value) {
      const options: any = {
        theme: props.theme,
        placeholder: props.placeholder,
        readOnly: props.readonly || props.disabled,
        modules: {
          toolbar: getToolbarConfig()
        }
      }

      quillInstance.value = new Quill(editorContainer.value, options)

      // Set initial content
      if (props.modelValue) {
        quillInstance.value.root.innerHTML = props.modelValue
      }

      // Listen for text changes
      quillInstance.value.on('text-change', () => {
        const html = quillInstance.value.root.innerHTML
        const isEmpty = quillInstance.value.getText().trim().length === 0

        emit('update:modelValue', isEmpty ? '' : html)
        emit('change')

        if (props.validateOn === 'change') {
          emit('validate')
        }
      })

      // Listen for blur
      quillInstance.value.root.addEventListener('blur', () => {
        emit('blur')

        if (props.validateOn === 'blur') {
          emit('validate')
        }
      })

      // Listen for focus
      quillInstance.value.root.addEventListener('focus', () => {
        emit('focus')
      })

      isQuillLoaded.value = true
      emit('ready', quillInstance.value)
    }
  } catch (error) {
    console.error('Failed to load Quill editor:', error)
    loadError.value = 'Failed to load WYSIWYG editor. Please install quill: npm install quill'
    isQuillLoaded.value = false
  }
})

onBeforeUnmount(() => {
  if (quillInstance.value) {
    quillInstance.value = null
  }
})

watch(() => props.modelValue, (newValue) => {
  if (quillInstance.value && quillInstance.value.root.innerHTML !== newValue) {
    quillInstance.value.root.innerHTML = newValue || ''
  }
})

watch(() => props.disabled, (newValue) => {
  if (quillInstance.value) {
    quillInstance.value.enable(!newValue)
  }
})

watch(() => props.readonly, (newValue) => {
  if (quillInstance.value) {
    quillInstance.value.enable(!newValue)
  }
})
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div v-if="loadError" class="alert alert-warning" role="alert">
      {{ loadError }}
    </div>

    <div
      v-else
      :class="containerClass"
      :style="{ minHeight: height }"
    >
      <div ref="editorContainer" :id="id"></div>
    </div>

    <div v-if="helpText && !validationMessage" :id="`${id}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <div v-if="internalValidationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="internalValidationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Please provide valid content.' }}
    </div>
  </div>
</template>

<style scoped>
.vibe-wysiwyg-container {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
}

.vibe-wysiwyg-container.is-valid {
  border-color: #198754;
}

.vibe-wysiwyg-container.is-invalid {
  border-color: #dc3545;
}

.vibe-wysiwyg-container.disabled {
  background-color: #e9ecef;
  opacity: 0.6;
  cursor: not-allowed;
}

.vibe-wysiwyg-container :deep(.ql-container) {
  border: none;
  font-size: 1rem;
}

.vibe-wysiwyg-container :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #ced4da;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.vibe-wysiwyg-container :deep(.ql-editor) {
  min-height: 150px;
}
</style>
