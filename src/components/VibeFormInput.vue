<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { PropType } from 'vue'
import type { InputType, ValidationState, ValidationRule, ValidatorFunction, Size, AutocompleteType, InputMode } from '../types'
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

const formGroup = inject(FORM_GROUP_KEY, null)

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

const _groupId = formGroup?.consumeId()
const _generatedId = useId('input')
const computedId = computed(() => props.id || _groupId || _generatedId)
const helpId = computed(() => `${computedId.value}-help`)
const feedbackId = computed(() => `${computedId.value}-feedback`)

// WCAG 1.3.1 / 3.3.1: when this input lives inside a VibeFormGroup, point
// aria-describedby at the group's help text and feedback elements too.
const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  // Own help / feedback (standalone usage or explicit props on the input)
  if (props.helpText) ids.push(helpId.value)
  if (props.validationMessage) ids.push(feedbackId.value)
  // Group-level help / feedback (most common pattern — props on VibeFormGroup)
  if (formGroup?.helpId.value) ids.push(formGroup.helpId.value)
  if (formGroup?.feedbackId.value) ids.push(formGroup.feedbackId.value)
  return ids.length ? [...new Set(ids)].join(' ') : undefined
})

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
        :aria-invalid="validationState === 'invalid'"
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
      :aria-invalid="validationState === 'invalid'"
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
    <div v-if="shouldRenderHelp" :id="helpId" class="form-text">
      {{ helpText }}
    </div>
    <template v-if="shouldRenderFeedback">
      <div v-if="validationState === 'valid'" :id="feedbackId" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <!-- role="alert" announces errors to SR users without requiring refocus (WCAG 4.1.3) -->
      <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" role="alert" :style="{ display: 'block' }">
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
    :autocomplete="computedAutocomplete"
    :inputmode="computedInputmode"
    :aria-invalid="validationState === 'invalid'"
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
