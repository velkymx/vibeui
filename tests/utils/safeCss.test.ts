import { describe, it, expect } from 'vitest'
import { safeLength, safeColor, safeCssObject, SAFE_COLUMN_STYLE_PROPS } from '../../src/utils/safeCss'

describe('safeLength', () => {
  it('allows auto', () => expect(safeLength('auto')).toBe('auto'))
  it('allows 0', () => expect(safeLength('0')).toBe('0'))
  it('allows px', () => expect(safeLength('200px')).toBe('200px'))
  it('allows %', () => expect(safeLength('100%')).toBe('100%'))
  it('allows rem', () => expect(safeLength('1.5rem')).toBe('1.5rem'))
  it('allows em', () => expect(safeLength('2em')).toBe('2em'))
  it('allows vh', () => expect(safeLength('50vh')).toBe('50vh'))
  it('allows vw', () => expect(safeLength('50vw')).toBe('50vw'))
  it('allows dvh', () => expect(safeLength('100dvh')).toBe('100dvh'))

  it('blocks bare number (no unit)', () => expect(safeLength('200')).toBeUndefined())
  it('blocks expression()', () => expect(safeLength('expression(alert(1))')).toBeUndefined())
  it('blocks url()', () => expect(safeLength('url(http://evil.com)')).toBeUndefined())
  it('blocks empty string', () => expect(safeLength('')).toBeUndefined())
  it('returns undefined for undefined', () => expect(safeLength(undefined)).toBeUndefined())
})

describe('safeColor', () => {
  it('allows 3-digit hex', () => expect(safeColor('#f0f')).toBe('#f0f'))
  it('allows 6-digit hex', () => expect(safeColor('#ff00ff')).toBe('#ff00ff'))
  it('allows 8-digit hex', () => expect(safeColor('#ff00ff80')).toBe('#ff00ff80'))
  it('allows rgb()', () => expect(safeColor('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)'))
  it('allows rgba()', () => expect(safeColor('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)'))
  it('allows hsl()', () => expect(safeColor('hsl(120, 100%, 50%)')).toBe('hsl(120, 100%, 50%)'))
  it('allows CSS custom property', () => expect(safeColor('var(--bs-primary)')).toBe('var(--bs-primary)'))
  it('allows named color keyword', () => expect(safeColor('red')).toBe('red'))
  it('allows transparent', () => expect(safeColor('transparent')).toBe('transparent'))

  it('blocks javascript: protocol', () => expect(safeColor('javascript:alert(1)')).toBeUndefined())
  it('blocks expression()', () => expect(safeColor('expression(alert(1))')).toBeUndefined())
  it('blocks empty string', () => expect(safeColor('')).toBeUndefined())
  it('returns undefined for undefined', () => expect(safeColor(undefined)).toBeUndefined())
})

describe('safeCssObject', () => {
  it('passes through allowed properties', () => {
    const input = { width: '100px', textAlign: 'center', cursor: 'pointer' }
    expect(safeCssObject(input)).toEqual(input)
  })

  it('strips disallowed properties', () => {
    const input = {
      width: '100px',
      backgroundImage: 'url(http://evil.com)',
      animation: 'blink 1s infinite'
    }
    const result = safeCssObject(input)
    expect(result).toEqual({ width: '100px' })
    expect(result.backgroundImage).toBeUndefined()
    expect(result.animation).toBeUndefined()
  })

  it('returns empty object for undefined input', () => {
    expect(safeCssObject(undefined)).toEqual({})
  })

  it('returns empty object for empty input', () => {
    expect(safeCssObject({})).toEqual({})
  })

  it('SAFE_COLUMN_STYLE_PROPS includes core layout properties', () => {
    expect(SAFE_COLUMN_STYLE_PROPS.has('width')).toBe(true)
    expect(SAFE_COLUMN_STYLE_PROPS.has('textAlign')).toBe(true)
    expect(SAFE_COLUMN_STYLE_PROPS.has('cursor')).toBe(true)
  })

  it('SAFE_COLUMN_STYLE_PROPS excludes dangerous properties', () => {
    expect(SAFE_COLUMN_STYLE_PROPS.has('backgroundImage')).toBe(false)
    expect(SAFE_COLUMN_STYLE_PROPS.has('animation')).toBe(false)
    expect(SAFE_COLUMN_STYLE_PROPS.has('content')).toBe(false)
  })
})
