<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import type { InputType, ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { FORM_GROUP_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'

// v-model via defineModel (Vue 3.4+): replaces the modelValue prop + update:modelValue emit.
const modelValue = defineModel<string | number>({ default: '' })

const props = defineProps({
  type: { type: String as PropType<InputType>, default: 'text' },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: undefined },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  validationRules: { type: [Array, Function] as PropType<ValidationRule[] | ValidatorFunction>, default: undefined },
  validateOn: { type: String as PropType<'input' | 'blur' | 'change'>, default: 'blur' },
  helpText: { type: String, default: undefined },
  plaintext: { type: Boolean, default: false },
  noWrapper: { type: Boolean, default: false },
  focusRing: { type: Boolean, default: false }
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
const _generatedId = useId('input')
const computedId = computed(() => props.id || _groupId || _generatedId)
const helpId = computed(() => `${computedId.value}-help`)
const feedbackId = computed(() => `${computedId.value}-feedback`)

const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
const shouldRenderHelp = computed(() => !!props.helpText && !formGroup?.hasHelp.value)

const inputClass = computed(() => {
  const classes: string[] = []
  if (props.plaintext) {
    classes.push('form-control-plaintext')
  } else {
    classes.push('form-control')
    if (props.size) classes.push(`form-control-${props.size}`)
  }
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  if (props.focusRing) classes.push('focus-ring')
  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = props.type === 'number' ? (target.value === '' ? '' : Number(target.value)) : target.value
  modelValue.value = newValue
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
  <div v-if="!noWrapper" :class="{ 'mb-3': shouldRenderLabel || shouldRenderHelp || shouldRenderFeedback }">
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <input
      :id="computedId"
      :type="type"
      :class="inputClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || plaintext"
      :required="required"
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
        {{ validationMessage || 'Please provide a valid value.' }}
      </div>
    </template>
  </div>

  <input
    v-else
    :id="computedId"
    :type="type"
    :class="inputClass"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly || plaintext"
    :required="required"
    :aria-invalid="validationState === 'invalid'"
    :aria-describedby="formGroup ? (helpText && validationMessage ? `${helpId} ${feedbackId}` : helpText ? helpId : validationMessage ? feedbackId : undefined) : undefined"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>
