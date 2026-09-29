import { onPersistent, emitEvent, registerSupportedEvent } from './useEventBus'

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

registerSupportedEvent('offcanvas:open', 'offcanvas:close', 'offcanvas:toggle', 'layout:sidebar-toggle')

/**
 * Register an offcanvas controller under its id. Pass `isSidebar` to make it the
 * target of `layout:sidebar-toggle`. Returns an unregister function.
 */
export function registerOffcanvas(id: string, controller: OffcanvasController, isSidebar: boolean): () => void {
  registry.set(id, controller)
  if (isSidebar) sidebarId = id
  return () => {
    if (registry.get(id) === controller) registry.delete(id)
    if (sidebarId === id) sidebarId = null
  }
}

/** Test-only: clear the registry and sidebar designation. */
export function __resetOffcanvasRegistry(): void {
  registry.clear()
  sidebarId = null
}
