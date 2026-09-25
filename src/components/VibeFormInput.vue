<script setup lang="ts">
import VibeFieldFeedback from './VibeFieldFeedback.vue'
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { InputType, ValidationState, ValidationRule, ValidatorFunction, Size, AutocompleteType, InputMode } from '../types'
import { useFormField } from '../composables/useFormField'

// v-model via defineModel (Vue 3.4+): replaces the modelValue prop + update:modelValue emit.
const modelValue = defineModel<string | number>({ default: '' })

// Consumer HTML attributes (name, min, maxlength, pattern, …) belong on the native
// <input>, not the wrapper <div> — native form submission needs `name` on the control
// and constraint-validation attrs are inert on a div. Auto-inheritance is disabled and
// $attrs is bound explicitly (first, so prop-driven bindings win any conflict).
defineOptions({ inheritAttrs: false })

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
  focusRing: { type: Boolean, default: false },
  showToggle: { type: Boolean, default: false },
  showPasswordStrength: { type: Boolean, default: false },
  autocomplete: { type: String as PropType<AutocompleteType>, default: undefined },
  inputmode: { type: String as PropType<InputMode>, default: undefined }
})

const emit = defineEmits<{
  (e: 'validate'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}>()


const showPassword = ref(false)
const effectiveType = computed(() =>
  props.type === 'password' && props.showToggle && showPassword.value ? 'text' : props.type
)

function passwordStrength(pw: string): { level: number; label: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw)) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  if (score <= 1) return { level: 1, label: 'Weak' }
  if (score <= 2) return { level: 2, label: 'Fair' }
  if (score <= 4) return { level: 3, label: 'Good' }
  return { level: 4, label: 'Strong' }
}

const strength = computed(() => passwordStrength(String(modelValue.value ?? '')))
const strengthColors = ['', '#dc3545', '#fd7e14', '#0d6efd', '#198754']

const inputmodeAutoMap: Partial<Record<InputType, InputMode>> = {
  number: 'decimal',
  email: 'email',
  tel: 'tel',
  url: 'url',
  search: 'search',
}
const computedInputmode = computed(() =>
  props.inputmode ?? inputmodeAutoMap[props.type as InputType]
)

const autocompleteAutoMap: Partial<Record<InputType, AutocompleteType>> = {
  email: 'email',
}
const computedAutocomplete = computed(() =>
  props.autocomplete ?? autocompleteAutoMap[props.type as InputType]
)

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
} = useFormField('input', props)



const inputClass = computed(() => {
  const classes: string[] = []
  if (props.plaintext) {
    classes.push('form-control-plaintext')
  } else {
    classes.push('form-control')
    if (props.size) classes.push(`form-control-${props.size}`)
  }
  if (validationClass.value) classes.push(validationClass.value)
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
    <!-- WCAG 3.3.2: visible required/optional signal, matching VibeFormGroup's pattern. -->
    <label v-if="shouldRenderLabel" :for="computedId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger ms-1" aria-hidden="true">*</span>
      <span v-else class="text-muted ms-1 small" aria-hidden="true">(optional)</span>
      <!-- Screen-reader-only equivalent of the visual asterisk -->
      <span v-if="required" class="visually-hidden">required</span>
    </label>
    <div v-if="showToggle && type === 'password'" class="input-group">
      <input
        v-bind="$attrs"
        :id="computedId"
        :type="effectiveType"
        :class="inputClass"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly || plaintext"
        :required="required"
        :autocomplete="computedAutocomplete"
        :inputmode="computedInputmode"
        :aria-invalid="ariaInvalid"
        :aria-describedby="ariaDescribedBy"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <button
        type="button"
        class="btn btn-outline-secondary"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :aria-pressed="showPassword"
        @click="showPassword = !showPassword"
      >
        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true" />
      </button>
    </div>
    <input
      v-else
      v-bind="$attrs"
      :id="computedId"
      :type="type"
      :class="inputClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || plaintext"
      :required="required"
      :autocomplete="computedAutocomplete"
      :inputmode="computedInputmode"
      :aria-invalid="ariaInvalid"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <div v-if="showPasswordStrength && type === 'password'" aria-live="polite" class="mt-1">
      <div class="d-flex gap-1 mb-1" aria-hidden="true">
        <div
          v-for="i in 4"
          :key="i"
          class="flex-fill rounded"
          style="height: 4px"
          :style="{ backgroundColor: i <= strength.level ? strengthColors[strength.level] : 'var(--bs-border-color)' }"
        />
      </div>
      <small class="text-muted">Password strength: {{ strength.label }}</small>
    </div>
    <VibeFieldFeedback
      :help-id="helpId"
      :feedback-id="feedbackId"
      :help-text="helpText"
      :validation-state="validationState"
      :validation-message="validationMessage"
      invalid-message="Please provide a valid value."
      :show-help="shouldRenderHelp"
      :show-feedback="shouldRenderFeedback"
    />
  </div>

  <input
    v-else
    v-bind="$attrs"
    :id="computedId"
    :type="type"
    :class="inputClass"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly || plaintext"
    :required="required"
    :autocomplete="computedAutocomplete"
    :inputmode="computedInputmode"
    :aria-invalid="ariaInvalid"
    :aria-describedby="ariaDescribedBy"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<style scoped>
/*
 * WCAG 1.4.3: browser-default placeholder opacity (~0.6) yields ~2.6:1 contrast on white.
 * Bootstrap's --bs-secondary-color (#6c757d / light, #adb5bd / dark) achieves ≥ 4.5:1
 * on the respective body backgrounds when rendered at full opacity.
 */
input::placeholder {
  color: var(--bs-secondary-color) !important;
  opacity: 1 !important;
}
</style>
