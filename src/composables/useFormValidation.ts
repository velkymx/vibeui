import { ref, computed, watch, type Ref } from 'vue'
import type { ValidationState, ValidationRule, ValidatorFunction, FormValidationResult } from '../types'

export type FormFieldValue = string | number | boolean | null | undefined

export function useFormValidation<T extends FormFieldValue = string>(initialValue: T = '' as T) {
  const value: Ref<T> = ref(initialValue) as Ref<T>
  const validationState = ref<ValidationState>(null)
  const validationMessage = ref<string>('')
  const isDirty = ref(false)
  const isTouched = ref(false)
  const isValidating = ref(false)
  let validateSeq = 0

  watch(value, () => {
    if (validationState.value === 'invalid') {
      validationState.value = null
      validationMessage.value = ''
    }
  })

  const validate = async (rules: ValidationRule[] | ValidatorFunction | undefined): Promise<FormValidationResult> => {
    const seq = ++validateSeq

    if (!rules) {
      if (seq !== validateSeq) return { valid: true }
      validationState.value = null
      validationMessage.value = ''
      return { valid: true }
    }

    isValidating.value = true

    try {
      const rulesArray: ValidationRule[] = Array.isArray(rules)
        ? rules
        : [{ validator: rules }]

      for (const rule of rulesArray) {
        const result = await rule.validator(value.value)
        if (seq !== validateSeq) return { valid: true }

        if (result === false || typeof result === 'string') {
          validationState.value = 'invalid'
          validationMessage.value = typeof result === 'string' ? result : (rule.message || 'Invalid value')
          isValidating.value = false
          return { valid: false, message: validationMessage.value }
        }
      }

      if (seq !== validateSeq) return { valid: true }
      validationState.value = 'valid'
      validationMessage.value = ''
      isValidating.value = false
      return { valid: true }
    } catch (error) {
      if (seq !== validateSeq) return { valid: true }
      validationState.value = 'invalid'
      validationMessage.value = 'Validation error occurred'
      isValidating.value = false
      return { valid: false, message: validationMessage.value }
    }
  }

  const reset = () => {
    value.value = initialValue
    validationState.value = null
    validationMessage.value = ''
    isDirty.value = false
    isTouched.value = false
    isValidating.value = false
  }

  const markAsTouched = () => {
    isTouched.value = true
  }

  const markAsDirty = () => {
    isDirty.value = true
  }

  const isValid = computed(() => validationState.value === 'valid')
  const isInvalid = computed(() => validationState.value === 'invalid')

  return {
    value,
    validationState,
    validationMessage,
    isDirty,
    isTouched,
    isValidating,
    isValid,
    isInvalid,
    validate,
    reset,
    markAsTouched,
    markAsDirty
  }
}

// Built-in validators
export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    validator: (value: unknown) => {
      if (Array.isArray(value)) return value.length > 0 || message
      if (typeof value === 'string') return value.trim().length > 0 || message
      // Explicit parentheses for clarity - checks that value is not null/undefined/empty string
      return (value !== null && value !== undefined && value !== '') || message
    },
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validator: (value: unknown) => {
      if (value === null || value === undefined || value === '') return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(String(value)) || message
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => {
      if (value === null || value === undefined || value === '') return true
      const str = String(value)
      return str.length >= min || message || `Minimum length is ${min} characters`
    },
    message
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => {
      if (value === null || value === undefined || value === '') return true
      const str = String(value)
      return str.length <= max || message || `Maximum length is ${max} characters`
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => {
      // Skip validation for empty values (use required validator for that)
      if (value === null || value === undefined || value === '') return true
      const numValue = Number(value)
      if (Number.isNaN(numValue)) return message || `Value must be a number`
      return numValue >= min || message || `Minimum value is ${min}`
    },
    message
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => {
      // Skip validation for empty values (use required validator for that)
      if (value === null || value === undefined || value === '') return true
      const numValue = Number(value)
      if (Number.isNaN(numValue)) return message || `Value must be a number`
      return numValue <= max || message || `Maximum value is ${max}`
    },
    message
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validator: (value: unknown) => {
      if (value === null || value === undefined || value === '') return true
      return regex.test(String(value)) || message
    },
    message
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validator: (value: unknown) => {
      if (value === null || value === undefined || value === '') return true
      try {
        new URL(String(value))
        return true
      } catch {
        return message
      }
    },
    message
  }),

  // Async validator for API validation
  async: (validatorFn: (value: unknown) => Promise<boolean | string>): ValidationRule => ({
    validator: validatorFn
  })
}
