// Tags and attributes produced by the Quill 2.x editor toolbar.
// This allowlist is intentionally restrictive — anything not listed is stripped.
export const WYSIWYG_PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's',
    'ol', 'ul', 'li',
    'h1', 'h2', 'h3',
    'a', 'blockquote', 'pre', 'code'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel']
}

// Resolved once on first call. null = DOMPurify is not installed.
let _purify: ((html: string) => string) | null = null
let _loaded = false

export async function loadDOMPurify(): Promise<void> {
  if (_loaded) return
  _loaded = true
  try {
    const mod = await import('dompurify')
    const DOMPurify = (mod.default ?? mod) as { sanitize: (html: string, cfg: object) => string }
    _purify = (html: string) => DOMPurify.sanitize(html, WYSIWYG_PURIFY_CONFIG)
  } catch {
    if (import.meta.env.DEV) {
      console.warn(
        '[VibeFormWysiwyg] DOMPurify not installed — HTML modelValue is passed ' +
        'unsanitized to Quill. Run: npm install dompurify'
      )
    }
  }
}

/**
 * Sanitize an HTML string if DOMPurify is available.
 * Falls back to the original string if DOMPurify is not installed — the caller
 * (Quill's clipboard converter) applies its own Delta-based sanitization regardless.
 */
export function sanitizeHtml(html: string): string {
  return _purify ? _purify(html) : html
}

/** Reset state — for use in tests only. */
export function _resetSanitizer(): void {
  _purify = null
  _loaded = false
}
