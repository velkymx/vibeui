<script setup lang="ts">
import { computed, watch } from 'vue'
import type { InputType, ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
    validator: (value: any) => {
      // Only validate in development mode
      if (import.meta.env.DEV && value !== null && typeof value === 'object') {
        console.error(
          `[VibeFormInput] Invalid prop: modelValue must be a string or number, received object. ` +
          `If you're using useFormValidation(), bind to the .value property: ` +
          `v-model="field.value" instead of v-model="field"`
        )
        return false
      }
      return true
    }
  },
  type: { type: String as () => InputType, default: 'text' },
  id: { type: String, required: true },
  label: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  size: { type: String as () => Size, default: undefined },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as () => ValidationRule[] | ValidatorFunction | undefined, default: undefined },
  validateOn: { type: String as () => 'input' | 'blur' | 'change', default: 'blur' },
  helpText: { type: String, default: undefined },
  plaintext: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'input', 'change'])

const internalValidationState = computed(() => props.validationState)

const inputClass = computed(() => {
  const classes: string[] = []

  if (props.plaintext) {
    classes.push('form-control-plaintext')
  } else {
    classes.push('form-control')
    if (props.size) classes.push(`form-control-${props.size}`)
  }

  if (internalValidationState.value === 'valid') classes.push('is-valid')
  if (internalValidationState.value === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = props.type === 'number' ? (target.value === '' ? '' : Number(target.value)) : target.value
  emit('update:modelValue', newValue)
  emit('input', event)

  if (props.validateOn === 'input') {
    emit('validate')
  }
}

const handleChange = (event: Event) => {
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
    <input
      :id="id"
      :type="type"
      :class="inputClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || plaintext"
      :required="required"
      :aria-invalid="internalValidationState === 'invalid'"
      :aria-describedby="validationMessage || helpText ? `${id}-feedback` : undefined"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <div v-if="helpText && !validationMessage" :id="`${id}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <div v-if="internalValidationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="internalValidationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Please provide a valid value.' }}
    </div>
  </div>
</template>
