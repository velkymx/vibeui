import { useId as vueUseId } from 'vue'

/**
 * #146: SSR-safe unique id with a VibeUI prefix. Delegates to Vue's native
 * `useId()` (3.5+), which produces ids that match between server and client,
 * avoiding hydration mismatches. Call once in `setup()`; the prefix keeps ids
 * human-readable in the DOM (e.g. `modal-...`).
 */
export function useId(prefix = 'vibe'): string {
  return `${prefix}-${vueUseId()}`
}
