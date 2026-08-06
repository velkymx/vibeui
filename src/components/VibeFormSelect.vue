<script setup lang="ts">
import VibeFieldFeedback from './VibeFieldFeedback.vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { FormSelectOption, FormSelectOptionValue, ValidationState, ValidationRule, ValidatorFunction, Size } from '../types'
import { useFormField } from '../composables/useFormField'

// Option values follow Vue's own `<option :value>` semantics: the DOM attribute carries
// String(value) — or is dropped entirely for null/undefined — while the untouched value
// rides along on the element's `_value` property. The rendered attribute is a public
// contract (native form submission, E2E selectors, autofill, non-Vue consumers), so it
// must never hold an internal encoding; `_value` is what preserves typed primitives.
type ValueCarryingOption = HTMLOptionElement & { _value?: FormSelectOptionValue }

const readOptionValue = (option: HTMLOptionElement): FormSelectOptionValue => {
  const carrier = option as ValueCarryingOption
  // Options rendered through the default slot have no `_value`; fall back to the attribute.
  return '_value' in carrier ? (carrier._value as FormSelectOptionValue) : option.value
}

const findIndexForValue = (options: FormSelectOption[], value: FormSelectOptionValue): number => {
  for (let i = 0; i < options.length; i++) {
    if (Object.is(options[i].value, value)) return i
  }
  return -1
}

// v-model via defineModel (Vue 3.4+): replaces the modelValue prop + update:modelValue emit.
const modelValue = defineModel<FormSelectOptionValue | FormSelectOptionValue[]>({ default: '' })

// Consumer HTML attributes (name, …) belong on the native <select>, not the wrapper
// <div> — native form submission needs `name` on the control. Auto-inheritance is
// disabled and $attrs is bound explicitly (first, so prop-driven bindings win).
defineOptions({ inheritAttrs: false })

const props = defineProps({
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

const emit = defineEmits<{
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', event: Event): void
}>()


const {
  formGroup,
  computedId,
  helpId,
  feedbackId,
  ariaDescribedBy,
  shouldRenderLabel,
  shouldRenderFeedback,
  shouldRenderHelp
} = useFormField('select', props)

const selectClass = computed(() => {
  const classes = ['form-select']
  if (props.size) classes.push(`form-select-${props.size}`)
  if (props.validationState === 'valid') classes.push('is-valid')
  if (props.validationState === 'invalid') classes.push('is-invalid')
  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLSelectElement
  let newValue: FormSelectOptionValue | FormSelectOptionValue[]
  if (props.multiple) {
    newValue = Array.from(target.selectedOptions).map(readOptionValue)
  } else {
    const selected = target.selectedOptions[0]
    // Nothing selected (or the disabled placeholder) — surface '' for back-compat.
    newValue = selected ? readOptionValue(selected) : ''
  }
  modelValue.value = newValue
}

// Selection cannot be expressed by binding `value` on the <select>: that value is a
// string and so cannot address a typed primitive (null, false, 0). Nor can it be bound
// per-option, because an option's selectedness is not reliably retained while its
// siblings are still being inserted. Vue's own v-model on <select> resolves this by
// applying selectedness imperatively once the options are in the DOM — mirror that.
const selectEl = ref<HTMLSelectElement | null>(null)

// Index into `props.options`; -1 when the model matches no option. First match wins,
// so duplicate values resolve to the earliest option.
const selectedIndex = computed(() =>
  Array.isArray(modelValue.value)
    ? -1
    : findIndexForValue(props.options, modelValue.value as FormSelectOptionValue)
)

const syncSelection = () => {
  const el = selectEl.value
  if (!el) return
  const domOptions = Array.from(el.options)

  if (props.multiple) {
    const selected = Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value]
    for (const option of domOptions) {
      option.selected = selected.some((v: FormSelectOptionValue) => Object.is(v, readOptionValue(option)))
    }
    return
  }

  // Options supplied through the default slot are not in `props.options`, so fall back
  // to matching on the values the DOM itself carries.
  if (props.options.length === 0) {
    el.selectedIndex = domOptions.findIndex(o => Object.is(readOptionValue(o), modelValue.value))
    return
  }

  // The placeholder occupies DOM index 0 and is not part of `props.options`. An
  // unmatched model falls back to it, mirroring a native unselected select.
  const placeholderOffset = props.placeholder ? 1 : 0
  el.selectedIndex = selectedIndex.value < 0
    ? (placeholderOffset ? 0 : -1)
    : selectedIndex.value + placeholderOffset
}

onMounted(syncSelection)
// `post` flush runs after the option elements have been patched into the DOM.
watch(
  [modelValue, () => props.options, () => props.multiple, () => props.placeholder],
  syncSelection,
  { flush: 'post', deep: true }
)

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
      ref="selectEl"
      v-bind="$attrs"
      :id="computedId"
      :class="selectClass"
      :multiple="multiple"
      :size="htmlSize || selectSize"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationState === 'invalid'"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <option v-if="placeholder && !multiple" value="" disabled>{{ placeholder }}</option>
      <slot>
        <option
          v-for="(option, idx) in options"
          :key="`${idx}-${option.value !== undefined ? String(option.value) : option.text}`"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.text }}
        </option>
      </slot>
    </select>
    <VibeFieldFeedback
      :help-id="helpId"
      :feedback-id="feedbackId"
      :help-text="helpText"
      :validation-state="validationState"
      :validation-message="validationMessage"
      invalid-message="Please select an option."
      :show-help="shouldRenderHelp"
      :show-feedback="shouldRenderFeedback"
    />
  </div>
</template>
