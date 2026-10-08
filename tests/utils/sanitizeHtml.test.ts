import { describe, it, expect, vi } from 'vitest'
import {
  makeDomPurifySanitizer,
  fallbackSanitizeHtml,
  WYSIWYG_PURIFY_CONFIG
} from '../../src/utils/sanitizeHtml'
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

// #186: the built-in fallback used when no consumer sanitizer is configured.
// Not an allowlist (DOMPurify remains the recommended upgrade), but it must
// neutralize the constructs that turn stored editor HTML into script execution.
describe('fallbackSanitizeHtml', () => {
  it('removes <script> elements entirely', () => {
    const out = fallbackSanitizeHtml('<p>ok</p><script>alert(1)</script>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)')
    expect(out).toContain('ok')
  })

  it('strips on* event-handler attributes but keeps the element', () => {
    const out = fallbackSanitizeHtml('<img src="x" onerror="alert(1)">')
    expect(out.toLowerCase()).not.toContain('onerror')
    expect(out).toContain('<img')
  })

  it('strips onload from <svg>', () => {
    const out = fallbackSanitizeHtml('<svg onload="alert(1)"></svg>')
    expect(out.toLowerCase()).not.toContain('onload')
  })

  it('removes javascript: hrefs', () => {
    const out = fallbackSanitizeHtml('<a href="javascript:alert(1)">x</a>')
    expect(out.toLowerCase()).not.toContain('javascript:')
  })

  it('removes data:text/html URLs', () => {
    const out = fallbackSanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>')
    expect(out.toLowerCase()).not.toContain('data:text/html')
  })

  it('removes vbscript: and data: on src attributes', () => {
    const out = fallbackSanitizeHtml('<iframe src="vbscript:msgbox(1)"></iframe>')
    expect(out.toLowerCase()).not.toContain('vbscript:')
  })

  it('removes scriptable containers (iframe, object, embed, form, style)', () => {
    const out = fallbackSanitizeHtml(
      '<iframe></iframe><object></object><embed><form></form><style>p{}</style>'
    )
    expect(out.toLowerCase()).not.toContain('<iframe')
    expect(out.toLowerCase()).not.toContain('<object')
    expect(out.toLowerCase()).not.toContain('<embed')
    expect(out.toLowerCase()).not.toContain('<form')
    expect(out.toLowerCase()).not.toContain('<style')
  })

  it('preserves safe rich-text markup', () => {
    const out = fallbackSanitizeHtml('<p><strong>Bold</strong> <em>italic</em> <a href="https://x.com">link</a></p>')
    expect(out).toContain('<strong>')
    expect(out).toContain('<em>')
    expect(out).toContain('https://x.com')
  })

  it('handles empty and non-string-ish input without throwing', () => {
    expect(fallbackSanitizeHtml('')).toBe('')
  })
})
