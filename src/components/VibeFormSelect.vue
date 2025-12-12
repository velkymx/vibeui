<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size, FormSelectOption } from '../types'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  id: { type: String, required: true },
  label: { type: String, default: undefined },
  options: { type: Array as () => FormSelectOption[], default: () => [] },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  size: { type: String as () => Size, default: undefined },
  htmlSize: { type: Number, default: undefined },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as () => ValidationRule[] | ValidatorFunction | undefined, default: undefined },
  validateOn: { type: String as () => 'change' | 'blur', default: 'blur' },
  helpText: { type: String, default: undefined },
  placeholder: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change'])

const internalValidationState = computed(() => props.validationState)

const selectClass = computed(() => {
  const classes = ['form-select']

  if (props.size) classes.push(`form-select-${props.size}`)
  if (internalValidationState.value === 'valid') classes.push('is-valid')
  if (internalValidationState.value === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement

  let newValue: string | number | string[] | number[]

  if (props.multiple) {
    const selected = Array.from(target.selectedOptions).map(option => option.value)
    newValue = selected
  } else {
    newValue = target.value
  }

  emit('update:modelValue', newValue)
  emit('change', event)

  if (props.validateOn === 'change') {
    emit('validate')
  }
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)

  if (props.validateOn === 'blur') {
    emit('validate')
  }
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <select
      :id="id"
      :class="selectClass"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :multiple="multiple"
      :size="htmlSize"
      :aria-invalid="internalValidationState === 'invalid'"
      :aria-describedby="validationMessage || helpText ? `${id}-feedback` : undefined"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <option v-if="placeholder && !multiple" value="" disabled :selected="!modelValue">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.text }}
      </option>
      <slot />
    </select>
    <div v-if="helpText && !validationMessage" :id="`${id}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <div v-if="internalValidationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="internalValidationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Please select a valid option.' }}
    </div>
  </div>
</template>
