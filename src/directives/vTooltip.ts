import type { Directive, DirectiveBinding } from 'vue'
import type { TooltipPlacement } from '../types'

interface BootstrapTooltipInstance {
  dispose: () => void
  setContent: (content: Record<string, string>) => void
}

interface TooltipOptions {
  title?: string
  text?: string
  content?: string
  placement?: TooltipPlacement
  trigger?: string
}

// #153: exported so consumers (and type tests) can reference the binding value.
export type TooltipBindingValue = string | TooltipOptions | undefined

const INSTANCE_KEY: unique symbol = Symbol('vibeTooltipInstance')
const PENDING_KEY: unique symbol = Symbol('vibeTooltipPending')
const OPTS_KEY: unique symbol = Symbol('vibeTooltipOpts')
const GEN_KEY: unique symbol = Symbol('vibeTooltipGen')

interface AugmentedElement extends HTMLElement {
  [INSTANCE_KEY]?: BootstrapTooltipInstance | null
  [PENDING_KEY]?: boolean
  [OPTS_KEY]?: TooltipOptions
  [GEN_KEY]?: number
}

const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))

const normalize = (value: TooltipBindingValue): TooltipOptions => {
  if (typeof value === 'string') return { title: value }
  if (!value) return {}
  return { ...value, title: value.title ?? value.text ?? value.content }
}

const resolveTrigger = (trigger?: string): string => {
  const t = trigger || 'hover focus'
  if (isTouchDevice() && t === 'hover focus') return 'click'
  return t
}

const structuralChanged = (a: TooltipOptions, b: TooltipOptions): boolean => {
  if ((a.placement || 'top') !== (b.placement || 'top')) return true
  if (resolveTrigger(a.trigger) !== resolveTrigger(b.trigger)) return true
  return false
}

const create = async (el: AugmentedElement, opts: TooltipOptions): Promise<void> => {
  if (el[PENDING_KEY] || el[INSTANCE_KEY]) return
  el[PENDING_KEY] = true
  // Save the opts we're creating with so we can detect updates that arrived during the async gap
  const latestOpts = opts
  el[OPTS_KEY] = opts
  // Generation token: unmount (or a newer create) invalidates this run, so a
  // late import resolution cannot construct on a detached or stale element.
  const generation = (el[GEN_KEY] ?? 0) + 1
  el[GEN_KEY] = generation
  try {
    const bootstrap = await import('bootstrap')
    // Unmounted or superseded while importing: never construct here.
    if (el[GEN_KEY] !== generation) return
    el[INSTANCE_KEY] = new bootstrap.Tooltip(el, {
      title: opts.title || '',
      placement: opts.placement || 'top',
      trigger: resolveTrigger(opts.trigger),
      html: false
    }) as unknown as BootstrapTooltipInstance
    // Apply any opts that arrived during the async gap (updated hook stores them in OPTS_KEY)
    const current = el[OPTS_KEY]
    if (current && current !== latestOpts && el[INSTANCE_KEY]) {
      if (structuralChanged(latestOpts, current)) {
        // Placement/trigger changed mid-flight: rebuild rather than patching
        // title onto a structurally stale instance.
        destroy(el)
        el[PENDING_KEY] = false
        void create(el, current)
        return
      }
      el[INSTANCE_KEY].setContent({ '.tooltip-inner': current.title ?? '' })
    }
  } catch {
    // Bootstrap JS not loaded; data attributes already set on el for fallback styling.
  }
  el[PENDING_KEY] = false
}

const destroy = (el: AugmentedElement): void => {
  const instance = el[INSTANCE_KEY]
  if (instance) {
    try {
      instance.dispose()
    } catch {
      // Bootstrap can throw disposing a tooltip whose tip is mid-transition or whose
      // element is already detached (e.g. a v-if / route change unmounting the host).
      // Swallow it so teardown never surfaces an error that breaks the page.
    } finally {
      el[INSTANCE_KEY] = null
    }
  }
  el[PENDING_KEY] = false
  el[OPTS_KEY] = undefined
}

const applyDataAttrs = (el: AugmentedElement, opts: TooltipOptions): void => {
  el.setAttribute('data-bs-toggle', 'tooltip')
  if (opts.title) el.setAttribute('data-bs-title', opts.title)
  else el.removeAttribute('data-bs-title')
  el.setAttribute('data-bs-placement', opts.placement || 'top')
  el.setAttribute('data-bs-trigger', resolveTrigger(opts.trigger))
  el.removeAttribute('data-bs-html')
}

export const vTooltip: Directive<AugmentedElement, TooltipBindingValue> = {
  mounted(el, binding: DirectiveBinding<TooltipBindingValue>) {
    const opts = normalize(binding.value)
    applyDataAttrs(el, opts)
    void create(el, opts)
  },
  updated(el, binding: DirectiveBinding<TooltipBindingValue>) {
    const opts = normalize(binding.value)
    applyDataAttrs(el, opts)
    const prev = el[OPTS_KEY] || {}
    const instance = el[INSTANCE_KEY]
    // Always update OPTS_KEY so a pending create() can detect newer opts after it resolves
    el[OPTS_KEY] = opts
    if (el[PENDING_KEY]) {
      // create() is still in flight; it will pick up the updated OPTS_KEY after it resolves
      return
    }
    if (instance && structuralChanged(prev, opts)) {
      destroy(el)
      void create(el, opts)
      return
    }
    if (instance) {
      instance.setContent({ '.tooltip-inner': opts.title || '' })
    }
  },
  beforeUnmount(el) {
    // Invalidate any in-flight create() first: without the bump, a pending
    // import resolution would construct on this detached element after destroy.
    el[GEN_KEY] = (el[GEN_KEY] ?? 0) + 1
    destroy(el)
  }
}

export default vTooltip
