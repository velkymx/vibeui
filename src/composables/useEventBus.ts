import { getCurrentScope, onScopeDispose } from 'vue'
import type { ComponentError, VibeEventMap } from '../types'

/**
 * VibeUI event bus.
 *
 * An always-on, zero-dependency, module-singleton pub/sub primitive. Vue 3
 * removed the instance event bus; VibeUI re-internalizes it so a single bus is
 * live the moment the library loads. The framework publishes to it directly
 * (see `emitEvent`); consumers hook in with `useEventBus()`.
 *
 * The singleton is created eagerly at module load: importing this module is the
 * only initialization. `useEventBus()` is an accessor, not an initializer.
 */

type Handler = (payload: unknown) => void

/**
 * Any event name: a declared key keeps its literal type (strict payload), while
 * `string & {}` still admits arbitrary ad-hoc events (payload `unknown`).
 */
export type VibeEventKey = keyof VibeEventMap | (string & {})
/** Strict payload for a declared event, `unknown` for an ad-hoc one. */
export type VibePayloadOf<K> = K extends keyof VibeEventMap ? VibeEventMap[K] : unknown

/**
 * Emit arguments for an event: no payload arg for a `void` event (e.g.
 * `layout:sidebar-toggle`), a required payload for every other declared event.
 */
export type VibeEmitArgs<K> = VibePayloadOf<K> extends void ? [] : [payload: VibePayloadOf<K>]

/** The public, typed bus surface. */
export interface VibeEventBus {
  on<K extends VibeEventKey>(event: K, handler: (payload: VibePayloadOf<K>) => void): () => void
  once<K extends VibeEventKey>(event: K, handler: (payload: VibePayloadOf<K>) => void): () => void
  off<K extends VibeEventKey>(event: K, handler: (payload: VibePayloadOf<K>) => void): void
  emit<K extends VibeEventKey>(event: K, ...args: VibeEmitArgs<K>): void
  clear(): void
}

// Module-level registries. `handlers` is per-app subscription state (reset on
// SSR); `supported` is a static registration of Tier 1 events that require a
// target, contributed by channel modules at import time. `persistentHandlers`
// tracks library subscriptions wired once at module load (channel dispatchers,
// the theme handler) so an SSR reset does not remove them.
const handlers = new Map<string, Set<Handler>>()
const supported = new Set<string>()
const persistentHandlers = new Set<Handler>()

const ERROR_COMPONENT = 'error:component'
const ERROR_UNHANDLED = 'error:unhandled'
const isErrorChannel = (event: string): boolean => event.startsWith('error:')

/**
 * Guarded development check: the only `import.meta.env` read in `src/`.
 * Every other module routes through this so a plain-Node ESM import (where
 * `import.meta` has no `env`) never throws at module scope (see #231).
 */
export const isDev = (): boolean => {
  try {
    return !!import.meta.env && import.meta.env.DEV
  } catch {
    return false
  }
}

// Invoke every handler for an event, isolating throws so one bad subscriber
// cannot break the others or the emit call. A throw is surfaced on the error
// channel, except when it happens *inside* the error channel itself, which
// would recurse — there it is only logged.
function dispatch(event: string, payload: unknown): void {
  const set = handlers.get(event)
  if (!set || set.size === 0) return
  // Snapshot so once()/off() mutations during dispatch are safe.
  for (const handler of [...set]) {
    try {
      handler(payload)
    } catch (originalError) {
      if (isDev()) {
        console.error(`[VibeUI EventBus] a handler for "${event}" threw:`, originalError)
      }
      if (!isErrorChannel(event)) {
        const err: ComponentError = {
          message: `An event handler for "${event}" threw.`,
          componentName: 'EventBus',
          originalError,
        }
        dispatch(ERROR_COMPONENT, err)
      }
    }
  }
}

function on(event: string, handler: Handler): () => void {
  let set = handlers.get(event)
  if (!set) {
    set = new Set()
    handlers.set(event, set)
  }
  set.add(handler)

  const off = (): void => {
    const current = handlers.get(event)
    if (!current) return
    current.delete(handler)
    if (current.size === 0) handlers.delete(event)
  }

  // Auto-cleanup: when called inside a component/effect scope, unsubscribe on
  // teardown so pervasive use never leaks. Behaves like a lifecycle hook.
  if (getCurrentScope()) onScopeDispose(off)

  return off
}

// Maps an original once() handler to its stored wrapper, so off(event, h)
// removes the wrapper even when the caller discarded the returned closure.
const onceWrappers = new Map<Handler, () => void>()

