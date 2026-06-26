/**
 * Produces a stable, unique string key from a vue-router `to` value.
 *
 * `String(obj)` → '[object Object]' for every distinct route object,
 * causing Vue to assign identical :key values and silently corrupt DOM
 * patching when consumers pass named-route objects.
 *
 * JSON.stringify preserves object identity while remaining deterministic
 * for the same route shape, giving Vue a unique patch key.
 */
export function routeKey(to: string | object | undefined): string {
  if (to === undefined || to === null) return ''
  if (typeof to === 'string') return to
  return JSON.stringify(to)
}
