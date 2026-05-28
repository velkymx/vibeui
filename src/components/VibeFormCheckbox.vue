<script setup lang="ts">
import { computed, inject, ref, watch, onMounted } from 'vue'
import type { PropType, ComputedRef } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction } from '../types'
import { useId } from '../composables/useId'

const props = defineProps({
  modelValue: {
    type: [Boolean, Array] as PropType<any>,
    default: false
  },
  value: { type: [String, Number, Boolean], default: true },
  uncheckedValue: { type: [String, Number, Boolean], default: false },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'change' | 'blur'>, default: 'change' },
  helpText: { type: String, default: undefined },
  reverse: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'validate', 'blur', 'focus', 'change'])

const formGroup = inject<{
  id: ComputedRef<string>
  consumeId: () => string | null
  hasLabel: ComputedRef<boolean>
  hasValidation: ComputedRef<boolean>
  hasHelp: ComputedRef<boolean>
} | null>('vibeFormGroup', null)

const _groupId = formGroup?.consumeId()
const _generatedId = useId('checkbox')
const computedId = computed(() => props.id || _groupId || _generatedId)
const helpId = computed(() => `${computedId.value}-help`)
const feedbackId = computed(() => `${computedId.value}-feedback`)
const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

const containerClass = computed(() => {
  const classes = ['form-check']
  if (props.inline) classes.push('form-check-inline')
  if (props.reverse) classes.push('form-check-reverse')
  return classes.join(' ')
})

const inputClass = computed(() => {
  const classes = ['form-check-input']
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  return classes.join(' ')
})

const isChecked = computed(() => {
  if (props.indeterminate) return false
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue === props.value
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let newValue: any
  if (Array.isArray(props.modelValue)) {
    newValue = [...props.modelValue]
    if (target.checked) {
      newValue.push(props.value)
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) newValue.splice(index, 1)
    }
  } else {
    newValue = target.checked ? props.value : props.uncheckedValue
  }
  emit('update:modelValue', newValue)
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

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (inputRef.value) inputRef.value.indeterminate = props.indeterminate
})

watch(() => props.indeterminate, (val) => {
  if (inputRef.value) inputRef.value.indeterminate = val
})
</script>

<template>
  <div :class="[containerClass, { 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }]">
    <input
      ref="inputRef"
      :id="computedId"
      type="checkbox"
      :class="inputClass"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="helpText && validationMessage ? `${helpId} ${feedbackId}` : helpText ? helpId : validationMessage ? feedbackId : undefined"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <label v-if="shouldRenderLabel" :for="computedId" class="form-check-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div v-if="shouldRenderHelp" :id="`${computedId}-help`" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="`${computedId}-feedback`" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="`${computedId}-feedback`" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please check this box.' }}
      </div>
    </template>
  </div>
</template>
