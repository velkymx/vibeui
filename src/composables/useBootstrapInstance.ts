import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue'
import type { ComponentError } from '../types'

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

  const detach = (): void => {
    if (attachedEl && options.events) {
      for (const [type, handler] of Object.entries(options.events)) {
        attachedEl.removeEventListener(type, handler)
      }
    }
    attachedEl = null
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
      detach()
      if (instance.value) {
        options.disposeInstance(instance.value)
        instance.value = null
      }
      const bootstrap = await import('bootstrap')
      const target = options.resolveElement()
      // Guard: unmounted (or element swapped) while the import was in flight.
      if (!target || isUnmounted) return null
      instance.value = options.create(target, bootstrap)
      attachedEl = target
      if (options.events) {
        for (const [type, handler] of Object.entries(options.events)) {
          attachedEl.addEventListener(type, handler)
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

  const destroy = (): void => {
    pendingReinit = false
    detach()
    if (instance.value) {
      options.disposeInstance(instance.value)
      instance.value = null
    }
  }

  onBeforeUnmount(() => {
    isUnmounted = true
    destroy()
  })

  const get = (): TInstance | null => instance.value

  return { init, destroy, get, instance }
}
