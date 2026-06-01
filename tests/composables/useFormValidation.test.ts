import { describe, it, expect } from 'vitest'
import { useFormValidation, validators } from '../../src/composables/useFormValidation'

describe('useFormValidation', () => {
  describe('initial state', () => {
    it('sets initial value', () => {
      const field = useFormValidation('hello')
      expect(field.value.value).toBe('hello')
    })

    it('defaults to empty string', () => {
      const field = useFormValidation()
      expect(field.value.value).toBe('')
    })

    it('starts with null validationState', () => {
      const field = useFormValidation('x')
      expect(field.validationState.value).toBeNull()
    })

    it('starts not dirty, not touched, not validating', () => {
      const field = useFormValidation()
      expect(field.isDirty.value).toBe(false)
      expect(field.isTouched.value).toBe(false)
      expect(field.isValidating.value).toBe(false)
    })

    it('isValid and isInvalid both false initially', () => {
      const field = useFormValidation()
      expect(field.isValid.value).toBe(false)
      expect(field.isInvalid.value).toBe(false)
    })
  })

  describe('validate()', () => {
    it('returns valid when no rules provided', async () => {
      const field = useFormValidation('x')
      const result = await field.validate(undefined)
      expect(result.valid).toBe(true)
      expect(field.validationState.value).toBeNull()
    })

    it('returns valid when all rules pass', async () => {
      const field = useFormValidation('hello@example.com')
      const result = await field.validate([validators.required(), validators.email()])
      expect(result.valid).toBe(true)
      expect(field.validationState.value).toBe('valid')
      expect(field.isValid.value).toBe(true)
      expect(field.isInvalid.value).toBe(false)
    })

    it('returns invalid when a rule returns false', async () => {
      const field = useFormValidation('')
      const result = await field.validate([validators.required('Required')])
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Required')
      expect(field.validationState.value).toBe('invalid')
      expect(field.validationMessage.value).toBe('Required')
      expect(field.isInvalid.value).toBe(true)
    })

    it('returns invalid when a rule returns error string', async () => {
      const field = useFormValidation('bad')
      const result = await field.validate([validators.email('Bad email')])
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Bad email')
    })

    it('stops at first failing rule', async () => {
      const field = useFormValidation('')
      const called: string[] = []
      const rule1 = { validator: () => { called.push('r1'); return 'first error' } }
      const rule2 = { validator: () => { called.push('r2'); return true } }
      await field.validate([rule1, rule2])
      expect(called).toEqual(['r1'])
      expect(field.validationMessage.value).toBe('first error')
    })

    it('accepts a single ValidatorFunction (not wrapped in array)', async () => {
      const field = useFormValidation('x')
      const result = await field.validate((v) => v === 'x' || 'must be x')
      expect(result.valid).toBe(true)
    })

    it('uses rule.message when validator returns false', async () => {
      const field = useFormValidation('')
      const rule = { validator: () => false, message: 'Custom msg' }
      const result = await field.validate([rule])
      expect(result.message).toBe('Custom msg')
    })

    it('handles async validators', async () => {
      const field = useFormValidation('taken')
      const asyncRule = validators.async(async (v) => {
        if (v === 'taken') return 'Username taken'
        return true
      })
      const result = await field.validate([asyncRule])
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Username taken')
    })

    it('handles async validators that pass', async () => {
      const field = useFormValidation('available')
      const asyncRule = validators.async(async (v) => {
        if (v === 'taken') return 'Username taken'
        return true
      })
      const result = await field.validate([asyncRule])
      expect(result.valid).toBe(true)
    })

    it('catches thrown errors and returns invalid', async () => {
      const field = useFormValidation('x')
      const throwingRule = { validator: () => { throw new Error('boom') } }
      const result = await field.validate([throwingRule])
      expect(result.valid).toBe(false)
      expect(field.validationState.value).toBe('invalid')
    })
  })

  describe('reset()', () => {
    it('restores initial value', async () => {
      const field = useFormValidation('initial')
      field.value.value = 'changed'
      await field.validate([validators.required()])
      field.reset()
      expect(field.value.value).toBe('initial')
    })

    it('clears validationState and message', async () => {
      const field = useFormValidation('')
      await field.validate([validators.required()])
      field.reset()
      expect(field.validationState.value).toBeNull()
      expect(field.validationMessage.value).toBe('')
    })

    it('clears isDirty, isTouched, isValidating', () => {
      const field = useFormValidation()
      field.markAsDirty()
      field.markAsTouched()
      field.reset()
      expect(field.isDirty.value).toBe(false)
      expect(field.isTouched.value).toBe(false)
      expect(field.isValidating.value).toBe(false)
    })
  })

  describe('markAsTouched / markAsDirty', () => {
    it('markAsTouched sets isTouched', () => {
      const field = useFormValidation()
      field.markAsTouched()
      expect(field.isTouched.value).toBe(true)
    })

    it('markAsDirty sets isDirty', () => {
      const field = useFormValidation()
      field.markAsDirty()
      expect(field.isDirty.value).toBe(true)
    })
  })
})

