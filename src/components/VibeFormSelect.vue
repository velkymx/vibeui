<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType, ComputedRef } from 'vue'
import type { FormSelectOption, ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { useId } from '../composables/useId'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array] as PropType<any>,
    default: ''
  },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  options: { type: Array as PropType<FormSelectOption[]>, default: () => [] },
  multiple: { type: Boolean, default: false },
  selectSize: { type: Number, default: undefined },
  htmlSize: { type: Number, default: undefined },
  placeholder: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: undefined },
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

const computedId = computed(() => props.id || formGroup?.consumeId() || useId('select'))
const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

const selectClass = computed(() => {
  const classes = ['form-select']
  if (props.size) classes.push(`form-select-${props.size}`)
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLSelectElement
  let newValue: any
  if (props.multiple) {
    newValue = Array.from(target.selectedOptions).map(option => option.value)
  } else {
    newValue = target.value
  }
  emit('update:modelValue', newValue)
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
    <select
      :id="computedId"
      :class="selectClass"
      :value="modelValue"
      :multiple="multiple"
      :size="htmlSize || selectSize"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="validationMessage || helpText ? `${computedId}-feedback` : undefined"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <slot>
        <option v-for="option in options" :key="String(option.value)" :value="option.value" :disabled="option.disabled">
          {{ option.text }}
        </option>
      </slot>
    </select>
    <div v-if="shouldRenderHelp" :id="`${computedId}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="`${computedId}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please select an option.' }}
      </div>
    </template>
  </div>
</template>
