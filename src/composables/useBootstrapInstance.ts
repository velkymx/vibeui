import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue'
import type { ComponentError } from '../types'

// One shared module load: per-owner imports would serialize multi-instance
// init (accordion panels, nav toggles) across separate load windows, staggering
// construction and leaking across test isolation boundaries. A rejection resets
// the cache so a later retry re-imports instead of replaying the failure.
let bootstrapPromise: Promise<typeof import('bootstrap')> | null = null
const loadBootstrap = (): Promise<typeof import('bootstrap')> => {
  if (!bootstrapPromise) {
    bootstrapPromise = import('bootstrap').catch((error: unknown) => {
      bootstrapPromise = null
      throw error
    })
  }
  return bootstrapPromise
}

export interface UseBootstrapInstanceOptions<TInstance> {
  /** Resolves the target element at call time (template refs go null during teardown). */
  resolveElement: () => HTMLElement | null
  /**
   * Constructs the instance. Receives the lazily imported Bootstrap module so
   * the component never imports Bootstrap itself (keeps the async chunk split).
   */
  create: (el: HTMLElement, bootstrap: typeof import('bootstrap')) => TInstance
  /** Disposes the instance, e.g. `(i) => i.dispose()`. */
  disposeInstance: (instance: TInstance) => void
  /** Bootstrap DOM event name to handler, attached per instance lifetime. */
  events?: Record<string, EventListener>
  /** Component name for error reports. */
  componentName: string
  /** Called with structured errors (load failure, post-teardown race swallowed silently). */
  onError: (error: ComponentError) => void
  /**
   * Skip the automatic onBeforeUnmount teardown. For non-component owners
   * (directives, keyed maps) that call teardown() from their own unmount path.
   */
  manualTeardown?: boolean
}

/**
 * Owns one Bootstrap JS instance lifecycle: lazy async construction against a
 * freshly resolved element, event attach/detach on the attached element (never
 * the template ref, which can be null at teardown), dispose plus nulling, and
 * unmount-race guards on every path. Replaces the hand-rolled copies (see #230).
 */
export function useBootstrapInstance<TInstance>(options: UseBootstrapInstanceOptions<TInstance>) {
  const instance: ShallowRef<TInstance | null> = shallowRef(null)
  let attachedEl: HTMLElement | null = null
  let initInFlight = false
  let pendingReinit = false
  let isUnmounted = false
  // #271 follow-up: Bootstrap sets _isTransitioning on Modal/Collapse only
  // (Carousel sets _isSliding; Toast/Offcanvas/Tooltip/Tab set nothing) while
  // all of them queue transition callbacks. So the composable also tracks
  // in-flight transitions from the event pairs it already listens to.
  let transitionPending = false
  const attachedWrappers = new Map<string, EventListener>()

  const markTransitionEvent = (type: string): void => {
    const local = type.split('.')[0]
    if (local === 'show' || local === 'hide' || local === 'slide') {
      transitionPending = true
    } else if (local === 'shown' || local === 'hidden' || local === 'slid') {
      transitionPending = false
    }
  }

  const detach = (): void => {
    if (attachedEl && options.events) {
      for (const [type, handler] of Object.entries(options.events)) {
        attachedEl.removeEventListener(type, attachedWrappers.get(type) ?? handler)
      }
    }
    attachedEl = null
    attachedWrappers.clear()
  }

  const init = async (): Promise<TInstance | null> => {
    const el = options.resolveElement()
    if (!el || isUnmounted) return null
    if (initInFlight) {
      pendingReinit = true
      return instance.value
    }
    initInFlight = true
    try {
      if (instance.value) {
        // A reinit must replace, not duplicate, the registry entry: wait out
        // any in-flight transition (listeners stay attached so the completion
        // event clears the pending mark), then detach and dispose
        // synchronously BEFORE the new instance is created (a deferred
        // dispose would clear the new entry).
        const live = instance.value
        instance.value = null
        await settleLive(live)
        detach()
        options.disposeInstance(live)
      } else {
        detach()
      }
      const bootstrap = await loadBootstrap()
      const target = options.resolveElement()
      // Guard: unmounted (or element swapped) while the import was in flight.
      if (!target || isUnmounted) return null
      instance.value = options.create(target, bootstrap)
      attachedEl = target
      transitionPending = false
      if (options.events) {
        for (const [type, handler] of Object.entries(options.events)) {
          const wrapped: EventListener = (event) => {
            markTransitionEvent(type)
            handler(event)
          }
          attachedWrappers.set(type, wrapped)
          attachedEl.addEventListener(type, wrapped)
        }
      }
      return instance.value
    } catch (error) {
      // A teardown race is not a load failure: stay silent when unmounted.
      if (isUnmounted) return null
      options.onError({
        message: 'Bootstrap JS not loaded. Component will use data attributes only.',
        componentName: options.componentName,
        originalError: error
      })
      return null
    } finally {
      initInFlight = false
      if (!isUnmounted && pendingReinit) {
        pendingReinit = false
        void init()
      } else {
        pendingReinit = false
      }
    }
  }

  // #271: disposing a Bootstrap instance mid-transition nulls the props its
  // queued emulated-duration callback still dereferences, throwing on the
  // detached element. Skipping dispose entirely leaks: Bootstrap keeps
  // instances in a strong element Map (dom/data.js) that only dispose() clears.
  // So defer dispose until the transition settles (poll its own flag), with a
  // capped fallback so a flag that never clears cannot leak forever.
  const DISPOSE_POLL_MS = 25
  const DISPOSE_MAX_WAIT_MS = 1000
  let disposeTimer: ReturnType<typeof setInterval> | null = null

  const isTransitioning = (inst: TInstance): boolean => {
    const flags = inst as unknown as { _isTransitioning?: unknown; _isSliding?: unknown }
    return flags._isTransitioning === true || flags._isSliding === true
  }

  // A transition is in flight when Bootstrap says so (Modal/Collapse flag,
  // Carousel slide flag) or when our own listeners saw an opening event
  // without its completion (covers the flagless Toast/Offcanvas/Tooltip/Tab).
  const transitionInFlight = (inst: TInstance): boolean =>
    isTransitioning(inst) || transitionPending

  // Promise version of the settle wait for paths that must dispose
  // synchronously afterwards (reinit replaces the registry entry, so the old
  // dispose must land before the new instance is created).
  const settleLive = (live: TInstance): Promise<void> => {
    if (!transitionInFlight(live)) return Promise.resolve()
    return new Promise((resolve) => {
      let waited = 0
      const timer = setInterval(() => {
        waited += DISPOSE_POLL_MS
        if (transitionInFlight(live) && waited < DISPOSE_MAX_WAIT_MS) return
        clearInterval(timer)
        resolve()
      }, DISPOSE_POLL_MS)
    })
  }

  const destroy = (): void => {
    pendingReinit = false
    const live = instance.value
    if (!live) {
      detach()
      return
    }
    // Drop our reference immediately so get()/exposes reflect teardown.
    instance.value = null
    if (!transitionInFlight(live)) {
      detach()
      options.disposeInstance(live)
      return
    }
    // Deferred: keep our listeners attached until dispose lands, so the
    // completion event clears transitionPending promptly. Detach then.
    if (disposeTimer) return
    let waited = 0
    disposeTimer = setInterval(() => {
      waited += DISPOSE_POLL_MS
      if (transitionInFlight(live) && waited < DISPOSE_MAX_WAIT_MS) return
      if (disposeTimer) {
        clearInterval(disposeTimer)
        disposeTimer = null
      }
      detach()
      options.disposeInstance(live)
    }, DISPOSE_POLL_MS)
  }

  // Manual teardown for non-component owners (see manualTeardown): flags
  // in-flight runs as stale and disposes the live instance. Post-teardown
  // init stays dead; owners that remount create a fresh owner instead.
  const teardown = (): void => {
    isUnmounted = true
    destroy()
  }

  if (!options.manualTeardown) {
    onBeforeUnmount(teardown)
  }

  const get = (): TInstance | null => instance.value

  return { init, destroy, get, instance, teardown }
}

