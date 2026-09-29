import { emitEvent } from '../composables/useEventBus'
import type { ComponentError } from '../types'

/**
 * Report a component error on both channels from one place: the component's
 * local `component-error` event (per-instance listeners) and the bus
 * `error:component` channel (app-wide observability).
 *
 * Every Bootstrap-backed component routes its errors through this helper, which
 * is what makes the bus the always-on anchor for error observability while
 * keeping the existing `@component-error` contract intact.
 */
export function reportComponentError(
  emit: (event: 'component-error', error: ComponentError) => void,
  error: ComponentError,
): void {
  emit('component-error', error)
  emitEvent('error:component', error)
}
