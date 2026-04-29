<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType, ComputedRef } from 'vue'
import type { FormSelectOption, FormSelectOptionValue, ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { useId } from '../composables/useId'

const NULL_SENTINEL = '\0__vibe_null__\0'
const UNDEF_SENTINEL = '\0__vibe_undef__\0'
const BOOL_TRUE_SENTINEL = '\0__vibe_true__\0'
const BOOL_FALSE_SENTINEL = '\0__vibe_false__\0'

const encodeValue = (v: FormSelectOptionValue): string => {
  if (v === null) return NULL_SENTINEL
  if (v === undefined) return UNDEF_SENTINEL
  if (v === true) return BOOL_TRUE_SENTINEL
  if (v === false) return BOOL_FALSE_SENTINEL
  return String(v)
}

const decodeValue = (encoded: string, options: FormSelectOption[]): FormSelectOptionValue => {
  if (encoded === NULL_SENTINEL) return null
  if (encoded === UNDEF_SENTINEL) return undefined
  if (encoded === BOOL_TRUE_SENTINEL) return true
  if (encoded === BOOL_FALSE_SENTINEL) return false
  const match = options.find(opt => encodeValue(opt.value) === encoded)
  return match ? match.value : encoded
}

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
  let newValue: unknown
  if (props.multiple) {
    newValue = Array.from(target.selectedOptions).map(option => decodeValue(option.value, props.options))
  } else {
    newValue = decodeValue(target.value, props.options)
  }
  emit('update:modelValue', newValue)
}

const encodedModelValue = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.map((v: FormSelectOptionValue) => encodeValue(v))
  }
  return encodeValue(props.modelValue as FormSelectOptionValue)
})

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
      :value="encodedModelValue"
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
        <option
          v-for="(option, idx) in options"
          :key="`${idx}-${encodeValue(option.value)}`"
          :value="encodeValue(option.value)"
          :disabled="option.disabled"
        >
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
