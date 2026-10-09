<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, ref, watch, onMounted } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Variant, ToastPlacement, ComponentError } from '../types'
import { useId } from '../composables/useId'

interface BootstrapToast {
  show: () => void
  hide: () => void
  dispose: () => void
}

const _toastId = useId('toast')

const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  variant: { type: String as () => Variant, default: undefined },
  autohide: { type: Boolean, default: true },
  delay: { type: Number, default: 5000 },
  teleport: { type: [String, Boolean], default: undefined },
  placement: { type: String as () => ToastPlacement, default: 'top-end' },
  // When true, render only the .toast element (no Teleport, no .toast-container wrapper).
  // Used by VibeToastHost to group multiple toasts under a single shared container.
  noContainer: { type: Boolean, default: false }
})
// #159: explicit prop wins, then the global default, then the builtin.
// Declared before every resolver that closes over it: a computed getter is
// lazy, so the old order happened to work, but it breaks the moment any
// resolver is evaluated eagerly (see #199).
const vibeDefaults = useVibeDefaults()

const resolvedTeleport = computed(() => resolveProp(props.teleport, vibeDefaults.teleport, 'body'))

const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, undefined))


const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

const computedId = computed(() => props.id ?? _toastId)
const toastRef = useTemplateRef<HTMLElement>('toastRef')
const isVisible = ref(false)

const toastClass = computed(() => {
  const classes = ['toast']
  if (resolvedVariant.value) classes.push(`text-bg-${resolvedVariant.value}`)
  return classes.join(' ')
})

const containerClass = computed(() => {
  const classes = ['toast-container', 'position-fixed', 'p-3']
  const p = props.placement
  if (p.includes('top')) classes.push('top-0')
  if (p.includes('bottom')) classes.push('bottom-0')
  if (p.includes('middle')) classes.push('top-50', 'start-50', 'translate-middle')
  if (p.includes('start')) classes.push('start-0')
  if (p.includes('end')) classes.push('end-0')
  if (p.includes('center') && !p.includes('middle')) classes.push('start-50', 'translate-middle-x')
  return classes.join(' ')
})

const onShow = () => {
  emit('show')
}

const onShown = () => {
  isVisible.value = true
  emit('shown')
  emit('update:modelValue', true)
}

const onHide = () => {
  emit('hide')
}

const onHidden = () => {
  isVisible.value = false
  emit('hidden')
  emit('update:modelValue', false)
}

// Instance lifecycle owned by the shared composable (#247): lazy async
// construction, per-instance toast listeners, dispose plus nulling, and
// unmount-race guards (including queued reinits, which the old hand-rolled
// init dropped). The exposed ref stays live through reinits.
const { init: initInstance, instance: bsToast } = useBootstrapInstance<BootstrapToast>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => toastRef.value,
  create: (el, bootstrap) =>
    new bootstrap.Toast(el, {
      autohide: props.autohide,
      delay: props.delay
    }) as unknown as BootstrapToast,
  disposeInstance: (toast) => toast.dispose(),
  events: {
    'show.bs.toast': onShow as EventListener,
    'shown.bs.toast': onShown as EventListener,
    'hide.bs.toast': onHide as EventListener,
    'hidden.bs.toast': onHidden as EventListener
  },
  componentName: 'VibeToast',
  onError: (error) => reportComponentError(emit, error)
})

const initToast = async (): Promise<void> => {
  await initInstance()
  if (props.modelValue) bsToast.value?.show()
}

onMounted(initToast)

watch(() => props.modelValue, (newValue) => {
  if (!bsToast.value) return
  if (newValue && !isVisible.value) {
    bsToast.value.show()
  } else if (!newValue && isVisible.value) {
    bsToast.value.hide()
  }
})

// Re-init on config change
watch([() => props.autohide, () => props.delay], initToast)

const show = () => bsToast.value?.show()
const hide = () => bsToast.value?.hide()

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ show, hide, _unsafe_bsInstance: bsToast })

// WCAG 4.1.3: only error/warning toasts may interrupt screen-reader speech
// (role="alert" / assertive); success/info/neutral toasts are polite status
// messages, per the ARIA convention Bootstrap documents for toasts.
const isUrgent = computed(() => resolvedVariant.value === 'danger' || resolvedVariant.value === 'warning')

// Shared attrs for the .toast element — avoids repeating them in both template branches.
// `as const` preserves the literal types ('true', role/aria-live unions) so they stay
// assignable to the native attribute types instead of widening to `string`.
const toastAttrs = computed(() => ({
  id: computedId.value,
  class: toastClass.value,
  role: isUrgent.value ? 'alert' : 'status',
  'aria-live': isUrgent.value ? 'assertive' : 'polite',
  'aria-atomic': 'true',
  'data-bs-autohide': props.autohide,
  'data-bs-delay': props.delay
} as const))
</script>

<template>
  <!-- noContainer renders a plain element root (no Teleport): VibeToastHost
       places these inside a TransitionGroup, which can only track element
       children. A (disabled) Teleport root would make Vue apply enter/leave
       and FLIP classes to the invisible anchor instead of the .toast node
       (see #218). -->
  <div v-if="noContainer" ref="toastRef" v-bind="toastAttrs">
    <div v-if="title || $slots.header" class="toast-header">
      <slot name="header">
        <strong class="me-auto">{{ title }}</strong>
      </slot>
      <button type="button" class="btn-close" aria-label="Close" @click="hide"></button>
    </div>
    <div class="toast-body"><slot /></div>
  </div>
  <!-- Single Teleport when the caller wants body-level rendering. -->
  <Teleport
    v-else
    :to="resolvedTeleport === true ? 'body' : (resolvedTeleport || undefined)"
    :disabled="!resolvedTeleport"
  >
    <div :class="containerClass" style="z-index: 1090">
      <div ref="toastRef" v-bind="toastAttrs">
        <div v-if="title || $slots.header" class="toast-header">
          <slot name="header">
            <strong class="me-auto">{{ title }}</strong>
          </slot>
          <button type="button" class="btn-close" aria-label="Close" @click="hide"></button>
        </div>
        <div class="toast-body"><slot /></div>
      </div>
    </div>
  </Teleport>
</template>
