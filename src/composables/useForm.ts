import { reactive, computed, ref, watch, type ComputedRef } from 'vue'
import type { ValidationRule, ValidatorFunction } from '../types'

export type FormFieldRules<T> = Partial<Record<keyof T, ValidationRule[] | ValidatorFunction>>

export interface FormValidateResult<T> {
  valid: boolean
  errors: Partial<Record<keyof T, string>>
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  fields: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isDirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  values: ComputedRef<T>
  validate: (rules: FormFieldRules<T>) => Promise<FormValidateResult<T>>
  validateField: <K extends keyof T>(key: K, rule: ValidationRule[] | ValidatorFunction) => Promise<string>
  reset: () => void
  markTouched: <K extends keyof T>(key: K) => void
  markAllTouched: () => void
  setField: <K extends keyof T>(key: K, value: T[K]) => void
}

// Deep clone via JSON-roundtrip. Works on Vue reactive proxies (which
// structuredClone rejects) and is sufficient for typical form state
// (primitives, arrays, plain objects). Drops functions, Map/Set, and circular
// references — fields containing those are not supported.
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T

const runRules = async (
  value: unknown,
  rules: ValidationRule[] | ValidatorFunction
): Promise<string> => {
  const list: ValidationRule[] = Array.isArray(rules) ? rules : [{ validator: rules }]
  for (const rule of list) {
    const result = await rule.validator(value)
    if (result === false) return rule.message || 'Invalid value'
    if (typeof result === 'string') return result
  }
  return ''
}

export function useForm<T extends Record<string, unknown>>(initial: T): UseFormReturn<T> {
  const initialSnapshot = deepClone(initial)
  const fields = reactive(deepClone(initial)) as T

  const errorsInit = {} as Record<keyof T, string>
  const touchedInit = {} as Record<keyof T, boolean>
  for (const k of Object.keys(initial) as Array<keyof T>) {
    errorsInit[k] = ''
    touchedInit[k] = false
  }
  const errors = reactive(errorsInit) as Record<keyof T, string>
  const touched = reactive(touchedInit) as Record<keyof T, boolean>

  const dirtyFlag = ref(false)
  const isDirty = computed(() => dirtyFlag.value)

  watch(
    () => JSON.stringify(fields),
    () => {
      const fieldsJson = JSON.stringify(fields)
      const initialJson = JSON.stringify(initialSnapshot)
      dirtyFlag.value = fieldsJson !== initialJson
    },
    { deep: true, immediate: true }
  )

  const isValid = computed(() => {
    for (const k of Object.keys(errors) as Array<keyof T>) {
      if (errors[k]) return false
    }
    return true
  })

  const values = computed(() => ({ ...fields }) as T)

  const validateField = async <K extends keyof T>(
    key: K,
    rule: ValidationRule[] | ValidatorFunction
  ): Promise<string> => {
    const message = await runRules(fields[key], rule)
    errors[key] = message
    return message
  }

  const validate = async (rules: FormFieldRules<T>): Promise<FormValidateResult<T>> => {
    const out: Partial<Record<keyof T, string>> = {}
    let valid = true
    for (const key of Object.keys(rules) as Array<keyof T>) {
      const rule = rules[key]
      if (!rule) continue
      const message = await runRules(fields[key], rule)
      errors[key] = message
      if (message) {
        out[key] = message
        valid = false
      }
    }
    return { valid, errors: out }
  }

  const reset = () => {
    for (const k of Object.keys(initialSnapshot) as Array<keyof T>) {
      // Re-clone the snapshot value so subsequent mutations don't bleed back
      ;(fields as Record<string, unknown>)[k as string] = deepClone(initialSnapshot[k])
      errors[k] = ''
      touched[k] = false
    }
    dirtyFlag.value = false
  }

  const markTouched = <K extends keyof T>(key: K) => {
    touched[key] = true
  }

  const markAllTouched = () => {
    for (const k of Object.keys(touched) as Array<keyof T>) {
      touched[k] = true
    }
  }

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    ;(fields as Record<string, unknown>)[key as string] = value
  }

  return {
    fields,
    errors,
    touched,
    isDirty,
    isValid,
    values,
    validate,
    validateField,
    reset,
    markTouched,
    markAllTouched,
    setField
  }
}
