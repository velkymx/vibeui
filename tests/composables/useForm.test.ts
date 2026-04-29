import { describe, it, expect, expectTypeOf } from 'vitest'
import { isReactive, isRef, nextTick } from 'vue'
import { useForm } from '../../src/composables/useForm'
import { validators } from '../../src/composables/useFormValidation'

describe('useForm', () => {
  describe('basic shape', () => {
    it('returns reactive fields with auto-unwrapped property access', () => {
      const form = useForm({ name: '', email: '' })

      expect(isReactive(form.fields)).toBe(true)
      expect(form.fields.name).toBe('')
      expect(form.fields.email).toBe('')
    })

    it('returns reactive errors and touched maps initialized empty', () => {
      const form = useForm({ name: '', email: '' })

      expect(isReactive(form.errors)).toBe(true)
      expect(isReactive(form.touched)).toBe(true)
      expect(form.errors.name).toBe('')
      expect(form.errors.email).toBe('')
      expect(form.touched.name).toBe(false)
      expect(form.touched.email).toBe(false)
    })

    it('exposes computed isValid and isDirty', () => {
      const form = useForm({ name: 'a' })

      expect(isRef(form.isValid)).toBe(true)
      expect(isRef(form.isDirty)).toBe(true)
      expect(form.isValid.value).toBe(true)
      expect(form.isDirty.value).toBe(false)
    })

    it('preserves field types from initial object', () => {
      const form = useForm({ name: '', age: 0, active: false })

      expectTypeOf(form.fields.name).toEqualTypeOf<string>()
      expectTypeOf(form.fields.age).toEqualTypeOf<number>()
      expectTypeOf(form.fields.active).toEqualTypeOf<boolean>()
    })
  })

  describe('mutation', () => {
    it('mutating fields.name updates values snapshot', async () => {
      const form = useForm({ name: '', email: '' })

      form.fields.name = 'Alice'
      await nextTick()

      expect(form.values.value).toEqual({ name: 'Alice', email: '' })
    })

    it('isDirty becomes true after first field mutation', async () => {
      const form = useForm({ name: '' })

      expect(form.isDirty.value).toBe(false)
      form.fields.name = 'A'
      await nextTick()
      expect(form.isDirty.value).toBe(true)
    })
  })

  describe('validate', () => {
    it('runs per-field rules and populates errors map', async () => {
      const form = useForm({ name: '', email: 'not-an-email' })

      const result = await form.validate({
        name: [validators.required('Name required')],
        email: [validators.email('Bad email')]
      })

      expect(result.valid).toBe(false)
      expect(form.errors.name).toBe('Name required')
      expect(form.errors.email).toBe('Bad email')
    })

    it('clears error for a field once it passes', async () => {
      const form = useForm({ name: '' })

      await form.validate({ name: [validators.required()] })
      expect(form.errors.name).toBeTruthy()

      form.fields.name = 'Alice'
      await form.validate({ name: [validators.required()] })
      expect(form.errors.name).toBe('')
      expect(form.isValid.value).toBe(true)
    })

    it('returns errors map reflecting failures', async () => {
      const form = useForm({ name: '', email: '' })
      const result = await form.validate({
        name: [validators.required('Required')],
        email: [validators.required('Required')]
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toEqual({ name: 'Required', email: 'Required' })
    })
  })

  describe('touched', () => {
    it('markTouched(key) sets the per-field touched flag', () => {
      const form = useForm({ name: '', email: '' })

      form.markTouched('name')
      expect(form.touched.name).toBe(true)
      expect(form.touched.email).toBe(false)
    })

    it('markAllTouched marks every field', () => {
      const form = useForm({ a: '', b: '', c: '' })

      form.markAllTouched()
      expect(form.touched.a).toBe(true)
      expect(form.touched.b).toBe(true)
      expect(form.touched.c).toBe(true)
    })
  })

  describe('reset', () => {
    it('restores initial values and clears errors/touched/dirty', async () => {
      const form = useForm({ name: 'init', email: '' })

      form.fields.name = 'changed'
      form.markTouched('name')
      await form.validate({ email: [validators.required('R')] })

      expect(form.fields.name).toBe('changed')
      expect(form.errors.email).toBe('R')
      expect(form.touched.name).toBe(true)
      expect(form.isDirty.value).toBe(true)

      form.reset()
      await nextTick()

      expect(form.fields.name).toBe('init')
      expect(form.errors.email).toBe('')
      expect(form.touched.name).toBe(false)
      expect(form.isDirty.value).toBe(false)
    })
  })

  describe('idempotency', () => {
    it('validating twice with same state yields same result', async () => {
      const form = useForm({ name: '' })
      const a = await form.validate({ name: [validators.required('R')] })
      const b = await form.validate({ name: [validators.required('R')] })

      expect(a).toEqual(b)
      expect(form.errors.name).toBe('R')
    })

    it('reset is idempotent', async () => {
      const form = useForm({ name: 'init' })
      form.fields.name = 'changed'
      form.reset()
      form.reset()
      expect(form.fields.name).toBe('init')
      expect(form.isDirty.value).toBe(false)
    })
  })
})
