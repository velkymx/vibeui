// Allowed URL patterns:
//   https?://   — absolute HTTP/HTTPS
//   /(?!/)      — absolute path (/page, /) — excludes protocol-relative //example.com
//   ./  ../     — relative path
//   #           — same-page anchor
const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|\.\.?\/|#)/i

/**
 * Sanitize an href prop value against javascript: / data: / vbscript: injection.
 *
 * Returns the original value unchanged if it matches a safe pattern, or
 * undefined otherwise so the attribute is omitted from the DOM entirely.
 */
export function safeHref(href: string | undefined): string | undefined {
  if (href === undefined || href === '') return undefined
  return SAFE_HREF.test(href) ? href : undefined
}
