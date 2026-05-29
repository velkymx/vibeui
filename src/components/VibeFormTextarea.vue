<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { FORM_GROUP_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
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
  showCharCount: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'input', 'change'])

const formGroup = inject(FORM_GROUP_KEY, null)

const _groupId = formGroup?.consumeId()
const _generatedId = useId('textarea')
const computedId = computed(() => props.id || _groupId || _generatedId)
const helpId = computed(() => `${computedId.value}-help`)
const feedbackId = computed(() => `${computedId.value}-feedback`)
const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => (!!props.helpText || props.showCharCount) && !formGroup?.hasHelp.value)

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

const currentCount = computed(() => props.modelValue?.length || 0)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
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
  <div :class="{ 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }">
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
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
      :aria-describedby="(helpText || showCharCount) && validationMessage ? `${helpId} ${feedbackId}` : (helpText || showCharCount) ? helpId : validationMessage ? feedbackId : undefined"
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
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="feedbackId" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide a valid value.' }}
      </div>
    </template>
  </div>
</template>
