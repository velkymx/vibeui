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

// Tags that execute script or load external documents. Removed outright: they
// never belong in editor output and have no safe attributes worth keeping.
const SCRIPTABLE_TAGS = 'script, style, iframe, object, embed, form, base, link, meta'
// Attributes that navigate or fetch, so a dangerous scheme on them matters.
const URL_ATTRIBUTES = ['href', 'src', 'xlink:href', 'action', 'formaction', 'srcdoc']
const DANGEROUS_URL = /^\s*(javascript|vbscript)\s*:/i
const DANGEROUS_DATA_URL = /^\s*data\s*:\s*text\/html/i

/**
 * Built-in safety net used by VibeFormWysiwyg when the consumer provides no
 * sanitizer. This is NOT an allowlist (DOMPurify via makeDomPurifySanitizer
 * remains the recommended upgrade); it removes only the constructs that turn
 * stored editor HTML into script execution: scriptable/document-loading tags,
 * every on* handler attribute, and javascript:/vbscript:/data:text/html URLs on
 * navigable or fetchable attributes.
 *
 * Requires a DOM (document). In a non-DOM context it returns the input
 * unchanged, since there is nothing to parse against.
 */
export function fallbackSanitizeHtml(html: string): string {
  if (!html) return ''
  if (typeof document === 'undefined') return html

  const tpl = document.createElement('template')
  tpl.innerHTML = html

  tpl.content.querySelectorAll(SCRIPTABLE_TAGS).forEach((el) => {
    el.remove()
  })

  const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT)
  const elements: Element[] = []
  while (walker.nextNode()) elements.push(walker.currentNode as Element)

  for (const el of elements) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        continue
      }
      if (!URL_ATTRIBUTES.includes(name)) continue
      if (DANGEROUS_URL.test(attr.value) || DANGEROUS_DATA_URL.test(attr.value)) {
        el.removeAttribute(attr.name)
      }
    }
  }

  return tpl.innerHTML
}
