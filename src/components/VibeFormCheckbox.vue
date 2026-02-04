<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false,
    validator: (value: any) => {
      if (import.meta.env.DEV && value !== null && typeof value === 'object' && !Array.isArray(value)) {
        console.error(
          `[VibeFormCheckbox] Invalid prop: modelValue must be a boolean or array, received object. ` +
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
  value: { type: [String, Number, Boolean], default: true },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as () => 'change' | 'blur', default: 'blur' },
  helpText: { type: String, default: undefined },
  indeterminate: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change'])


const checkboxClass = computed(() => {
  const classes = ['form-check-input']

  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const formCheckClass = computed(() => {
  const classes = ['form-check']
  if (props.inline) classes.push('form-check-inline')
  return classes.join(' ')
})

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue === props.value || props.modelValue === true
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  let newValue: boolean | any[]

  if (Array.isArray(props.modelValue)) {
    newValue = [...props.modelValue]
    if (target.checked) {
      if (!newValue.includes(props.value)) {
        newValue.push(props.value)
      }
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
  } else {
    newValue = target.checked
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
  <div :class="formCheckClass">
    <input
      :id="id"
      type="checkbox"
      :class="checkboxClass"
      :checked="isChecked"
      :value="value"
      :disabled="disabled"
      :required="required"
      :indeterminate="indeterminate"
      :aria-invalid="validationState === 'invalid'"
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
    <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="validationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'You must check this box.' }}
    </div>
  </div>
</template>
