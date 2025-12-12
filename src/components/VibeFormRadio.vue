<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: undefined },
  id: { type: String, required: true },
  label: { type: String, default: undefined },
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as () => ValidationRule[] | ValidatorFunction | undefined, default: undefined },
  validateOn: { type: String as () => 'change' | 'blur', default: 'blur' },
  helpText: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change'])

const internalValidationState = computed(() => props.validationState)

const radioClass = computed(() => {
  const classes = ['form-check-input']

  if (internalValidationState.value === 'valid') classes.push('is-valid')
  if (internalValidationState.value === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const formCheckClass = computed(() => {
  const classes = ['form-check']
  if (props.inline) classes.push('form-check-inline')
  return classes.join(' ')
})

const isChecked = computed(() => {
  return props.modelValue === props.value
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target.checked) {
    emit('update:modelValue', props.value)
  }

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
  <div :class="formCheckClass">
    <input
      :id="id"
      type="radio"
      :class="radioClass"
      :checked="isChecked"
      :value="value"
      :name="name"
      :disabled="disabled"
      :required="required"
      :aria-invalid="internalValidationState === 'invalid'"
      :aria-describedby="validationMessage || helpText ? `${id}-feedback` : undefined"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <label v-if="label" :for="id" class="form-check-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div v-if="helpText && !validationMessage" :id="`${id}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <div v-if="internalValidationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="internalValidationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Please select an option.' }}
    </div>
  </div>
</template>
