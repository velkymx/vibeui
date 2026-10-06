# useDebouncedRef

Debounced ref primitive built on Vue's `customRef`. Writes commit after `delay` milliseconds of quiet; rapid rewrites reset the timer so the latest write wins.

```ts
import { ref } from 'vue'
import { useDebouncedRef } from '@velkymx/vibeui'

const query = ref('')
const debouncedQuery = useDebouncedRef('', 300)
```

## Signature

`useDebouncedRef<T>(initialValue: T, delay?: number | Ref<number> | (() => number))`

The delay is read through `toValue()` on each set, so a getter (for example a `debounce` prop) stays live. A delay of `0` or less commits synchronously. The pending timer is cleared on scope dispose, so unmounting never fires a stale commit.

## Internal use

`VibeDataTable` search and `VibeAutocomplete` query scheduling both use this composable instead of hand-rolled `setTimeout` timers.
