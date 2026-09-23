<script setup lang="ts">
import VibeFieldFeedback from './VibeFieldFeedback.vue'
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { useFormField } from '../composables/useFormField'

// v-model via defineModel (Vue 3.4+): replaces the modelValue prop + update:modelValue emit.
const modelValue = defineModel<string>({ default: '' })

// Consumer HTML attributes (name, wrap, …) belong on the native <textarea>, not the
// wrapper <div> — native form submission needs `name` on the control. Auto-inheritance
// is disabled and $attrs is bound explicitly (first, so prop-driven bindings win).
defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  rows: { type: [Number, String], default: 3 },
  maxlength: { type: [Number, String], default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: undefined },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'input' | 'blur' | 'change'>, default: 'blur' },
  helpText: { type: String, default: undefined },
  noResize: { type: Boolean, default: false },
  showCharCount: { type: Boolean, default: false },
  // Render only the bare <textarea> (no wrapper <div>, label, char count or
  // feedback), so it can be a direct flex child (e.g. an auto-grow composer).
  noWrapper: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}>()


const {
  computedId,
  helpId,
  feedbackId,
  ariaDescribedBy,
  shouldRenderLabel,
  shouldRenderFeedback,
  shouldRenderHelp
} = useFormField('textarea', props, { extraHelp: () => props.showCharCount })

const textareaClass = computed(() => {
  const classes = ['form-control']
  if (props.size) classes.push(`form-control-${props.size}`)
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  return classes.join(' ')
})

const textareaStyle = computed(() => {
  if (props.noResize) return { resize: 'none' as const }
  return undefined
})

const currentCount = computed(() => modelValue.value?.length || 0)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  modelValue.value = target.value
  emit('input', event)
  if (props.validateOn === 'input') emit('validate')
}

const handleChange = (event: Event) => {
  emit('change', event)
  if (props.validateOn === 'change') emit('validate')
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
  if (props.validateOn === 'blur') emit('validate')
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<template>
  <div v-if="!noWrapper" :class="{ 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }">
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
      v-bind="$attrs"
      :id="computedId"
      :class="textareaClass"
      :style="textareaStyle"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    ></textarea>
    <div v-if="shouldRenderHelp" :id="helpId" class="form-text d-flex justify-content-between">
      <span>{{ helpText }}</span>
      <span v-if="showCharCount" class="ms-auto">
        <template v-if="maxlength">{{ currentCount }} / {{ maxlength }}</template>
        <template v-else>{{ currentCount }}</template>
      </span>
    </div>
    <VibeFieldFeedback
      :help-id="helpId"
      :feedback-id="feedbackId"
      :help-text="helpText"
      :validation-state="validationState"
      :validation-message="validationMessage"
      invalid-message="Please provide a valid value."
      :show-help="false"
      :show-feedback="shouldRenderFeedback"
    />
  </div>

  <textarea
    v-else
    v-bind="$attrs"
    :id="computedId"
    :class="textareaClass"
    :style="textareaStyle"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :maxlength="maxlength"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :aria-invalid="validationState === 'invalid'"
    :aria-describedby="ariaDescribedBy"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  ></textarea>
</template>
