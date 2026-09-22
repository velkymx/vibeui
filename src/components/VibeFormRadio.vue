<script setup lang="ts">
import VibeFieldFeedback from './VibeFieldFeedback.vue'
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'
import { useFormField } from '../composables/useFormField'

// v-model via defineModel (Vue 3.4+): replaces the modelValue prop + update:modelValue emit.
const modelValue = defineModel<string | number | boolean>({ default: '' })

const props = defineProps({
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, required: true },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'change' | 'blur'>, default: 'change' },
  helpText: { type: String, default: undefined },
  reverse: { type: Boolean, default: false }
})

// Consumer attributes (aria-label, name, data-*, class) belong on the native
// control, not the wrapper <div>. Mirrors VibeFormInput/VibeFormSelect.
defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', event: Event): void
}>()


const {
  formGroup,
  computedId,
  helpId,
  feedbackId,
  ariaDescribedBy,
  shouldRenderLabel,
  shouldRenderFeedback,
  shouldRenderHelp
} = useFormField('radio', props)

const containerClass = computed(() => {
  const classes = ['form-check']
  if (props.inline) classes.push('form-check-inline')
  if (props.reverse) classes.push('form-check-reverse')
  return classes.join(' ')
})

const inputClass = computed(() => {
  const classes = ['form-check-input']
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  return classes.join(' ')
})

const isChecked = computed(() => modelValue.value === props.value)

const handleChange = (event: Event) => {
  modelValue.value = props.value
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
  <div :class="[containerClass, { 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }]">
    <input
      v-bind="$attrs"
      :id="computedId"
      type="radio"
      :class="inputClass"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="ariaDescribedBy"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <label v-if="shouldRenderLabel" :for="computedId" class="form-check-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <VibeFieldFeedback
      :help-id="helpId"
      :feedback-id="feedbackId"
      :help-text="helpText"
      :validation-state="validationState"
      :validation-message="validationMessage"
      invalid-message="Please select an option."
      :show-help="shouldRenderHelp"
      :show-feedback="shouldRenderFeedback"
    />
  </div>
</template>
