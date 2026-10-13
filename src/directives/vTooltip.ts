import type { Directive, DirectiveBinding } from 'vue'
import type { TooltipPlacement } from '../types'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'

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

type AugmentedElement = HTMLElement

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

type TooltipOwner = ReturnType<typeof useBootstrapInstance<BootstrapTooltipInstance>>

interface ElementRecord {
  owner?: TooltipOwner
  /** Latest opts from the binding (data attrs plus gap pickup read these). */
  opts: TooltipOptions
  /** Opts consumed by the last successful construction. */
  built?: TooltipOptions
}

const records = new WeakMap<HTMLElement, ElementRecord>()

const recordFor = (el: AugmentedElement): ElementRecord => {
  let record = records.get(el)
  if (!record) {
    record = { opts: {} }
    records.set(el, record)
  }
  return record
}

// Construction reads the latest stored opts at call time (post-import), so
// updates arriving mid-flight are picked up automatically: no stale build,
// no rebuild needed. Directives have no setup scope, so the owner runs with
// manual teardown and this module drives teardown() from beforeUnmount.
const ownerFor = (el: AugmentedElement): TooltipOwner => {
  const record = recordFor(el)
  if (!record.owner) {
    record.owner = useBootstrapInstance<BootstrapTooltipInstance>({
      manualTeardown: true,
      resolveElement: () => el,
      create: (target, bootstrap) => {
        const current = recordFor(target as AugmentedElement).opts
        return new bootstrap.Tooltip(target, {
          title: current.title || '',
          placement: current.placement || 'top',
          trigger: resolveTrigger(current.trigger),
          html: false
        }) as unknown as BootstrapTooltipInstance
      },
      disposeInstance: (instance) => {
        try {
          instance.dispose()
        } catch {
          // Bootstrap can throw disposing a tooltip whose tip is mid-transition
          // or whose element is already detached. Swallow it so teardown never
          // surfaces an error that breaks the page (see #66).
        }
      },
      componentName: 'vTooltip',
      // Directives have no emit channel; the data-attribute fallback already
      // applied is the degraded experience. Stay silent like before.
      onError: () => {}
    })
  }
  return record.owner
}

const initWith = (el: AugmentedElement): void => {
  const record = recordFor(el)
  const owner = ownerFor(el)
  void owner.init().then(() => {
    // Mark what the construction consumed (owner.get() null means the run
    // was invalidated or the load failed: leave built stale-free).
    if (owner.get()) record.built = record.opts
  })
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
    const record = recordFor(el)
    record.opts = normalize(binding.value)
    applyDataAttrs(el, record.opts)
    initWith(el)
  },
  updated(el, binding: DirectiveBinding<TooltipBindingValue>) {
    const record = recordFor(el)
    const prev = record.built ?? record.opts
    const opts = normalize(binding.value)
    record.opts = opts
    applyDataAttrs(el, opts)
    const instance = record.owner?.get() ?? null
    // No live instance: a construction is in flight and reads the latest
    // stored opts when the import resolves, so there is nothing to patch.
    if (!instance) return
    if (structuralChanged(prev, opts)) {
      record.owner?.destroy()
      record.built = undefined
      initWith(el)
      return
    }
    instance.setContent({ '.tooltip-inner': opts.title || '' })
  },
  beforeUnmount(el) {
    // Invalidate any in-flight init first, then drop the per-element record:
    // a remount creates a fresh owner, so no stale flag can block it.
    recordFor(el).owner?.teardown()
    records.delete(el)
  }
}

export default vTooltip
