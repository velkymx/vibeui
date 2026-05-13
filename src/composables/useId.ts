import { getCurrentInstance } from 'vue'

let counter = 0
const instanceCounters = new WeakMap<object, number>()

export function useId(prefix = 'vibe'): string {
  const instance = getCurrentInstance()
  if (!instance) return `${prefix}-${++counter}`
  const n = (instanceCounters.get(instance) ?? 0) + 1
  instanceCounters.set(instance, n)
  return `${prefix}-${instance.uid}-${n}`
}

export function _resetIdCounter(): void {
  counter = 0
}
