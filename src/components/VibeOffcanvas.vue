<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, ref, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { OffcanvasPlacement, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { useBackButton } from '../composables/useBackButton'
import { emitEvent, isDev } from '../composables/useEventBus'
import { registerOffcanvas } from '../composables/offcanvasChannel'

interface BootstrapOffcanvas {
  show: () => void
  hide: () => void
  dispose: () => void
}

// Hoisted to setup so the id is owned by this instance and stable (useId() in a
// defineProps default factory runs during prop normalization — fragile across Vue versions).
const _generatedId = useId('offcanvas')

const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  placement: { type: String as () => OffcanvasPlacement, default: 'start' },
  backdrop: { type: [Boolean, String], default: true },
  scroll: { type: Boolean, default: false },
  teleport: { type: [String, Boolean], default: undefined },
  // Designate this offcanvas as the app sidebar, targeted by layout:sidebar-toggle.
  sidebar: { type: Boolean, default: false }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedTeleport = computed(() => resolveProp(props.teleport, vibeDefaults.teleport, 'body'))


const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

const computedId = computed(() => props.id || _generatedId)

const offcanvasRef = useTemplateRef<HTMLElement>('offcanvasRef')
const isVisible = ref(false)

// Bug 1: in-flight guard plus queued reinits now owned by the composable.

// WCAG 2.4.3: focus must return to the trigger after close. Bootstrap's restore is
// unreliable when shown programmatically, so capture/restore the pre-open focus ourselves.
let preFocusEl: HTMLElement | null = null

const offcanvasClass = computed(() => `offcanvas offcanvas-${props.placement}`)

// Bug 3: isVisible is now set in onShown (not onShow) to align with modelValue emit
const onShow = () => {
  // Capture pre-open focus (fires on show.bs.offcanvas, before focus moves into the panel).
  if (typeof document !== 'undefined') {
    preFocusEl = document.activeElement as HTMLElement | null
  }
  emit('show')
}

const onShown = () => {
  isVisible.value = true
  emit('shown')
  emit('update:modelValue', true)
  // Bus lifecycle: fires however the offcanvas was opened.
  emitEvent('offcanvas:opened', { id: computedId.value })
  if (props.sidebar) emitEvent('layout:sidebar-toggled', { open: true })
}

const onHide = () => {
  emit('hide')
}

const onHidden = () => {
  isVisible.value = false
  emit('hidden')
  emit('update:modelValue', false)
  // Bus lifecycle.
  emitEvent('offcanvas:closed', { id: computedId.value })
  if (props.sidebar) emitEvent('layout:sidebar-toggled', { open: false })
  // WCAG 2.4.3: return focus to the element that opened the offcanvas.
  if (preFocusEl && typeof preFocusEl.focus === 'function') {
    preFocusEl.focus()
  }
  preFocusEl = null
}

// Bug 4: listener attach/detach now owned by the composable (events ride the
// instance lifetime, attached to the attached element rather than the ref).

// Instance lifecycle owned by the shared composable (#247): lazy async
// construction, per-instance offcanvas listeners, dispose plus nulling, and
// unmount-race guards. The exposed ref stays live through reinits.

const { init: initInstance, instance: bsOffcanvas } = useBootstrapInstance<BootstrapOffcanvas>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => offcanvasRef.value,
  create: (el, bootstrap) =>
    new bootstrap.Offcanvas(el, {
      backdrop: props.backdrop === false ? false : props.backdrop === 'static' ? 'static' : true,
      scroll: props.scroll,
      keyboard: props.backdrop !== 'static'
    }) as unknown as BootstrapOffcanvas,
  disposeInstance: (offcanvas) => offcanvas.dispose(),
  events: {
    'show.bs.offcanvas': onShow as EventListener,
    'shown.bs.offcanvas': onShown as EventListener,
    'hide.bs.offcanvas': onHide as EventListener,
    'hidden.bs.offcanvas': onHidden as EventListener
  },
  componentName: 'VibeOffcanvas',
  onError: (error) => reportComponentError(emit, error)
})

const initOffcanvas = async (): Promise<void> => {
  await initInstance()
  if (props.modelValue) bsOffcanvas.value?.show()
}

onMounted(initOffcanvas)

watch(() => props.modelValue, (newValue) => {
  if (!bsOffcanvas.value) return
  if (newValue && !isVisible.value) {
    bsOffcanvas.value.show()
  } else if (!newValue && isVisible.value) {
    bsOffcanvas.value.hide()
  }
})

// Re-init on config change
watch([() => props.placement, () => props.backdrop, () => props.scroll], initOffcanvas)

const show = () => bsOffcanvas.value?.show()
const hide = () => bsOffcanvas.value?.hide()

// #121: v-model and the bus command channel are mutually exclusive per instance.
// A v-model binding surfaces as an `onUpdate:modelValue` listener on the vnode;
// capture it at setup (getCurrentInstance() is null in the bus controller below).
const vModelBound = getCurrentInstance()?.vnode.props?.['onUpdate:modelValue'] != null
const warnIfVModel = () => {
  if (isDev() && vModelBound) {
    console.warn(
      `[VibeOffcanvas] "${computedId.value}" received a bus command while bound with v-model. ` +
      'Use either v-model or the bus command channel for one instance, not both (#121).'
    )
  }
}

// Event-bus layout/offcanvas channel (#100): open/close/toggle this offcanvas by
// id from anywhere. A `sidebar` offcanvas also answers layout:sidebar-toggle.
const offcanvasController = {
  open: () => { warnIfVModel(); show() },
  close: () => { warnIfVModel(); hide() },
  toggle: () => { warnIfVModel(); isVisible.value ? hide() : show() },
}
let unregisterOffcanvas = registerOffcanvas(computedId.value, offcanvasController, props.sidebar)
// Re-register if the id changes after mount so bus commands always reach this
// offcanvas under its current id.
watch(computedId, (id) => {
  unregisterOffcanvas()
  unregisterOffcanvas = registerOffcanvas(id, offcanvasController, props.sidebar)
})
onBeforeUnmount(() => unregisterOffcanvas())

// Support Android back button in hybrid mobile apps
useBackButton(() => {
  if (isVisible.value) hide()
})

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ show, hide, _unsafe_bsInstance: bsOffcanvas })
</script>

<template>
  <Teleport :to="resolvedTeleport === true ? 'body' : (resolvedTeleport || undefined)" :disabled="!resolvedTeleport">
    <div
      ref="offcanvasRef"
      :id="computedId"
      :class="offcanvasClass"
      tabindex="-1"
      :aria-labelledby="`${computedId}-label`"
      :data-bs-backdrop="backdrop === false ? 'false' : backdrop === 'static' ? 'static' : 'true'"
      :data-bs-scroll="scroll"
    >
      <div class="offcanvas-header">
        <h5 :id="`${computedId}-label`" class="offcanvas-title">
          <slot name="header">{{ title }}</slot>
        </h5>
        <button type="button" class="btn-close" aria-label="Close" @click="hide"></button>
      </div>
      <div class="offcanvas-body">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.offcanvas.offcanvas-start,
.offcanvas.offcanvas-end {
  height: 100dvh;
}

.offcanvas.offcanvas-top,
.offcanvas.offcanvas-bottom {
  max-height: 100dvh;
}

.offcanvas-header {
  padding-top: calc(1rem + env(safe-area-inset-top, 0));
}

.offcanvas-body {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
}
</style>
