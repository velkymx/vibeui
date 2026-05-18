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

type TooltipBindingValue = string | TooltipOptions | undefined

const INSTANCE_KEY: unique symbol = Symbol('vibeTooltipInstance')
const PENDING_KEY: unique symbol = Symbol('vibeTooltipPending')
const OPTS_KEY: unique symbol = Symbol('vibeTooltipOpts')

interface AugmentedElement extends HTMLElement {
  [INSTANCE_KEY]?: BootstrapTooltipInstance | null
  [PENDING_KEY]?: boolean
  [OPTS_KEY]?: TooltipOptions
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
  try {
    const bootstrap = await import('bootstrap')
    el[INSTANCE_KEY] = new bootstrap.Tooltip(el, {
      title: opts.title || '',
      placement: opts.placement || 'top',
      trigger: resolveTrigger(opts.trigger),
      html: false
    }) as unknown as BootstrapTooltipInstance
    // Apply any opts that arrived during the async gap (updated hook stores them in OPTS_KEY)
    if (el[OPTS_KEY] !== latestOpts && el[INSTANCE_KEY]) {
      el[INSTANCE_KEY].setContent({ '.tooltip-inner': el[OPTS_KEY]?.title ?? '' })
    }
  } catch {
    // Bootstrap JS not loaded; data attributes already set on el for fallback styling.
  }
  el[PENDING_KEY] = false
}

const destroy = (el: AugmentedElement): void => {
  const instance = el[INSTANCE_KEY]
  if (instance) {
    instance.dispose()
    el[INSTANCE_KEY] = null
  }
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
    destroy(el)
  }
}

export default vTooltip
