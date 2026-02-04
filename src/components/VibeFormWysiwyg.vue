<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'

interface QuillInstance {
  root: HTMLElement
  getText: () => string
  getSemanticHTML: () => string
  clipboard: {
    dangerouslyPasteHTML: (html: string, source?: string) => void
  }
  setContents: (delta: unknown, source?: string) => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
  off: (event: string, handler: (...args: unknown[]) => void) => void
  enable: (enabled: boolean) => void
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  id: { type: String, required: true },
  label: { type: String, default: undefined },
  placeholder: { type: String, default: 'Write something...' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  theme: { type: String as PropType<'snow' | 'bubble'>, default: 'snow' },
  toolbar: { type: [Array, String, Boolean] as PropType<unknown[] | string | boolean>, default: undefined },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'change' | 'blur'>, default: 'blur' },
  helpText: { type: String, default: undefined },
  height: { type: String, default: '200px' }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change', 'ready'])

const editorContainer = ref<HTMLElement | null>(null)
const quillInstance = ref<QuillInstance | null>(null)
const isQuillLoaded = ref(false)
const loadError = ref<string | null>(null)
const isUpdatingFromProp = ref(false)

// Store event handlers for cleanup
const blurHandler = ref<(() => void) | null>(null)
const focusHandler = ref<(() => void) | null>(null)
const textChangeHandler = ref<((...args: unknown[]) => void) | null>(null)

const containerClass = computed(() => {
  const classes = ['vibe-wysiwyg-container']

  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
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

/**
 * Safely set content using Quill's clipboard API which sanitizes HTML.
 * This prevents XSS attacks by letting Quill process the content.
 *
 * NOTE: The method name "dangerouslyPasteHTML" is a Quill convention (similar to
 * React's dangerouslySetInnerHTML naming pattern). Despite the name, this is
 * actually SAFER than using innerHTML directly because Quill's clipboard module
 * processes and sanitizes the HTML through its internal Delta conversion,
 * stripping potentially malicious content like <script> tags and event handlers.
 */
const setQuillContent = (html: string) => {
  if (!quillInstance.value) return

  isUpdatingFromProp.value = true
  // Clear existing content first
  quillInstance.value.setContents([], 'silent')
  // Use Quill's clipboard API - sanitizes HTML through Delta conversion
  if (html) {
    quillInstance.value.clipboard.dangerouslyPasteHTML(html, 'silent')
  }
  isUpdatingFromProp.value = false
}

/**
 * Get content using Quill's semantic HTML method for consistent output
 */
const getQuillContent = (): string => {
  if (!quillInstance.value) return ''

  const text = quillInstance.value.getText().trim()
  if (text.length === 0) return ''

  return quillInstance.value.getSemanticHTML()
}

onMounted(async () => {
  try {
    // Try to import Quill dynamically
    const QuillModule = await import('quill')
    const Quill = QuillModule.default || QuillModule

    // Import Quill CSS
    await import('quill/dist/quill.snow.css')

    if (editorContainer.value) {
      const options = {
        theme: props.theme,
        placeholder: props.placeholder,
        readOnly: props.readonly || props.disabled,
        modules: {
          toolbar: getToolbarConfig()
        }
      }

      quillInstance.value = new Quill(editorContainer.value, options) as QuillInstance

      // Set initial content safely using Quill's sanitization
      if (props.modelValue) {
        setQuillContent(props.modelValue)
      }

      // Create and store text-change handler
      textChangeHandler.value = () => {
        // Skip if we're updating from prop to avoid loops
        if (isUpdatingFromProp.value) return

        const html = getQuillContent()
        emit('update:modelValue', html)
        emit('change')

        if (props.validateOn === 'change') {
          emit('validate')
        }
      }
      quillInstance.value.on('text-change', textChangeHandler.value)

      // Create and store blur handler
      blurHandler.value = () => {
        emit('blur')
        if (props.validateOn === 'blur') {
          emit('validate')
        }
      }
      quillInstance.value.root.addEventListener('blur', blurHandler.value)

      // Create and store focus handler
      focusHandler.value = () => {
        emit('focus')
      }
      quillInstance.value.root.addEventListener('focus', focusHandler.value)

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
    // Remove text-change handler
    if (textChangeHandler.value) {
      quillInstance.value.off('text-change', textChangeHandler.value)
      textChangeHandler.value = null
    }

    // Remove DOM event listeners
    if (blurHandler.value) {
      quillInstance.value.root.removeEventListener('blur', blurHandler.value)
      blurHandler.value = null
    }
    if (focusHandler.value) {
      quillInstance.value.root.removeEventListener('focus', focusHandler.value)
      focusHandler.value = null
    }

    quillInstance.value = null
  }
})

watch(() => props.modelValue, (newValue) => {
  if (!quillInstance.value) return

  // Compare with current Quill content to avoid unnecessary updates
  const currentContent = getQuillContent()
  if (currentContent !== (newValue || '')) {
    setQuillContent(newValue || '')
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
    <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="validationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
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
