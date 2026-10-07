import { inject, type InjectionKey } from 'vue'
import type { VibeDefaults } from '../types'

/** App-level defaults provided by `app.use(VibeUI, { defaults })`. */
export const VIBE_DEFAULTS_KEY: InjectionKey<VibeDefaults> = Symbol('vibe-defaults')

/**
 * #159: read the library-wide defaults (empty object when the plugin was
 * installed without them, so resolution is a no-op and behavior unchanged).
 */
export function useVibeDefaults(): VibeDefaults {
  return inject(VIBE_DEFAULTS_KEY, {})
}

/**
 * #159: single precedence rule shared by every component: explicit per-instance
 * prop wins, then the injected global default, then the component builtin.
 * Nullish-only fallthrough keeps explicit falsy values (false, '', 0) intact.
 */
export function resolveProp<T>(prop: T | undefined, global: T | undefined, builtin: T): T {
  return prop ?? global ?? builtin
}
