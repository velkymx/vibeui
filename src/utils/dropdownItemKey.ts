import { routeKey } from './routeKey'
import { isDev } from '../composables/useEventBus'

/**
 * #133: shared v-for keying for item lists. Stable part from text/href/to,
 * always suffixed with the index so duplicates can never collide. Dividers
 * and headers have no natural key and rarely reorder, so they key by a
 * synthetic index token. A genuine actionable item (not a divider/header)
 * with none of text/href/to is a mistake, so a development warning is
 * emitted (key still falls back to the array index).
 */
export function dropdownItemKey(
  item: { text?: string; href?: string; to?: string | object; divider?: boolean; header?: boolean },
  index: number,
  component: string
): string | number {
  const stable = item.text || item.href || routeKey(item.to)
  if (stable) return `${stable}::${index}`
  if (item.divider || item.header) return `__sep-${index}`
  if (isDev()) {
    console.warn(
      `[${component}] An item has no text, href, or to, so its list key ` +
      'falls back to the array index. Index keys can cause incorrect DOM reuse if the ' +
      'menu reorders. Give actionable items a stable text or href.'
    )
  }
  return index
}
