import { onPersistent, emitEvent, isDev, registerSSRReset } from './useEventBus'

/**
 * Offcanvas + layout command routing for the event bus (#100).
 *
 * Mirrors the modal channel: every VibeOffcanvas listens for its own id, so the
 * bus always has a handler and the foundation's zero-handler guard cannot detect
 * an unknown id. This module keeps an id -> controller registry plus a single
 * designated "sidebar" for `layout:sidebar-toggle`, and reports `error:unhandled`
 * when a command targets an id (or sidebar) that is not registered.
 */

export interface OffcanvasController {
  open: () => void
  close: () => void
  toggle: () => void
}

const registry = new Map<string, OffcanvasController>()
let sidebarId: string | null = null

function route(id: string, action: keyof OffcanvasController, event: string): void {
  const controller = registry.get(id)
  if (controller) controller[action]()
  else emitEvent('error:unhandled', { event, id, message: `${event} for unknown id "${id}".` })
}

// Persistent module-load subscriptions: they survive an SSR reset (see
// onPersistent) so the command dispatchers keep working across requests.
onPersistent('offcanvas:open', ({ id }) => route(id, 'open', 'offcanvas:open'))
onPersistent('offcanvas:close', ({ id }) => route(id, 'close', 'offcanvas:close'))
onPersistent('offcanvas:toggle', ({ id }) => route(id, 'toggle', 'offcanvas:toggle'))
onPersistent('layout:sidebar-toggle', () => {
  const controller = sidebarId ? registry.get(sidebarId) : undefined
  if (controller) controller.toggle()
  else emitEvent('error:unhandled', {
    event: 'layout:sidebar-toggle',
    message: 'layout:sidebar-toggle emitted but no VibeOffcanvas has the `sidebar` prop.',
  })
})

// Note: no registerSupportedEvent here. The dispatchers above always handle the
// offcanvas / layout commands, so the foundation's zero-handler guard never
// applies; unknown ids (and a missing sidebar) are reported by the dispatchers.

/**
 * Register an offcanvas controller under its id. Pass `isSidebar` to make it the
 * target of `layout:sidebar-toggle`. Returns an unregister function.
 */
export function registerOffcanvas(id: string, controller: OffcanvasController, isSidebar: boolean): () => void {
  // Ids must be unique: the registry is last-wins, so a duplicate silently hides
  // the first offcanvas from the bus. Warn in development to surface the mistake.
  if (isDev() && registry.has(id)) {
    console.warn(`[VibeUI] An offcanvas with id "${id}" is already registered on the event bus; the later one overrides it. Use unique ids.`)
  }
  registry.set(id, controller)
  if (isSidebar) sidebarId = id
  return () => {
    if (registry.get(id) === controller) registry.delete(id)
    if (sidebarId === id) sidebarId = null
  }
}

/** Request boundary: drop registrations plus the captured sidebar id (SSR). */
export function resetOffcanvasRegistryForSSR(): void {
  registry.clear()
  sidebarId = null
}

registerSSRReset(resetOffcanvasRegistryForSSR)

/** Test-only: clear the registry and sidebar designation. */
export function __resetOffcanvasRegistry(): void {
  resetOffcanvasRegistryForSSR()
}
