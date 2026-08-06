import { describe, it, expect } from 'vitest'
import { linkBindings } from '../../src/utils/linkBindings'

describe('linkBindings', () => {
  it('binds only href when an href is supplied', () => {
    expect(linkBindings('/page', undefined)).toEqual({ href: '/page' })
  })

  it('binds only to when routing', () => {
    expect(linkBindings(undefined, '/page')).toEqual({ to: '/page' })
  })

  it('supports object route locations', () => {
    expect(linkBindings(undefined, { path: '/page' })).toEqual({ to: { path: '/page' } })
  })

  it('omits the to key entirely when href wins, so it cannot leak as a DOM attribute', () => {
    const bindings = linkBindings('/page', '/other')

    expect(bindings).toEqual({ href: '/page' })
    expect('to' in bindings).toBe(false)
  })

  it('omits the href key entirely when routing, so it cannot erase the resolved href', () => {
    const bindings = linkBindings(undefined, '/page')

    expect('href' in bindings).toBe(false)
  })

  it('binds nothing when neither is usable', () => {
    expect(linkBindings(undefined, undefined)).toEqual({})
    expect(linkBindings('', '')).toEqual({})
  })
})
