import { customRef, onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * #158: debounced ref primitive (customRef-based). Writes commit after `delay`
 * ms of quiet; rapid rewrites reset the timer so the latest write wins. The
 * delay is read through `toValue()` on each set, so a getter (e.g. a prop)
 * stays live. A delay <= 0 commits synchronously. The pending timer is cleared
 * on scope dispose, so unmounting never fires a stale commit.
 */
export function useDebouncedRef<T>(initialValue: T, delay: MaybeRefOrGetter<number> = 300) {
  let value = initialValue
  let timer: ReturnType<typeof setTimeout> | null = null
  onScopeDispose(() => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  })
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(v: T) {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      if (toValue(delay) <= 0) {
        value = v
        trigger()
        return
      }
      timer = setTimeout(() => {
        timer = null
        value = v
        trigger()
      }, toValue(delay))
    },
  }))
}
