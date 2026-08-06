/**
 * Build the mutually exclusive `href` / `to` bindings for a link-ish element.
 *
 * The unused key must be OMITTED, not bound to `undefined`. When the rendered
 * tag is `router-link`, every prop the template binds that RouterLink does not
 * declare lands in its fallthrough attrs, and Vue's `mergeProps` copies those
 * over the anchor RouterLink itself rendered — including `undefined` values.
 * So `:href="undefined"` erases the href RouterLink resolved from `to`, leaving
 * a dead `<a>` with no href. Binding this object with `v-bind` keeps the key out.
 *
 * `href` wins when both are supplied, matching the tag-selection logic in the
 * components that call this. Callers pass `href` through `safeHref()` first
 * where sanitizing applies.
 */
export function linkBindings(
  href: string | undefined,
  to: string | object | undefined
): { href: string } | { to: string | object } | Record<string, never> {
  if (href) return { href }
  return to ? { to } : {}
}
