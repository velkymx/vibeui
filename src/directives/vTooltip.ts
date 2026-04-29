import type { Directive, DirectiveBinding } from 'vue'
import type { Placement } from '../types'

interface BootstrapTooltipInstance {
  dispose: () => void
  setContent: (content: Record<string, string>) => void
}

interface TooltipOptions {
  title?: string
  text?: string
  content?: string
  placement?: Placement
  trigger?: string
  html?: boolean
}

type TooltipBindingValue = string | TooltipOptions | undefined

const INSTANCE_KEY = '__vibeTooltipInstance__'
const PENDING_KEY = '__vibeTooltipPending__'

interface AugmentedElement extends HTMLElement {
  [INSTANCE_KEY]?: BootstrapTooltipInstance | null
  [PENDING_KEY]?: boolean
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

const create = async (el: AugmentedElement, opts: TooltipOptions): Promise<void> => {
  if (el[PENDING_KEY] || el[INSTANCE_KEY]) return
  el[PENDING_KEY] = true
  try {
    const bootstrap = await import('bootstrap')
    el[INSTANCE_KEY] = new bootstrap.Tooltip(el, {
      title: opts.title || '',
      placement: opts.placement || 'top',
      trigger: resolveTrigger(opts.trigger),
      html: opts.html || false
    }) as unknown as BootstrapTooltipInstance
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
  el.setAttribute('data-bs-placement', opts.placement || 'top')
  el.setAttribute('data-bs-trigger', resolveTrigger(opts.trigger))
  if (opts.html) el.setAttribute('data-bs-html', 'true')
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
    const instance = el[INSTANCE_KEY]
    if (instance) {
      instance.setContent({ '.tooltip-inner': opts.title || '' })
    }
  },
  beforeUnmount(el) {
    destroy(el)
  }
}

export default vTooltip
