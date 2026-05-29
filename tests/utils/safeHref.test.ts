import { describe, it, expect } from 'vitest'
import { safeHref } from '../../src/utils/safeHref'

describe('safeHref', () => {
  // Allowed patterns
  it('allows https:// URLs', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com')
  })

  it('allows http:// URLs', () => {
    expect(safeHref('http://example.com/path')).toBe('http://example.com/path')
  })

  it('allows absolute paths', () => {
    expect(safeHref('/about')).toBe('/about')
    expect(safeHref('/')).toBe('/')
  })

  it('allows relative paths', () => {
    expect(safeHref('./page')).toBe('./page')
    expect(safeHref('../parent')).toBe('../parent')
  })

  it('allows same-page anchors', () => {
    expect(safeHref('#section')).toBe('#section')
    expect(safeHref('#')).toBe('#')
  })

  // Blocked patterns — each must return undefined so no href attribute is emitted
  it('blocks javascript: URLs', () => {
    expect(safeHref('javascript:alert(1)')).toBeUndefined()
    expect(safeHref('javascript:void(0)')).toBeUndefined()
    expect(safeHref('JAVASCRIPT:alert(1)')).toBeUndefined()
  })

  it('blocks data: URLs', () => {
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(safeHref('DATA:text/html,payload')).toBeUndefined()
  })

  it('blocks vbscript: URLs', () => {
    expect(safeHref('vbscript:msgbox(1)')).toBeUndefined()
  })

  it('blocks protocol-relative URLs (// without scheme enforcement)', () => {
    // //evil.com is excluded — consumers should use full https:// URLs
    expect(safeHref('//evil.com')).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    expect(safeHref(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(safeHref('')).toBeUndefined()
  })
})
