<script setup lang="ts">
import { shallowRef, ref, onMounted, onBeforeUnmount, watch, computed, inject, nextTick } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, ComponentError } from '../types'
import { FORM_GROUP_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'
import { useBreakpoints } from '../composables/useBreakpoints'
import Quill from 'quill'
import { loadDOMPurify, sanitizeHtml } from '../utils/sanitizeHtml'
import { safeLength } from '../utils/safeCss'

interface QuillInstance {
  root: HTMLElement
  getText: () => string
  getSemanticHTML: () => string
  clipboard: {
    dangerouslyPasteHTML: (html: string, source?: string) => void
    convert: (input: { html?: string; text?: string }) => unknown
  }
  setContents: (delta: unknown, source?: string) => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
  off: (event: string, handler: (...args: unknown[]) => void) => void
  enable: (enabled: boolean) => void
  // Optional: present in some Quill builds; call sites guard with typeof === 'function'.
  destroy?: () => void
  selection: unknown
  // Quill's scroll blot owns the parchment MutationObserver. We disconnect it during
  // teardown so it cannot fire against DOM Vue is about to remove.
  scroll?: { observer?: { disconnect: () => void } }
}

const _generatedId = useId('wysiwyg')

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  id: { type: String, default: undefined },
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

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'validate'): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'change'): void
  (e: 'ready', instance: unknown): void
  (e: 'component-error', error: ComponentError): void
}>()

const formGroup = inject(FORM_GROUP_KEY, null)
const _groupId = formGroup?.consumeId()

const computedId = computed(() => props.id || _groupId || _generatedId)
const safeMinHeight = computed(() => safeLength(props.height) ?? '200px')
const { isMobile } = useBreakpoints()

const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

const editorContainer = ref<HTMLElement | null>(null)
const quillInstance = shallowRef<QuillInstance | null>(null)
const isQuillLoaded = ref(false)
const loadError = ref<string | null>(null)
const isUpdatingFromProp = ref(false)
let initInFlight = false

// Set first in onBeforeUnmount — guards the post-await section of initQuill against
// constructing a Quill instance on a detached container during a mount/unmount race.
let isUnmounted = false

// Debounce handle for the breakpoint-driven Quill rebuild. Rebuilding Quill is
// expensive; resizing across the mobile breakpoint can fire isMobile repeatedly,
// so we coalesce bursts into a single rebuild.
let mobileReinitTimer: ReturnType<typeof setTimeout> | null = null

// Plain let, not ref: these handlers are imperative references used only in lifecycle
// hooks (attach/detach), never read in the template or a reactive context — reactivity
// would add tracking overhead for no benefit.
let blurHandler: (() => void) | null = null
let focusHandler: (() => void) | null = null
let textChangeHandler: ((...args: unknown[]) => void) | null = null
let selectionChangeHandler: ((...args: unknown[]) => void) | null = null

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
  // Sanitize before passing to Quill's clipboard converter (XSS defense-in-depth).
  // Quill 2.x: setContents([]) followed by dangerouslyPasteHTML triggers a
  // selection update against the (now-empty) document, which crashes inside
  // selection.normalizedToRange when the input format includes a wrapping
  // <p>. Convert the HTML to a Delta and atomically replace via setContents
  // — this is the supported path and emits a single text-change.
  const clean = sanitizeHtml(html || '')
  const delta = quillInstance.value.clipboard.convert({ html: clean })
  quillInstance.value.setContents(delta, 'silent')
  isUpdatingFromProp.value = false
}

const getQuillContent = (): string => {
  if (!quillInstance.value) return ''
  const text = quillInstance.value.getText().trim()
  if (text.length === 0) return ''
  // Sanitize the output from Quill before emitting — defense-in-depth against any
  // XSS that survives Quill's own Delta allowlist conversion.
  return sanitizeHtml(quillInstance.value.getSemanticHTML())
}

const updateAriaAttributes = () => {
  const root = quillInstance.value?.root
  if (!root) return
  root.setAttribute('aria-invalid', String(props.validationState === 'invalid'))
  const helpAttr = props.helpText ? `${computedId.value}-help` : null
  const feedbackAttr = props.validationMessage ? `${computedId.value}-feedback` : null
  const describedBy = [helpAttr, feedbackAttr].filter(Boolean).join(' ')
  if (describedBy) {
    root.setAttribute('aria-describedby', describedBy)
  } else {
    root.removeAttribute('aria-describedby')
  }
}

