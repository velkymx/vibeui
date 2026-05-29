<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { FORM_GROUP_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'

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
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: 1 },
  size: { type: String as PropType<Size>, default: undefined },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'input' | 'blur' | 'change'>, default: 'blur' },
  helpText: { type: String, default: undefined },
  wrap: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'increment', value: number): void
  (e: 'decrement', value: number): void
}>()

const formGroup = inject(FORM_GROUP_KEY, null)

const _groupId = formGroup?.consumeId()
const _generatedId = useId('spinbutton')
const computedId = computed(() => props.id || _groupId || _generatedId)
const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

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

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (v) => { internalValue.value = v })

const canDecrement = computed(() => {
  if (props.disabled || props.readonly) return false
  if (props.min === undefined) return true
  if (props.wrap) return true
  return internalValue.value > props.min
})

const canIncrement = computed(() => {
  if (props.disabled || props.readonly) return false
  if (props.max === undefined) return true
  if (props.wrap) return true
  return internalValue.value < props.max
})

const clampValue = (value: number): number => {
  let clamped = value
  if (props.min !== undefined && clamped < props.min) clamped = props.min
  if (props.max !== undefined && clamped > props.max) clamped = props.max
  return clamped
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const raw = target.value === '' ? 0 : Number(target.value)
  internalValue.value = raw
  emit('update:modelValue', raw)
  emit('input', event)
  if (props.validateOn === 'input') emit('validate')
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const raw = target.value === '' ? 0 : Number(target.value)
  const clamped = clampValue(raw)
  internalValue.value = clamped
  if (clamped !== raw) emit('update:modelValue', clamped)
  emit('change', event)
  if (props.validateOn === 'change') emit('validate')
}

const handleBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  const raw = target.value === '' ? 0 : Number(target.value)
  const clamped = clampValue(raw)
  internalValue.value = clamped
  if (clamped !== raw) emit('update:modelValue', clamped)
  emit('blur', event)
  if (props.validateOn === 'blur') emit('validate')
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// step must be a positive finite number. A NaN step would propagate NaN into the
// model (e.g. value + NaN), and a non-positive step makes the buttons inert. Coerce
// invalid values to the default of 1 so arithmetic and precision stay well-defined.
const safeStep = computed(() => {
  if (Number.isFinite(props.step) && props.step > 0) return props.step
  if (import.meta.env.DEV) {
    console.warn(
      `[VibeFormSpinbutton] step must be a positive number; received ${props.step}. Falling back to 1.`
    )
  }
  return 1
})

const stepPrecision = computed(() => {
  const s = String(safeStep.value)
  const dot = s.indexOf('.')
  return dot === -1 ? 0 : s.length - dot - 1
})

const snapToStep = (v: number): number =>
  parseFloat(v.toFixed(stepPrecision.value))

const increment = () => {
  if (!canIncrement.value) return
  let newValue = snapToStep(internalValue.value + safeStep.value)
  if (props.max !== undefined && newValue > props.max) {
    newValue = props.wrap ? props.min ?? 0 : props.max
  }
  internalValue.value = newValue
  emit('update:modelValue', newValue)
  emit('increment', newValue)
  emit('validate')
}

const decrement = () => {
  if (!canDecrement.value) return
  let newValue = snapToStep(internalValue.value - safeStep.value)
  if (props.min !== undefined && newValue < props.min) {
    newValue = props.wrap ? props.max ?? 0 : props.min
  }
  internalValue.value = newValue
  emit('update:modelValue', newValue)
  emit('decrement', newValue)
  emit('validate')
}
</script>

<template>
  <div :class="{ 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }">
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">
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
        :id="computedId"
        type="number"
        :class="inputClass"
        :value="internalValue"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="safeStep"
        :aria-invalid="validationState === 'invalid'"
        :aria-describedby="helpText && validationMessage ? `${computedId}-help ${computedId}-feedback` : helpText ? `${computedId}-help` : validationMessage ? `${computedId}-feedback` : undefined"
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
    <div v-if="shouldRenderHelp" :id="`${computedId}-help`" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="`${computedId}-feedback`" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="`${computedId}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide a valid value.' }}
      </div>
    </template>
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
