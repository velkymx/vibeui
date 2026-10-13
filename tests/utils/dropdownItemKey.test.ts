import { describe, it, expect } from 'vitest'
import { dropdownItemKey } from '../../src/utils/dropdownItemKey'

// #224: keys must be unique even for duplicate text/href; the stable part
// stays readable, the index suffix guarantees uniqueness.
describe('dropdownItemKey', () => {
  it('suffixes stable keys with the index so duplicates never collide', () => {
    const a = dropdownItemKey({ text: 'Settings' }, 0, 'Test')
    const b = dropdownItemKey({ text: 'Settings' }, 1, 'Test')
    expect(a).not.toBe(b)
    expect(String(a)).toContain('Settings')
  })

  it('keys separators by index token', () => {
    expect(dropdownItemKey({ divider: true }, 2, 'Test')).toBe('__sep-2')
  })
})
