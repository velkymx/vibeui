import { getCurrentInstance } from 'vue'

let counter = 0

/**
 * Composable to generate a unique ID for a component instance.
 * SSR-friendly by incorporating instance UID if available.
 */
export function useId(prefix = 'vibe'): string {
  const instance = getCurrentInstance()
  const uid = instance ? (instance as any).uid : 'no-instance'
  counter++
  return `${prefix}-${uid}-${counter}`
}
