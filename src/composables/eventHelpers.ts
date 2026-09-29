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

// Modal channel (#98)
export const emitModalOpen = (payload: VibeEventMap['modal:open']): void =>
  emitEvent('modal:open', payload)

export const emitModalClose = (payload: VibeEventMap['modal:close']): void =>
  emitEvent('modal:close', payload)

export const onBeforeModalOpen = (
  handler: (payload: VibeEventMap['modal:beforeOpen']) => void,
): (() => void) => useEventBus().on('modal:beforeOpen', handler)

export const onBeforeModalClose = (
  handler: (payload: VibeEventMap['modal:beforeClose']) => void,
): (() => void) => useEventBus().on('modal:beforeClose', handler)

export const onModalOpened = (
  handler: (payload: VibeEventMap['modal:opened']) => void,
): (() => void) => useEventBus().on('modal:opened', handler)

export const onModalClosed = (
  handler: (payload: VibeEventMap['modal:closed']) => void,
): (() => void) => useEventBus().on('modal:closed', handler)
