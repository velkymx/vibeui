<script setup lang="ts">
import VibeFieldFeedback from './VibeFieldFeedback.vue'
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { useFormField } from '../composables/useFormField'

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

// Consumer attributes (aria-label, name, data-*, class) belong on the native
// control, not the wrapper <div>. Mirrors VibeFormInput/VibeFormSelect.
defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}>()


const {
  computedId,
  helpId,
  feedbackId,
  ariaDescribedBy,
  shouldRenderLabel,
  shouldRenderFeedback,
  shouldRenderHelp,
  validationClass,
  ariaInvalid
} = useFormField('datepicker', props)

const inputClass = computed(() => {
  const classes = ['form-control']
  if (props.size) classes.push(`form-control-${props.size}`)
  if (validationClass.value) classes.push(validationClass.value)
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
      v-bind="$attrs"
      :id="computedId"
      :type="type"
      :class="inputClass"
      :value="modelValue"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :min="min"
      :max="max"
      :aria-invalid="ariaInvalid"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <VibeFieldFeedback
      :help-id="helpId"
      :feedback-id="feedbackId"
      :help-text="helpText"
      :validation-state="validationState"
      :validation-message="validationMessage"
      invalid-message="Please provide a valid date."
      :show-help="shouldRenderHelp"
      :show-feedback="shouldRenderFeedback"
    />
  </div>
</template>
