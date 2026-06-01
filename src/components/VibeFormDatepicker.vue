<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { FORM_GROUP_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'

// v-model via defineModel (Vue 3.4+): replaces the modelValue prop + update:modelValue emit.
// The validator option still forwards to the underlying prop.
const modelValue = defineModel<string>({
  default: '',
  validator: (value: unknown) => {
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
})

const props = defineProps({
  id: { type: String, default: undefined },
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

const emit = defineEmits<{
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}>()

const formGroup = inject(FORM_GROUP_KEY, null)

const _groupId = formGroup?.consumeId()
const _generatedId = useId('datepicker')
const computedId = computed(() => props.id || _groupId || _generatedId)
const helpId = computed(() => `${computedId.value}-help`)
const feedbackId = computed(() => `${computedId.value}-feedback`)
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

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  modelValue.value = target.value
  emit('input', event)
  if (props.validateOn === 'input') emit('validate')
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
    <input
      :id="computedId"
      :type="type"
      :class="inputClass"
      :value="modelValue"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :min="min"
      :max="max"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="helpText && validationMessage ? `${helpId} ${feedbackId}` : helpText ? helpId : validationMessage ? feedbackId : undefined"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <div v-if="shouldRenderHelp" :id="helpId" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="feedbackId" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide a valid date.' }}
      </div>
    </template>
  </div>
</template>
