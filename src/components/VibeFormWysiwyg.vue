<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, inject, nextTick } from 'vue'
import type { PropType, ComputedRef } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'
import { useId } from '../composables/useId'
import { useBreakpoints } from '../composables/useBreakpoints'

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
  id: { type: String, default: () => useId('wysiwyg') },
  label: { type: String, default: undefined },
  placeholder: { type: String, default: 'Write something...' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  theme: { type: String as PropType<'snow' | 'bubble'>, default: 'snow' },
  toolbar: { type: [Array, String, Boolean] as PropType<unknown[] | string | boolean>, default: undefined },
  mobileToolbar: { type: [Array, String, Boolean] as PropType<unknown[] | string | boolean>, default: undefined },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'change' | 'blur'>, default: 'blur' },
  helpText: { type: String, default: undefined },
  height: { type: String, default: '200px' }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change', 'ready'])

const formGroup = inject<{
  id: ComputedRef<string>
  hasLabel: ComputedRef<boolean>
  hasValidation: ComputedRef<boolean>
  hasHelp: ComputedRef<boolean>
} | null>('vibeFormGroup', null)

const computedId = computed(() => props.id || formGroup?.id.value || useId('wysiwyg'))
const { isMobile } = useBreakpoints()

const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

const editorContainer = ref<HTMLElement | null>(null)
const quillInstance = ref<QuillInstance | null>(null)
const isQuillLoaded = ref(false)
const loadError = ref<string | null>(null)
const isUpdatingFromProp = ref(false)

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

const defaultMobileToolbar = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'clean']
]

const toolbarPresets: Record<string, unknown[]> = {
  minimal: [
    ['bold', 'italic', 'underline'],
    ['link', 'clean']
  ],
  standard: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean']
  ],
  full: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

const resolveToolbar = (value: unknown[] | string | boolean | undefined, fallback: unknown[]) => {
  if (value === false) return false
  if (value === true || value === undefined) return fallback
  if (typeof value === 'string') {
    return toolbarPresets[value] ?? fallback
  }
  return value
}

const getToolbarConfig = () => {
  if (props.toolbar === false) return false

  if (isMobile.value) {
    if (props.mobileToolbar === false) return false
    if (props.mobileToolbar !== undefined) {
      return resolveToolbar(props.mobileToolbar, defaultMobileToolbar)
    }
    return defaultMobileToolbar
  }

  return resolveToolbar(props.toolbar, defaultToolbar)
}

const setQuillContent = (html: string) => {
  if (!quillInstance.value) return
  isUpdatingFromProp.value = true
  quillInstance.value.setContents([], 'silent')
  if (html) {
    quillInstance.value.clipboard.dangerouslyPasteHTML(html, 'silent')
  }
  isUpdatingFromProp.value = false
}

const getQuillContent = (): string => {
  if (!quillInstance.value) return ''
  const text = quillInstance.value.getText().trim()
  if (text.length === 0) return ''
  return quillInstance.value.getSemanticHTML()
}

const initQuill = async () => {
  try {
    const QuillModule = await import('quill')
    const Quill = QuillModule.default || QuillModule
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

      if (props.modelValue) {
        setQuillContent(props.modelValue)
      }

      textChangeHandler.value = () => {
        if (isUpdatingFromProp.value) return
        const html = getQuillContent()
        emit('update:modelValue', html)
        emit('change')
        if (props.validateOn === 'change') {
          emit('validate')
        }
      }
      quillInstance.value.on('text-change', textChangeHandler.value)

      blurHandler.value = () => {
        emit('blur')
        if (props.validateOn === 'blur') {
          emit('validate')
        }
      }
      quillInstance.value.root.addEventListener('blur', blurHandler.value)

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
}

onMounted(initQuill)

onBeforeUnmount(() => {
  if (quillInstance.value) {
    if (textChangeHandler.value) {
      quillInstance.value.off('text-change', textChangeHandler.value)
      textChangeHandler.value = null
    }
    if (blurHandler.value) {
      quillInstance.value.root.removeEventListener('blur', blurHandler.value)
      blurHandler.value = null
    }
    if (focusHandler.value) {
      quillInstance.value.root.removeEventListener('focus', focusHandler.value)
      focusHandler.value = null
    }
    if (editorContainer.value) {
      const toolbar = editorContainer.value.parentElement?.querySelector('.ql-toolbar')
      if (toolbar) {
        toolbar.remove()
      }
    }
    quillInstance.value = null
  }
})

watch(() => props.modelValue, (newValue) => {
  if (!quillInstance.value) return
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

// Watch for breakpoint changes and re-initialize Quill if toolbar needs to change
watch(isMobile, async () => {
  if (quillInstance.value) {
    const content = getQuillContent()
    
    // Cleanup current instance
    if (textChangeHandler.value) {
      quillInstance.value.off('text-change', textChangeHandler.value)
    }
    if (blurHandler.value) {
      quillInstance.value.root.removeEventListener('blur', blurHandler.value)
    }
    if (focusHandler.value) {
      quillInstance.value.root.removeEventListener('focus', focusHandler.value)
    }
    const toolbar = editorContainer.value?.parentElement?.querySelector('.ql-toolbar')
    if (toolbar) toolbar.remove()
    
    if (editorContainer.value) editorContainer.value.innerHTML = ''
    
    await nextTick()
    await initQuill()
    if (content) setQuillContent(content)
  }
})
</script>

<template>
  <div :class="{ 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }">
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">
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
      <div ref="editorContainer" :id="computedId"></div>
    </div>

    <div v-if="shouldRenderHelp" :id="`${computedId}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="`${computedId}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide valid content.' }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.vibe-wysiwyg-container {
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
}
.vibe-wysiwyg-container.is-valid {
  border-color: var(--bs-success);
}
.vibe-wysiwyg-container.is-invalid {
  border-color: var(--bs-danger);
}
.vibe-wysiwyg-container.disabled {
  background-color: var(--bs-secondary-bg);
  opacity: 0.6;
  cursor: not-allowed;
}
.vibe-wysiwyg-container :deep(.ql-container) {
  border: none;
  font-size: 1rem;
}
.vibe-wysiwyg-container :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid var(--bs-border-color);
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}
.vibe-wysiwyg-container :deep(.ql-editor) {
  min-height: 150px;
}
</style>
