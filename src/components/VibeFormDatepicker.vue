<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
    validator: (value: any) => {
      if (import.meta.env.DEV && value !== null && typeof value === 'object') {
        console.error(
          `[VibeFormDatepicker] Invalid prop: modelValue must be a string, received object. ` +
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
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  min: { type: String, default: undefined },
  max: { type: String, default: undefined },
  size: { type: String as () => Size, default: undefined },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as () => 'input' | 'blur' | 'change', default: 'blur' },
  helpText: { type: String, default: undefined },
  type: { type: String as () => 'date' | 'time' | 'datetime-local' | 'month' | 'week', default: 'date' }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'input', 'change'])


const inputClass = computed(() => {
  const classes = ['form-control']

  if (props.size) classes.push(`form-control-${props.size}`)
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
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
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :min="min"
      :max="max"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="validationMessage || helpText ? `${id}-feedback` : undefined"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <div v-if="helpText && !validationMessage" :id="`${id}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="validationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Please provide a valid date.' }}
    </div>
  </div>
</template>
