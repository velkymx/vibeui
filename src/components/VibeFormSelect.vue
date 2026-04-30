<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType, ComputedRef } from 'vue'
import type { FormSelectOption, FormSelectOptionValue, ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { useId } from '../composables/useId'

// Per-option DOM value is the option's array index ("vi:0", "vi:1", ...).
// The `vi:` prefix prevents collision with the placeholder's empty-string value
// and clearly distinguishes our encoded values from user-supplied strings.
const PLACEHOLDER_VALUE = ''
const VI_PREFIX = 'vi:'

const encodeIndex = (idx: number): string => `${VI_PREFIX}${idx}`

const indexFromEncoded = (encoded: string): number => {
  if (!encoded.startsWith(VI_PREFIX)) return -1
  const n = Number(encoded.slice(VI_PREFIX.length))
  return Number.isInteger(n) && n >= 0 ? n : -1
}

const findIndexForValue = (options: FormSelectOption[], value: FormSelectOptionValue): number => {
  for (let i = 0; i < options.length; i++) {
    if (Object.is(options[i].value, value)) return i
  }
  return -1
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

const decodeOption = (encoded: string): FormSelectOptionValue => {
  const idx = indexFromEncoded(encoded)
  if (idx >= 0 && idx < props.options.length) return props.options[idx].value
  // Placeholder selected (or unknown encoded value) — surface as empty string for back-compat
  return ''
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLSelectElement
  let newValue: unknown
  if (props.multiple) {
    newValue = Array.from(target.selectedOptions).map(option => decodeOption(option.value))
  } else {
    newValue = decodeOption(target.value)
  }
  emit('update:modelValue', newValue)
}

const encodedModelValue = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
      .map((v: FormSelectOptionValue) => {
        const idx = findIndexForValue(props.options, v)
        return idx >= 0 ? encodeIndex(idx) : PLACEHOLDER_VALUE
      })
      .filter(v => v !== PLACEHOLDER_VALUE)
  }
  const idx = findIndexForValue(props.options, props.modelValue as FormSelectOptionValue)
  return idx >= 0 ? encodeIndex(idx) : PLACEHOLDER_VALUE
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
          :key="idx"
          :value="encodeIndex(idx)"
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
