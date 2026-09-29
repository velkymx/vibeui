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

/** The public, typed bus surface. */
export interface VibeEventBus {
  on<K extends VibeEventKey>(event: K, handler: (payload: VibePayloadOf<K>) => void): () => void
  once<K extends VibeEventKey>(event: K, handler: (payload: VibePayloadOf<K>) => void): () => void
  off<K extends VibeEventKey>(event: K, handler: (payload: VibePayloadOf<K>) => void): void
  emit<K extends VibeEventKey>(event: K, payload: VibePayloadOf<K>): void
  clear(): void
}

// Module-level registries. `handlers` is per-app subscription state (reset on
// SSR); `supported` is a static registration of Tier 1 events that require a
// target, contributed by channel modules at import time.
const handlers = new Map<string, Set<Handler>>()
const supported = new Set<string>()

const ERROR_COMPONENT = 'error:component'
const ERROR_UNHANDLED = 'error:unhandled'
const isErrorChannel = (event: string): boolean => event.startsWith('error:')

const isDev = (): boolean => {
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
        // eslint-disable-next-line no-console
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

function once(event: string, handler: Handler): () => void {
  const off = on(event, (payload) => {
    off()
    handler(payload)
  })
  return off
}

function off(event: string, handler: Handler): void {
  const set = handlers.get(event)
  if (!set) return
  set.delete(handler)
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
      // eslint-disable-next-line no-console
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
export function emitEvent<K extends VibeEventKey>(event: K, payload: VibePayloadOf<K>): void {
  emit(event as string, payload)
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
 * leaking handlers across requests (the bus is a module singleton). Does not
 * touch the static supported-event registry.
 */
export function resetEventBusForSSR(): void {
  handlers.clear()
}

/** Test-only: reset both handlers and the supported-event registry. */
export function __resetEventBusForTests(): void {
  handlers.clear()
  supported.clear()
}