function once(event: string, handler: Handler): () => void {
  const off = on(event, (payload) => {
    off()
    onceWrappers.delete(handler)
    handler(payload)
  })
  onceWrappers.set(handler, off)
  const unsubscribe = () => {
    off()
    onceWrappers.delete(handler)
  }
  return unsubscribe
}

function off(event: string, handler: Handler): void {
  const set = handlers.get(event)
  if (!set) return
  // Unwrap once() registrations: callers hold the original reference, but the
  // set holds the wrapper. Invoke the stored unsubscribe closure (which deletes
  // the wrapper and clears the map entry) instead of deleting by reference.
  const unsubscribe = onceWrappers.get(handler)
  if (unsubscribe) {
    unsubscribe()
  } else {
    set.delete(handler)
  }
  if (set.size === 0) handlers.delete(event)
}

function emit(event: string, payload?: unknown): void {
  const set = handlers.get(event)
  const hasHandler = !!set && set.size > 0

  dispatch(event, payload)

  // Unhandled supported-event guard: a Tier 1 event promises "emit and VibeUI
  // acts". If one is emitted with no target, fail loud on the error channel
  // rather than silently no-op. Never applies to the error channel (recursion).
  if (!hasHandler && supported.has(event) && !isErrorChannel(event)) {
    const message = `"${event}" was emitted but nothing is registered to handle it.`
    dispatch(ERROR_UNHANDLED, { event, message })
    if (isDev()) {
      console.error(`[VibeUI EventBus] ${message}`)
    }
  }
}

function clear(): void {
  handlers.clear()
}

// The eager singleton. Created at module load, before any consumer touches it.
const bus: VibeEventBus = { on, once, off, emit, clear } as VibeEventBus

/** Accessor for the live, already-running event bus singleton. */
export function useEventBus(): VibeEventBus {
  return bus
}

/**
 * Internal publish path for framework code and channel modules, so components
 * can emit without calling `useEventBus()`. Same registry as the public bus.
 */
export function emitEvent<K extends VibeEventKey>(event: K, ...args: VibeEmitArgs<K>): void {
  emit(event as string, args[0])
}

/**
 * Subscribe a persistent handler: like `on`, but it survives
 * `resetEventBusForSSR()`. Used by the library's module-load command dispatchers
 * (modal, offcanvas) and the theme handler, which must stay wired for the whole
 * process, not just one SSR request. Called outside a component scope, so there
 * is no auto-cleanup to attach. Returns an unsubscribe function.
 */
export function onPersistent<K extends VibeEventKey>(
  event: K,
  handler: (payload: VibePayloadOf<K>) => void,
): () => void {
  const h = handler as Handler
  persistentHandlers.add(h)
  const off = on(event as string, h)
  return () => {
    persistentHandlers.delete(h)
    off()
  }
}

/**
 * Register Tier 1 supported events (those that require a target). Channel
 * modules call this at import time so the unhandled-event guard knows which
 * events must be handled.
 */
export function registerSupportedEvent(...events: string[]): void {
  for (const event of events) supported.add(event)
}

/**
 * Clear per-app subscription state. Call once per request in SSR to avoid
 * leaking handlers across requests (the bus is a module singleton). Persistent
 * library subscriptions (see `onPersistent`) and the static supported-event
 * registry are kept, so the built-in channels keep working after a reset.
 * Channel plus theme modules register their own per-request clearers via
 * `registerSSRReset`, so this one call also drops modal/offcanvas
 * registrations and restores theme isolation (see #231).
 */
export function resetEventBusForSSR(): void {
  for (const [event, set] of handlers) {
    for (const handler of [...set]) {
      if (!persistentHandlers.has(handler)) set.delete(handler)
    }
    if (set.size === 0) handlers.delete(event)
  }
  // Channel registries are keyed by component id, not by subscription: they
  // must be cleared on the same boundary or request B routes into request
  // A's disposed controllers.
  for (const resetter of [...ssrResets]) resetter()
  // once() wrappers removed from the sets above would otherwise strand their
  // original-to-wrapper entries across requests.
  onceWrappers.clear()
}

/**
 * Module-level per-request clearers (channel registries, theme state) run by
 * `resetEventBusForSSR`. A hook instead of direct imports: the channel modules
 * already import this module, so importing them back would cycle (see #231).
 */
const ssrResets = new Set<() => void>()
export function registerSSRReset(resetter: () => void): void {
  ssrResets.add(resetter)
}

/** Test-only: reset handlers, the supported-event registry, and persistents. */
export function __resetEventBusForTests(): void {
  handlers.clear()
  supported.clear()
  persistentHandlers.clear()
  onceWrappers.clear()
}
