import { describe, it, expect } from 'vitest'
import { routeKey } from '../../src/utils/routeKey'

describe('routeKey', () => {
  it('returns empty string for undefined', () => {
    expect(routeKey(undefined)).toBe('')
  })

  it('returns the string as-is for string to', () => {
    expect(routeKey('/about')).toBe('/about')
    expect(routeKey('home')).toBe('home')
  })

  it('returns JSON.stringify for object to', () => {
    const to = { name: 'user', params: { id: 1 } }
    expect(routeKey(to)).toBe(JSON.stringify(to))
  })

  it('never returns [object Object] for object to', () => {
    expect(routeKey({ name: 'route' })).not.toBe('[object Object]')
  })

  it('produces distinct keys for distinct route objects', () => {
    const a = routeKey({ name: 'user', params: { id: 1 } })
    const b = routeKey({ name: 'user', params: { id: 2 } })
    expect(a).not.toBe(b)
  })

  it('produces identical keys for identical route objects', () => {
    const obj = { name: 'user', params: { id: 1 } }
    expect(routeKey(obj)).toBe(routeKey(obj))
  })
})