/**
 * Keyed multi-owner for components managing one Bootstrap instance per
 * element (tab strips, nav dropdowns, accordion panels). Each element gets
 * its own single owner (manual teardown); the map tears all down on
 * unmount. Event maps and error reporting are shared across entries.
 */
export function useBootstrapInstanceMap<TInstance>(
  options: Omit<UseBootstrapInstanceOptions<TInstance>, 'resolveElement' | 'manualTeardown'>
) {
  type Owner = ReturnType<typeof useBootstrapInstance<TInstance>>
  const owners = new Map<HTMLElement, Owner>()
  // Live instances by element, for escape-hatch exposes (not reactive: the
  // map is replaced entry-wise, never iterated in render).
  const instances = new Map<HTMLElement, TInstance>()
  let isUnmounted = false

  const ensure = async (el: HTMLElement | null): Promise<TInstance | null> => {
    if (!el || isUnmounted) return null
    let owner = owners.get(el)
    if (!owner) {
      owner = useBootstrapInstance<TInstance>({
        ...options,
        manualTeardown: true,
        resolveElement: () => el
      })
      owners.set(el, owner)
    } else {
      // Live entry: return it without reconstructing (init() always rebuilds).
      const live = owner.get()
      if (live) {
        instances.set(el, live)
        return live
      }
    }
    const inst = await owner.init()
    if (inst) instances.set(el, inst)
    return inst
  }

  const get = (el: HTMLElement): TInstance | null => owners.get(el)?.get() ?? null

  const has = (el: HTMLElement): boolean => owners.has(el)

  const disposeEl = (el: HTMLElement): void => {
    owners.get(el)?.destroy()
    owners.delete(el)
    instances.delete(el)
  }

  const disposeAll = (): void => {
    for (const owner of owners.values()) owner.destroy()
    owners.clear()
    instances.clear()
  }

  const teardown = (): void => {
    isUnmounted = true
    // Invalidate in-flight owners too: destroy() alone would leave their
    // post-import guards green to construct on detached elements.
    for (const owner of owners.values()) owner.teardown()
    owners.clear()
    instances.clear()
  }

  onBeforeUnmount(teardown)

  return { ensure, get, has, disposeEl, disposeAll, teardown, instances }
}
