<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    validator: (value: any) => {
      if (import.meta.env.DEV && value !== null && typeof value === 'object') {
        console.error(
          `[VibeFormSwitch] Invalid prop: modelValue must be a boolean, received object. ` +
          `If you're using useFormValidation(), bind to the .value property: ` +
          `v-model="field.value" instead of v-model="field"`
        )
        return false
      }
      return true
    }
  },
  id: { type: String, required: true },
  label: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as () => ValidationRule[] | ValidatorFunction | undefined, default: undefined },
  validateOn: { type: String as () => 'change' | 'blur', default: 'blur' },
  helpText: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change'])

const internalValidationState = computed(() => props.validationState)

const switchClass = computed(() => {
  const classes = ['form-check-input']

  if (internalValidationState.value === 'valid') classes.push('is-valid')
  if (internalValidationState.value === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
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
  <div class="form-check form-switch">
    <input
      :id="id"
      type="checkbox"
      :class="switchClass"
      :checked="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="internalValidationState === 'invalid'"
      :aria-describedby="validationMessage || helpText ? `${id}-feedback` : undefined"
      role="switch"
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
      {{ validationMessage || 'You must toggle this switch.' }}
    </div>
  </div>
</template>
