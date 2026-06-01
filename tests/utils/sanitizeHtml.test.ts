import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sanitizeHtml, loadDOMPurify, _resetSanitizer } from '../../src/utils/sanitizeHtml'
import DOMPurify from 'dompurify'

describe('sanitizeHtml', () => {
  beforeEach(() => {
    _resetSanitizer()
    vi.clearAllMocks()
  })

  it('returns html unchanged before loadDOMPurify() is called (graceful fallback)', () => {
    const html = '<p>Hello</p>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('after loadDOMPurify(), calls DOMPurify.sanitize with the wysiwyg allowlist', async () => {
    const spy = vi.spyOn(DOMPurify, 'sanitize').mockImplementation((v) => v as string)

    await loadDOMPurify()
    sanitizeHtml('<p>Test</p>')

    expect(spy).toHaveBeenCalledWith(
      '<p>Test</p>',
      expect.objectContaining({
        ALLOWED_TAGS: expect.arrayContaining(['p', 'strong', 'em', 'a', 'ol', 'ul', 'li']),
        ALLOWED_ATTR: expect.arrayContaining(['href'])
      })
    )
    spy.mockRestore()
  })

  it('after loadDOMPurify(), strips <script> tags from input', async () => {
    await loadDOMPurify()
    const result = sanitizeHtml('<p>Safe</p><script>alert(1)</script>')
    // DOMPurify removes <script> — the result must not contain the tag
    expect(result).not.toContain('<script>')
    expect(result).toContain('Safe')
  })

  it('after loadDOMPurify(), strips javascript: href from <a> tags', async () => {
    await loadDOMPurify()
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    // DOMPurify strips disallowed href protocols
    expect(result).not.toContain('javascript:')
  })

  it('after loadDOMPurify(), preserves allowed content', async () => {
    await loadDOMPurify()
    const result = sanitizeHtml('<p><strong>Bold</strong> and <em>italic</em></p>')
    expect(result).toContain('<strong>')
    expect(result).toContain('<em>')
  })

  it('loadDOMPurify() is idempotent — calling twice does not reset the purifier', async () => {
    const spy = vi.spyOn(DOMPurify, 'sanitize').mockImplementation((v) => v as string)

    await loadDOMPurify()
    await loadDOMPurify() // second call is a no-op

    sanitizeHtml('<p>x</p>')
    // Sanitize called exactly once (one sanitizeHtml call above)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