const initQuill = async () => {
  if (initInFlight) return
  initInFlight = true
  // Start loading the sanitizer immediately, in parallel with Quill and independent of
  // its resolution — the sanitizer must be ready before any modelValue HTML is set, and
  // kicking it off here (not after the Quill import) keeps that guarantee deterministic.
  const purifyReady = loadDOMPurify()
  try {
    const QuillModule = await import('quill')
    const Quill = QuillModule.default || QuillModule
    await Promise.all([
      import('quill/dist/quill.snow.css'),
      purifyReady
    ])

    // Guard: component may have unmounted while the imports were in-flight.
    if (!editorContainer.value || isUnmounted) return

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

      const root = quillInstance.value.root
      root.id = computedId.value || ''
      editorContainer.value.removeAttribute('id')
      root.setAttribute('role', 'textbox')
      root.setAttribute('aria-multiline', 'true')
      updateAriaAttributes()

      if (props.modelValue) {
        setQuillContent(props.modelValue)
      }

      textChangeHandler = () => {
        if (isUpdatingFromProp.value) return
        const html = getQuillContent()
        emit('update:modelValue', html)
        emit('change')
        if (props.validateOn === 'change') {
          emit('validate')
        }
      }
      quillInstance.value.on('text-change', textChangeHandler)

      blurHandler = () => {
        emit('blur')
        if (props.validateOn === 'blur') {
          emit('validate')
        }
      }
      quillInstance.value.root.addEventListener('blur', blurHandler)

      focusHandler = () => {
        emit('focus')
      }
      quillInstance.value.root.addEventListener('focus', focusHandler)

      selectionChangeHandler = () => {}
      quillInstance.value.on('selection-change', selectionChangeHandler)

      isQuillLoaded.value = true
      emit('ready', quillInstance.value)
    }
  } catch (error) {
    console.error('Failed to load Quill editor:', error)
    loadError.value = 'Failed to load WYSIWYG editor. Please install quill: npm install quill'
    isQuillLoaded.value = false
    emit('component-error', {
      message: 'Quill not loaded. Install quill: npm install quill',
      componentName: 'VibeFormWysiwyg',
      originalError: error
    })
  } finally {
    initInFlight = false
  }
}

onMounted(initQuill)

onBeforeUnmount(() => {
   isUnmounted = true

   // Cancel any pending debounced breakpoint rebuild so it can't fire post-unmount.
   if (mobileReinitTimer !== null) {
     clearTimeout(mobileReinitTimer)
     mobileReinitTimer = null
   }

   if (quillInstance.value) {
     // Disconnect Quill's scroll MutationObserver BEFORE any teardown. Vue removes the
     // editor DOM right after this hook; a still-connected observer would fire and read
     // selection.lastRange after we null `selection` below, throwing during unmount.
     quillInstance.value.scroll?.observer?.disconnect()

     // Disable the editor first to prevent selection updates on detached DOM
     quillInstance.value.enable(false)

     if (textChangeHandler) {
       quillInstance.value.off('text-change', textChangeHandler)
       textChangeHandler = null
     }
     if (selectionChangeHandler) {
       quillInstance.value.off('selection-change', selectionChangeHandler)
       selectionChangeHandler = null
     }
     if (blurHandler) {
       quillInstance.value.root.removeEventListener('blur', blurHandler)
       blurHandler = null
     }
     if (focusHandler) {
       quillInstance.value.root.removeEventListener('focus', focusHandler)
       focusHandler = null
     }
     // Null out the selection module to prevent Quill from accessing removed DOM
     quillInstance.value.selection = null
     // Destroy Quill instance to properly clean up all references
     if (typeof quillInstance.value.destroy === 'function') {
       quillInstance.value.destroy()
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

watch([() => props.validationState, () => props.helpText, () => props.validationMessage], updateAriaAttributes)

// Watch for breakpoint changes and re-initialize Quill if the toolbar needs to change.
// Debounced: a viewport resize can cross the breakpoint repeatedly, and each rebuild is
// expensive — coalesce a burst of changes into a single rebuild on the trailing edge.
watch(isMobile, () => {
  if (!quillInstance.value) return
  if (mobileReinitTimer !== null) clearTimeout(mobileReinitTimer)
  mobileReinitTimer = setTimeout(async () => {
    mobileReinitTimer = null
    // Re-check: the component may have unmounted, or Quill may have been torn down,
    // during the debounce window.
    if (isUnmounted || !quillInstance.value) return
    const content = getQuillContent()

    // Disconnect Quill's scroll MutationObserver before tearing down — clearing the
    // editor DOM below would otherwise fire it against removed nodes and read
    // selection.lastRange after we null `selection`, throwing.
    quillInstance.value.scroll?.observer?.disconnect()

    // Disable the editor first to prevent selection updates on detached DOM
    quillInstance.value.enable(false)

    // Cleanup all event listeners before touching the DOM
    if (textChangeHandler) {
      quillInstance.value.off('text-change', textChangeHandler)
      textChangeHandler = null
    }
    if (selectionChangeHandler) {
      quillInstance.value.off('selection-change', selectionChangeHandler)
      selectionChangeHandler = null
    }
    if (blurHandler) {
      quillInstance.value.root.removeEventListener('blur', blurHandler)
      blurHandler = null
    }
    if (focusHandler) {
      quillInstance.value.root.removeEventListener('focus', focusHandler)
      focusHandler = null
    }

    // Null out the selection module to prevent Quill from accessing removed DOM
    quillInstance.value.selection = null
    // Destroy Quill instance to properly clean up all references
    if (quillInstance.value && typeof quillInstance.value.destroy === 'function') {
      quillInstance.value.destroy()
    }
    // Null instance BEFORE clearing innerHTML — prevents Quill's internal observers
    // from firing against removed DOM nodes between innerHTML='' and quillInstance=null.
    quillInstance.value = null
    isQuillLoaded.value = false

    const toolbar = editorContainer.value?.parentElement?.querySelector('.ql-toolbar')
    if (toolbar) toolbar.remove()

    // innerHTML cleared after nulling instance — safe, no live Quill observers remain
    if (editorContainer.value) editorContainer.value.innerHTML = ''

    await nextTick()
    await initQuill()
    if (content) setQuillContent(content)
  }, 250)
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
      :style="{ minHeight: safeMinHeight }"
    >
      <div ref="editorContainer"></div>
    </div>

    <div v-if="shouldRenderHelp" :id="`${computedId}-help`" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="`${computedId}-feedback`" class="valid-feedback" :style="{ display: 'block' }">
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
