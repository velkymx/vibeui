import { describe, it, expect } from 'vitest'
import { useForm } from '../../src/composables/useForm'
import type { ValidationRule } from '../../src/types'

// #138: rules can be supplied in the constructor; validate()/validateField() use
// them by default, with a per-call override still allowed. Backward compatible.

const required = (message: string): ValidationRule => ({
  validator: (v: unknown) => (typeof v === 'string' && v.trim() !== ''),
  message,
})

describe('useForm constructor rules (#138)', () => {
  it('validate() with no argument uses the constructor rules', async () => {
    const form = useForm(
      { name: '', email: 'a@b.com' },
      { name: [required('Name is required')] },
    )
    const result = await form.validate()
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBe('Name is required')
    expect(form.errors.name).toBe('Name is required')
  })

  it('a per-call rules argument overrides the constructor rules', async () => {
    const form = useForm(
      { name: '', email: '' },
      { name: [required('Name is required')] },
    )
    // Override: only validate email this call.
    const result = await form.validate({ email: [required('Email is required')] })
    expect(result.errors.email).toBe('Email is required')
    expect(result.errors.name).toBeUndefined()
  })

  it('validateField() falls back to the constructor rule for that field', async () => {
    const form = useForm(
      { name: '' },
      { name: [required('Name is required')] },
    )
    const message = await form.validateField('name')
    expect(message).toBe('Name is required')
  })

  it('is backward compatible: no constructor rules, rules passed to validate()', async () => {
    const form = useForm({ name: '' })
    const result = await form.validate({ name: [required('Name is required')] })
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBe('Name is required')
  })
})
