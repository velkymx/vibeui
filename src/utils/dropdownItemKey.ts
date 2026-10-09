import { routeKey } from './routeKey'
import type { DropdownItem } from '../types'
import { isDev } from '../composables/useEventBus'

/**
 * #133: shared v-for keying for DropdownItem lists (VibeDropdown and the
 * Nav/NavbarNav submenu children). A stable key comes from text/href/to.
 * Dividers and headers have no natural key and rarely reorder, so they key by a
 * synthetic index token. A genuine actionable item (not a divider/header) with
 * none of text/href/to is a mistake, so its key falls back to the array index
 * and a development warning is emitted.
 */
export function dropdownItemKey(item: DropdownItem, index: number, component: string): string | number {
  const key = item.text || item.href || routeKey(item.to)
  if (key) return key
  if (item.divider || item.header) return `__sep-${index}`
  if (isDev()) {
    console.warn(
      `[${component}] A dropdown item has no text, href, or to, so its list key ` +
      'falls back to the array index. Index keys can cause incorrect DOM reuse if the ' +
      'menu reorders. Give actionable items a stable text or href.'
    )
  }
  return index
}
