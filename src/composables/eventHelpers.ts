import { useEventBus, emitEvent } from './useEventBus'
import type { VibeEventMap } from '../types'

/**
 * Lifecycle-style helpers for the library's event-bus channels. `emit*` triggers
 * a command; `on*` subscribes to a lifecycle event and, when called in a
 * component scope, auto-unsubscribes on unmount (see `useEventBus`).
 *
 * These are thin, typed wrappers over `useEventBus()`; use the bus directly for
 * your own custom events.
 */

// Notification channel (#97)
export const emitNotificationShow = (payload: VibeEventMap['notification:show']): void =>
  emitEvent('notification:show', payload)

export const emitNotificationDismiss = (payload: VibeEventMap['notification:dismiss']): void =>
  emitEvent('notification:dismiss', payload)

export const onNotificationShown = (
  handler: (payload: VibeEventMap['notification:shown']) => void,
): (() => void) => useEventBus().on('notification:shown', handler)

export const onNotificationDismissed = (
  handler: (payload: VibeEventMap['notification:dismissed']) => void,
): (() => void) => useEventBus().on('notification:dismissed', handler)
