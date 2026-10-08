import { safeColor } from './safeCss'

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
// WHATWG URL parsing strips ASCII whitespace/control characters before scheme
// extraction, so `java<TAB>script:` navigates as javascript:. De-obfuscate
// before testing, or the anchored regexes below are bypassable (see #222).
const SCHEME_OBFUSCATION = /[\u0000-\u0020]+/g
// Inline documents are never safe as navigation/fetch targets. Only raster
// images on <img src> keep their data: URLs (pasted/dragged uploads).
const SAFE_DATA_URL = /^data:image\/(png|jpe?g|gif|webp);base64,[a-zA-Z0-9+/=]+$/
// Quill's own color/background toolbar renders these as inline styles, so they
// stay; everything else (position, background-image/url(...), width tricks for
// overlay phishing) goes.
const SAFE_STYLE_PROPS = new Set(['color', 'background-color'])

const sanitizeStyleAttribute = (el: Element): void => {
  const raw = el.getAttribute('style')
  if (raw === null) return
  const kept: string[] = []
  for (const declaration of raw.split(';')) {
    const colon = declaration.indexOf(':')
    if (colon === -1) continue
    const prop = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).trim()
    if (!SAFE_STYLE_PROPS.has(prop)) continue
    // safeColor's var() branch permits a url() fallback, so reject url(
    // explicitly: a style value must never fetch.
    if (value.includes('url(')) continue
    if (safeColor(value) === undefined) continue
    kept.push(`${prop}: ${value}`)
  }
  if (kept.length > 0) el.setAttribute('style', kept.join('; '))
  else el.removeAttribute('style')
}

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
      if (name === 'style') {
        sanitizeStyleAttribute(el)
        continue
      }
      if (!URL_ATTRIBUTES.includes(name)) continue
      const deobfuscated = attr.value.replace(SCHEME_OBFUSCATION, '')
      if (DANGEROUS_URL.test(deobfuscated) || DANGEROUS_DATA_URL.test(deobfuscated)) {
        el.removeAttribute(attr.name)
        continue
      }
      if (/^\s*data\s*:/i.test(deobfuscated)) {
        const isImgSrc = el.tagName === 'IMG' && name === 'src'
        if (!isImgSrc || !SAFE_DATA_URL.test(deobfuscated)) {
          el.removeAttribute(attr.name)
        }
      }
    }
    if (el.tagName === 'A' && el.getAttribute('target') === '_blank') {
      const rel = (el.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean)
      if (!rel.includes('noopener')) rel.push('noopener')
      el.setAttribute('rel', rel.join(' '))
    }
  }

  return tpl.innerHTML
}
