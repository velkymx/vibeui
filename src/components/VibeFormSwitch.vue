<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType, ComputedRef } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'
import { useId } from '../composables/useId'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'change' | 'blur'>, default: 'change' },
  helpText: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change'])

const formGroup = inject<{
  id: ComputedRef<string>
  consumeId: () => string | null
  hasLabel: ComputedRef<boolean>
  hasValidation: ComputedRef<boolean>
  hasHelp: ComputedRef<boolean>
} | null>('vibeFormGroup', null)

const _groupId = formGroup?.consumeId()
const _generatedId = useId('switch')
const computedId = computed(() => props.id || _groupId || _generatedId)
const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

const containerClass = computed(() => {
  const classes = ['form-check', 'form-switch']
  if (props.inline) classes.push('form-check-inline')
  return classes.join(' ')
})

const inputClass = computed(() => {
  const classes = ['form-check-input']
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
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
      :id="computedId"
      type="checkbox"
      role="switch"
      :class="inputClass"
      :checked="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="helpText && validationMessage ? `${computedId}-help ${computedId}-feedback` : helpText ? `${computedId}-help` : validationMessage ? `${computedId}-feedback` : undefined"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <label v-if="shouldRenderLabel" :for="computedId" class="form-check-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div v-if="shouldRenderHelp" :id="`${computedId}-help`" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="`${computedId}-feedback`" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="`${computedId}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please toggle this switch.' }}
      </div>
    </template>
  </div>
</template>
