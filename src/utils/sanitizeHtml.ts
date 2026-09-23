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

/** Minimal shape of the DOMPurify export the sanitizer needs. */
export interface DomPurifyLike {
  sanitize: (html: string, cfg: object) => string
}

/**
 * Build a sanitizer bound to a consumer-provided DOMPurify and the WYSIWYG
 * allowlist. DOMPurify is an optional peer that the library never imports
 * itself — keeping it out of the source means the built dist has no
 * `dompurify` specifier for a consumer's bundler to resolve.
 */
export function makeDomPurifySanitizer(dompurify: DomPurifyLike): (html: string) => string {
  return (html: string) => dompurify.sanitize(html, WYSIWYG_PURIFY_CONFIG)
}
