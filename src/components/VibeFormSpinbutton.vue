<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
    validator: (value: any) => {
      if (import.meta.env.DEV && value !== null && typeof value === 'object') {
        console.error(
          `[VibeFormSpinbutton] Invalid prop: modelValue must be a number, received object. ` +
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
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: 1 },
  size: { type: String as () => Size, default: undefined },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as () => 'input' | 'blur' | 'change', default: 'blur' },
  helpText: { type: String, default: undefined },
  wrap: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'input', 'change', 'increment', 'decrement'])


const inputClass = computed(() => {
  const classes = ['form-control']

  if (props.size) classes.push(`form-control-${props.size}`)
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')

  return classes.join(' ')
})

const inputGroupClass = computed(() => {
  const classes = ['input-group']
  if (props.size) classes.push(`input-group-${props.size}`)
  if (props.vertical) classes.push('input-group-vertical')
  return classes.join(' ')
})

const canDecrement = computed(() => {
  if (props.disabled || props.readonly) return false
  if (props.min === undefined) return true
  if (props.wrap) return true
  return props.modelValue > props.min
})

const canIncrement = computed(() => {
  if (props.disabled || props.readonly) return false
  if (props.max === undefined) return true
  if (props.wrap) return true
  return props.modelValue < props.max
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let newValue = target.value === '' ? 0 : Number(target.value)

  if (props.min !== undefined && newValue < props.min) {
    newValue = props.min
  }
  if (props.max !== undefined && newValue > props.max) {
    newValue = props.max
  }

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

const increment = () => {
  if (!canIncrement.value) return

  let newValue = props.modelValue + props.step

  if (props.max !== undefined && newValue > props.max) {
    newValue = props.wrap ? props.min ?? 0 : props.max
  }

  emit('update:modelValue', newValue)
  emit('increment', newValue)

  if (props.validateOn === 'change') {
    emit('validate')
  }
}

const decrement = () => {
  if (!canDecrement.value) return

  let newValue = props.modelValue - props.step

  if (props.min !== undefined && newValue < props.min) {
    newValue = props.wrap ? props.max ?? 0 : props.min
  }

  emit('update:modelValue', newValue)
  emit('decrement', newValue)

  if (props.validateOn === 'change') {
    emit('validate')
  }
}
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div :class="inputGroupClass">
      <button
        class="btn btn-outline-secondary"
        type="button"
        :disabled="!canDecrement"
        @click="decrement"
        aria-label="Decrement"
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        :id="id"
        type="number"
        :class="inputClass"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="validationState === 'invalid'"
        :aria-describedby="validationMessage || helpText ? `${id}-feedback` : undefined"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <button
        class="btn btn-outline-secondary"
        type="button"
        :disabled="!canIncrement"
        @click="increment"
        aria-label="Increment"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
    <div v-if="helpText && !validationMessage" :id="`${id}-feedback`" class="form-text">
      {{ helpText }}
    </div>
    <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <div v-if="validationState === 'invalid'" :id="`${id}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Please provide a valid value.' }}
    </div>
  </div>
</template>

<style scoped>
.input-group-vertical {
  flex-direction: column;
}

.input-group-vertical > * {
  width: 100%;
}
</style>
