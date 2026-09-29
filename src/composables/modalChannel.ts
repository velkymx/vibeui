import { onPersistent, emitEvent } from './useEventBus'

/**
 * Modal command routing for the event bus (#98).
 *
 * Every VibeModal listens for its own id, so the bus always has a handler for
 * `modal:open` / `modal:close` and the foundation's zero-handler guard cannot
 * detect an unknown id. This module keeps an id -> controller registry and a
 * single dispatcher that routes commands to the right modal, or reports
 * `error:unhandled` when no modal claims the id.
 */

export interface ModalController {
  open: (payload?: unknown) => void
  close: () => void
}

const registry = new Map<string, ModalController>()

// Subscribe once at module load, persistently, so the dispatcher survives an SSR
// reset (resetEventBusForSSR keeps onPersistent handlers) and is not auto-torn-
// down with any component.
onPersistent('modal:open', ({ id, payload }) => {
  const controller = registry.get(id)
  if (controller) controller.open(payload)
  else emitEvent('error:unhandled', { event: 'modal:open', id, message: `modal:open for unknown id "${id}".` })
})
onPersistent('modal:close', ({ id }) => {
  const controller = registry.get(id)
  if (controller) controller.close()
  else emitEvent('error:unhandled', { event: 'modal:close', id, message: `modal:close for unknown id "${id}".` })
})

// Note: no registerSupportedEvent here. The dispatcher above always handles
// modal:open / modal:close, so the foundation's zero-handler guard never applies;
// unknown ids are reported by the dispatcher itself.

/** Register a modal's controller under its id. Returns an unregister function. */
export function registerModal(id: string, controller: ModalController): () => void {
  // Ids must be unique: the registry is last-wins, so a duplicate silently hides
  // the first modal from the bus. Warn in development to surface the mistake.
  if (import.meta.env.DEV && registry.has(id)) {
    console.warn(`[VibeUI] A modal with id "${id}" is already registered on the event bus; the later one overrides it. Use unique ids.`)
  }
  registry.set(id, controller)
  return () => {
    if (registry.get(id) === controller) registry.delete(id)
  }
}

/** Test-only: clear the id registry. */
export function __resetModalRegistry(): void {
  registry.clear()
}
