import { describe, it, expect, vi } from 'vitest'
import { makeDomPurifySanitizer, WYSIWYG_PURIFY_CONFIG } from '../../src/utils/sanitizeHtml'
import DOMPurify from 'dompurify'

describe('makeDomPurifySanitizer', () => {
  it('calls the provided DOMPurify with the WYSIWYG allowlist', () => {
    const sanitize = vi.fn((html: string) => `clean:${html}`)
    const fn = makeDomPurifySanitizer({ sanitize })
    const out = fn('<p>hi</p>')
    expect(out).toBe('clean:<p>hi</p>')
    expect(sanitize).toHaveBeenCalledWith('<p>hi</p>', WYSIWYG_PURIFY_CONFIG)
  })

  it('exposes a restrictive allowlist (no script, keeps rich-text tags)', () => {
    expect(WYSIWYG_PURIFY_CONFIG.ALLOWED_TAGS).not.toContain('script')
    expect(WYSIWYG_PURIFY_CONFIG.ALLOWED_TAGS).toEqual(
      expect.arrayContaining(['p', 'strong', 'em', 'a', 'ol', 'ul', 'li'])
    )
    expect(WYSIWYG_PURIFY_CONFIG.ALLOWED_ATTR).toEqual(expect.arrayContaining(['href']))
  })

  // Security coverage against real DOMPurify (a devDependency), proving the
  // allowlist wired by makeDomPurifySanitizer actually neutralizes bad input.
  describe('with real DOMPurify', () => {
    const sanitize = makeDomPurifySanitizer(DOMPurify)

    it('strips javascript: hrefs from <a> tags', () => {
      expect(sanitize('<a href="javascript:alert(1)">click</a>')).not.toContain('javascript:')
    })

    it('preserves allowed formatting', () => {
      const out = sanitize('<p><strong>Bold</strong> and <em>italic</em></p>')
      expect(out).toContain('<strong>')
      expect(out).toContain('<em>')
    })
  })
})
