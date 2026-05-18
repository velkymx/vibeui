import { reactive, readonly, type DeepReadonly } from 'vue'
import type { Variant, ToastPlacement } from '../types'

export interface ToastSpec {
  id: string
  title?: string
  body: string
  variant?: Variant
  placement?: ToastPlacement
  autohide?: boolean
  delay?: number
}

export interface ToastShowOptions {
  id?: string
  title?: string
  variant?: Variant
  placement?: ToastPlacement
  autohide?: boolean
  delay?: number
}

interface ToastStore {
  toasts: ToastSpec[]
}

const store = reactive<ToastStore>({ toasts: [] })
let counter = 0

const nextId = (): string => {
  counter += 1
  return `vibe-toast-${counter}`
}

const push = (body: string, options: ToastShowOptions): ToastSpec => {
  const id = options.id ?? nextId()
  // Bug fix: deduplicate by id — update in place if a toast with the same id
  // already exists, preventing a permanently undismissable duplicate.
  const existingIdx = store.toasts.findIndex(t => t.id === id)
  if (existingIdx !== -1) {
    const updated: ToastSpec = {
      id,
      body,
      title: options.title,
      variant: options.variant,
      placement: options.placement,
      autohide: options.autohide,
      delay: options.delay
    }
    Object.assign(store.toasts[existingIdx], updated)
    return store.toasts[existingIdx]
  }
  const spec: ToastSpec = {
    id,
    body,
    title: options.title,
    variant: options.variant,
    placement: options.placement,
    autohide: options.autohide,
    delay: options.delay
  }
  store.toasts.push(spec)
  return spec
}

const dismissById = (id: string): boolean => {
  const idx = store.toasts.findIndex(t => t.id === id)
  if (idx === -1) return false
  store.toasts.splice(idx, 1)
  return true
}

const clear = (): void => {
  store.toasts.splice(0, store.toasts.length)
}

export interface UseToastReturn {
  toasts: DeepReadonly<ToastSpec[]>
  show: (body: string, options?: ToastShowOptions) => ToastSpec
  success: (body: string, options?: Omit<ToastShowOptions, 'variant'>) => ToastSpec
  error: (body: string, options?: Omit<ToastShowOptions, 'variant'>) => ToastSpec
  warn: (body: string, options?: Omit<ToastShowOptions, 'variant'>) => ToastSpec
  info: (body: string, options?: Omit<ToastShowOptions, 'variant'>) => ToastSpec
  dismiss: (id: string) => boolean
  clear: () => void
}

export function useToast(): UseToastReturn {
  return {
    get toasts() {
      return readonly(store.toasts) as DeepReadonly<ToastSpec[]>
    },
    show: (body, options = {}) => push(body, options),
    success: (body, options = {}) => push(body, { ...options, variant: 'success' }),
    error: (body, options = {}) => push(body, { ...options, variant: 'danger' }),
    warn: (body, options = {}) => push(body, { ...options, variant: 'warning' }),
    info: (body, options = {}) => push(body, { ...options, variant: 'info' }),
    dismiss: dismissById,
    clear
  }
}

export const __resetToastStoreForTests = (): void => {
  clear()
  counter = 0
}

/**
 * Resets the toast store between SSR requests. The toast queue is a module
 * singleton, so the same instance is shared across requests in an SSR runtime.
 * Call this in your server entry's per-request reset hook to avoid leaking
 * one request's pending toasts into another's render output.
 *
 * Multi-app browser usage shares the same queue; if this is undesirable, use
 * the component-form `<VibeToast v-model="...">` for app-local toasts.
 */
export const resetToastStoreForSSR = (): void => {
  clear()
  counter = 0
}

export const __toastStore = store
