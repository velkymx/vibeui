import { useEventBus, emitEvent, registerSupportedEvent } from './useEventBus'

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

// Subscribe once at module load. This runs outside any component scope, so the
// dispatcher persists (it is not auto-torn-down with a component).
const bus = useEventBus()
bus.on('modal:open', ({ id, payload }) => {
  const controller = registry.get(id)
  if (controller) controller.open(payload)
  else emitEvent('error:unhandled', { event: 'modal:open', id, message: `modal:open for unknown id "${id}".` })
})
bus.on('modal:close', ({ id }) => {
  const controller = registry.get(id)
  if (controller) controller.close()
  else emitEvent('error:unhandled', { event: 'modal:close', id, message: `modal:close for unknown id "${id}".` })
})

registerSupportedEvent('modal:open', 'modal:close')

/** Register a modal's controller under its id. Returns an unregister function. */
export function registerModal(id: string, controller: ModalController): () => void {
  registry.set(id, controller)
  return () => {
    if (registry.get(id) === controller) registry.delete(id)
  }
}

/** Test-only: clear the id registry. */
export function __resetModalRegistry(): void {
  registry.clear()
}
