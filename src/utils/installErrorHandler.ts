import type { App } from 'vue'
import { emitEvent } from '../composables/useEventBus'
import type { ComponentError } from '../types'

type VueErrorHandler = NonNullable<App['config']['errorHandler']>

const componentNameOf = (instance: Parameters<VueErrorHandler>[1]): string => {
  // The public instance exposes resolved options ($options); the internal
  // `.type` is not reachable here. Fall back to Unknown when unnamed.
  const options = instance?.$options as { name?: string } | undefined
  return options?.name || 'Unknown'
}

/**
 * #154: opt-in routing of uncaught Vue render/lifecycle errors into the bus
 * `error:component` channel, so one observer sees both caught component errors
 * (via reportComponentError) and uncaught ones. A pre-existing consumer
 * `errorHandler` is chained (called first, inside try/finally so the bus
 * publish still runs), never overwritten. Call before app.mount().
 * Returns an uninstall function that restores the previous handler.
 */
export function installErrorHandler(app: App): () => void {
  const previous = app.config.errorHandler
  app.config.errorHandler = (err, instance, info) => {
    try {
      previous?.(err, instance, info)
    } finally {
      const payload: ComponentError = {
        message: err instanceof Error ? err.message : String(err),
        componentName: componentNameOf(instance),
        originalError: err,
      }
      emitEvent('error:component', payload)
    }
  }
  return () => {
    app.config.errorHandler = previous as VueErrorHandler | undefined
  }
}