describe('validators', () => {
  describe('required', () => {
    it('fails on empty string', async () => {
      const { validator } = validators.required()
      expect(await validator('')).not.toBe(true)
    })

    it('fails on whitespace only', async () => {
      const { validator } = validators.required()
      expect(await validator('   ')).not.toBe(true)
    })

    it('fails on null', async () => {
      const { validator } = validators.required()
      expect(await validator(null)).not.toBe(true)
    })

    it('fails on undefined', async () => {
      const { validator } = validators.required()
      expect(await validator(undefined)).not.toBe(true)
    })

    it('fails on empty array', async () => {
      const { validator } = validators.required()
      expect(await validator([])).not.toBe(true)
    })

    it('passes on non-empty string', async () => {
      const { validator } = validators.required()
      expect(await validator('hello')).toBe(true)
    })

    it('passes on non-empty array', async () => {
      const { validator } = validators.required()
      expect(await validator(['a'])).toBe(true)
    })

    it('passes on number 0', async () => {
      const { validator } = validators.required()
      expect(await validator(0)).toBe(true)
    })

    it('uses custom message', async () => {
      const { validator } = validators.required('Name required')
      const result = await validator('')
      expect(result).toBe('Name required')
    })
  })

  describe('email', () => {
    it('passes on valid email', async () => {
      const { validator } = validators.email()
      expect(await validator('user@example.com')).toBe(true)
    })

    it('fails on invalid email', async () => {
      const { validator } = validators.email()
      expect(await validator('notanemail')).not.toBe(true)
    })

    it('passes on empty (not required)', async () => {
      const { validator } = validators.email()
      expect(await validator('')).toBe(true)
    })

    it('uses custom message', async () => {
      const { validator } = validators.email('Bad email')
      expect(await validator('x')).toBe('Bad email')
    })

    it('accepts multi-dot and plus-addressed domains', async () => {
      const { validator } = validators.email()
      expect(await validator('first.last@sub.example.com')).toBe(true)
      expect(await validator('user+tag@a.co')).toBe(true)
      expect(await validator('x@y.z')).toBe(true)
    })

    it('rejects malformed addresses', async () => {
      const { validator } = validators.email()
      for (const bad of ['a@b', 'a@.com', 'a@b.', '@b.com', 'a@', 'a b@c.com', 'a@@b.com', 'a@b c.com']) {
        expect(await validator(bad), bad).not.toBe(true)
      }
    })

    it('is not vulnerable to ReDoS (runs in linear time on pathological input)', () => {
      const { validator } = validators.email()
      // Non-matching input (trailing space) forces an ambiguous [^\s@]+\.[^\s@]+ regex
      // to exhaustively backtrack over every '.' position — O(n^2).
      const evil = 'a@' + 'a.'.repeat(50000) + ' '
      const start = performance.now()
      validator(evil)
      expect(performance.now() - start).toBeLessThan(50)
    })
  })

  describe('minLength', () => {
    it('passes when length >= min', async () => {
      const { validator } = validators.minLength(3)
      expect(await validator('abc')).toBe(true)
    })

    it('fails when length < min', async () => {
      const { validator } = validators.minLength(3)
      expect(await validator('ab')).not.toBe(true)
    })

    it('passes on empty (not required)', async () => {
      const { validator } = validators.minLength(3)
      expect(await validator('')).toBe(true)
    })

    it('uses custom message', async () => {
      const { validator } = validators.minLength(5, 'Too short')
      expect(await validator('ab')).toBe('Too short')
    })
  })

  describe('maxLength', () => {
    it('passes when length <= max', async () => {
      const { validator } = validators.maxLength(5)
      expect(await validator('hello')).toBe(true)
    })

    it('fails when length > max', async () => {
      const { validator } = validators.maxLength(3)
      expect(await validator('toolong')).not.toBe(true)
    })

    it('passes on empty', async () => {
      const { validator } = validators.maxLength(3)
      expect(await validator('')).toBe(true)
    })
  })

  describe('min', () => {
    it('passes when value >= min', async () => {
      const { validator } = validators.min(5)
      expect(await validator(5)).toBe(true)
      expect(await validator(10)).toBe(true)
    })

    it('fails when value < min', async () => {
      const { validator } = validators.min(5)
      expect(await validator(4)).not.toBe(true)
    })

    it('passes on empty value (null/undefined)', async () => {
      const { validator } = validators.min(5)
      expect(await validator(null)).toBe(true)
      expect(await validator(undefined)).toBe(true)
      expect(await validator('')).toBe(true)
    })

    it('fails on NaN input', async () => {
      const { validator } = validators.min(5)
      expect(await validator('abc')).not.toBe(true)
    })

    it('uses custom message', async () => {
      const { validator } = validators.min(18, 'Must be 18+')
      expect(await validator(10)).toBe('Must be 18+')
    })
  })

  describe('max', () => {
    it('passes when value <= max', async () => {
      const { validator } = validators.max(100)
      expect(await validator(100)).toBe(true)
      expect(await validator(0)).toBe(true)
    })

    it('fails when value > max', async () => {
      const { validator } = validators.max(100)
      expect(await validator(101)).not.toBe(true)
    })

    it('passes on empty value', async () => {
      const { validator } = validators.max(100)
      expect(await validator(null)).toBe(true)
    })

    it('uses custom message', async () => {
      const { validator } = validators.max(99, 'Too large')
      expect(await validator(100)).toBe('Too large')
    })
  })

  describe('pattern', () => {
    it('passes matching value', async () => {
      const { validator } = validators.pattern(/^\d+$/)
      expect(await validator('123')).toBe(true)
    })

    it('fails non-matching value', async () => {
      const { validator } = validators.pattern(/^\d+$/, 'Digits only')
      expect(await validator('abc')).toBe('Digits only')
    })

    it('passes on empty', async () => {
      const { validator } = validators.pattern(/^\d+$/)
      expect(await validator('')).toBe(true)
    })
  })

  describe('url', () => {
    it('passes valid URL', async () => {
      const { validator } = validators.url()
      expect(await validator('https://example.com')).toBe(true)
    })

    it('fails invalid URL', async () => {
      const { validator } = validators.url()
      expect(await validator('not-a-url')).not.toBe(true)
    })

    it('passes on empty', async () => {
      const { validator } = validators.url()
      expect(await validator('')).toBe(true)
    })

    it('uses custom message', async () => {
      const { validator } = validators.url('Bad URL')
      expect(await validator('x')).toBe('Bad URL')
    })
  })

  describe('async', () => {
    it('wraps async function as a rule', async () => {
      const rule = validators.async(async (v) => v === 'ok' || 'not ok')
      expect(await rule.validator('ok')).toBe(true)
      expect(await rule.validator('bad')).toBe('not ok')
    })
  })
})
