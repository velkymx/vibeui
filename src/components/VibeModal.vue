<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, ref, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Size, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { useBackButton } from '../composables/useBackButton'
import { emitEvent, isDev } from '../composables/useEventBus'
import { registerModal } from '../composables/modalChannel'

interface BootstrapModal {
  show: () => void
  hide: () => void
  dispose: () => void
  handleUpdate: () => void
}

// Hoisted to setup so the id is owned by this instance and stable (useId() in a
// defineProps default factory runs during prop normalization — fragile across Vue versions).
const _generatedId = useId('modal')

const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String as () => Size | 'xl', default: undefined },
  centered: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  fullscreen: { type: [Boolean, String], default: false },
  staticBackdrop: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
  teleport: { type: [String, Boolean], default: undefined },
  // WCAG 2.4.3: move focus to the first form control when the modal opens.
  // Set false to opt out (e.g. modals with a long async transition).
  autoFocus: { type: Boolean, default: true },
  // WCAG 2.1.1: Cmd+Enter / Ctrl+Enter submits the first <form> inside the modal,
  // matching the UX convention from Apple Mail, Google Docs, and Slack.
  // Set false to opt out.
  submitOnMetaEnter: { type: Boolean, default: true }
})
// #159: explicit prop wins, then the global default, then the builtin.
// Declared before every resolver that closes over it: a computed getter is
// lazy, so the old order happened to work, but it breaks the moment any
// resolver is evaluated eagerly (see #199).
const vibeDefaults = useVibeDefaults()

const resolvedTeleport = computed(() => resolveProp(props.teleport, vibeDefaults.teleport, 'body'))

const resolvedSize = computed(() => resolveProp(props.size, vibeDefaults.size, undefined))


const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

// #147: type header/body/footer slots. Default exposes bus payload.
defineSlots<{
  header?: () => unknown
  default?: (props: { payload: unknown }) => unknown
  footer?: () => unknown
}>()

const computedId = computed(() => props.id || _generatedId)

const modalRef = useTemplateRef<HTMLElement>('modalRef')
const isVisible = ref(false)
// Payload delivered by a `modal:open` bus command, exposed to the default slot.
const busPayload = ref<unknown>(undefined)

// WCAG 2.4.3: focus must return to the trigger after the modal closes. Bootstrap's
// own restore is unreliable when the modal is shown programmatically (no trigger
// element), so capture the pre-open focus ourselves and restore it on close.
let preFocusEl: HTMLElement | null = null

// WCAG 2.1.2: track elements we've made inert so we can restore them precisely.
const inertedEls: HTMLElement[] = []

// All natively focusable elements (excluding elements inside inert subtrees).
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]),' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableEls(): HTMLElement[] {
  if (!modalRef.value) return []
  return Array.from(modalRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
}

// Single keydown handler for the modal — handles focus trapping, form
// submission, and close intent.
function onModalKeydown(e: KeyboardEvent) {
  // #183: own the Escape close intent so it survives a Bootstrap transition.
  // Bootstrap drops hide() issued mid-transition (silent _isTransitioning
  // guard) without telling the component, losing the close. requestHide
  // stores the intent and consumes it when the transition settles. Runs even
  // mid-transition (before isVisible flips). Skipped for static backdrops,
  // which stay open on Escape by design.
  if (e.key === 'Escape' && !props.staticBackdrop) {
    requestHide()
    return
  }
  if (!isVisible.value) return

  // WCAG 2.1.1: Cmd/Ctrl+Enter submits the first <form> in the modal.
  if (props.submitOnMetaEnter && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    const form = modalRef.value?.querySelector<HTMLFormElement>('form')
    form?.requestSubmit()
    return
  }

  // WCAG 2.1.2: Tab trap cycles focus within the modal.
  if (e.key !== 'Tab') return
  const focusable = getFocusableEls()
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

// Mark all siblings of the modal element as inert so keyboard and screen-reader
// users cannot reach page content behind the open modal (WCAG 2.1.2).
function applyInert() {
  const parent = modalRef.value?.parentElement
  if (!parent) return
  Array.from(parent.children).forEach(child => {
    const el = child as HTMLElement
    if (el === modalRef.value || el.inert) return
    el.inert = true
    inertedEls.push(el)
  })
}

function removeInert() {
  inertedEls.forEach(el => { el.inert = false })
  inertedEls.length = 0
}

// Bug 1: in-flight guard to prevent concurrent async init races
// (now owned by the composable, which serves queued reinits instead of
// dropping them).

// Bug 4: track whether listeners are attached to prevent stacking
let listenersAttached = false

// Set first in onBeforeUnmount — guards the post-await section against constructing
// a Bootstrap Modal instance on a detached element during a mount/unmount race.
let isUnmounted = false

// #183: Bootstrap drops show()/hide() issued mid-transition (its
// _isTransitioning guard returns silently, firing no events). Track the
// in-flight direction ourselves: a contrary intent arriving mid-transition is
// stored and consumed when the transition settles, so no request is lost.
// The flag is set only for state-changing calls (redundant calls are silent
// no-ops in Bootstrap too, so there is nothing to await for them).
let transitioning = false
let pendingDesired: boolean | null = null

const requestShow = () => {
  if (!bsModal.value || isUnmounted) return
  if (transitioning) {
    pendingDesired = true
    return
  }
  if (!isVisible.value) {
    transitioning = true
    bsModal.value.show()
  } else {
    bsModal.value.show()
  }
}

const requestHide = () => {
  if (!bsModal.value || isUnmounted) return
  if (transitioning) {
    pendingDesired = false
    return
  }
  if (isVisible.value) {
    transitioning = true
    bsModal.value.hide()
  } else {
    bsModal.value.hide()
  }
}

// Consumes a queued intent once a transition settles. Runs after isVisible is
// updated so the follow-up request sees fresh state.
const settleTransition = () => {
  transitioning = false
  if (pendingDesired === null) return
  const desired = pendingDesired
  pendingDesired = null
  if (desired) requestShow()
  else requestHide()
}

const dialogClass = computed(() => {
  const classes = ['modal-dialog']
  if (resolvedSize.value) classes.push(`modal-${resolvedSize.value}`)
  if (props.centered) classes.push('modal-dialog-centered')
  if (props.scrollable) classes.push('modal-dialog-scrollable')
  if (props.fullscreen === true) {
    classes.push('modal-fullscreen')
  } else if (typeof props.fullscreen === 'string') {
    classes.push(`modal-fullscreen-${props.fullscreen}-down`)
  }
  return classes.join(' ')
})

// Bug 3: isVisible is now set in onShown (not onShow) to align with modelValue emit
const onShow = () => {
  // Capture the element that had focus before the modal opened (fires on show.bs.modal,
  // before Bootstrap moves focus into the dialog).
  if (typeof document !== 'undefined') {
    preFocusEl = document.activeElement as HTMLElement | null
  }
  emit('show')
}

const onShown = () => {
  isVisible.value = true
  emit('shown')
  emit('update:modelValue', true)
  // Bus lifecycle: fires however the modal was opened (v-model, method, or bus).
  emitEvent('modal:opened', { id: computedId.value })
  // WCAG 2.1.2: lock out the page behind the modal from keyboard / SR navigation.
  applyInert()
  // WCAG 2.4.3: move keyboard focus to the first form control so users don't
  // have to tab from the trigger through the whole page to reach modal inputs.
  // Form controls are preferred over buttons (the header close button comes first
  // in DOM order and must not steal focus from a form); button-only modals
  // (e.g. delete confirms) fall back to the first focusable element.
  if (props.autoFocus && modalRef.value) {
    const firstControl = modalRef.value.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
    )
    ;(firstControl ?? getFocusableEls()[0])?.focus()
  }
  settleTransition()
}

const onHide = () => {
  emit('hide')
}

const onHidden = () => {
  isVisible.value = false
  emit('hidden')
  emit('update:modelValue', false)
  // Bus lifecycle + clear any payload delivered on open.
  emitEvent('modal:closed', { id: computedId.value })
  busPayload.value = undefined
  // WCAG 2.1.2: restore inert on any previously locked-out siblings.
  removeInert()
  // WCAG 2.4.3: return focus to the element that opened the modal.
  if (preFocusEl && typeof preFocusEl.focus === 'function') {
    preFocusEl.focus()
  }
  preFocusEl = null
  settleTransition()
}

// Keydown wiring stays manual: the document-level Escape catcher and the
// element trap are transition-window semantics the shared instance lifecycle
// does not own. The four Bootstrap show/hide events ride the composable.
let listenersEl: HTMLElement | null = null

function attachKeydownListeners() {
  if (listenersAttached || !modalRef.value) return
  listenersEl = modalRef.value
  // Keyboard events bubble up from children to the modal root.
  listenersEl.addEventListener('keydown', onModalKeydown)
  // #183: element-level keydown misses Escape while focus sits outside the
  // modal, which is exactly the opening-transition window. Catch it at
  // document level for that window only; settled states keep Bootstrap's own
  // handling (preserving stacked-modal behavior).
  document.addEventListener('keydown', onDocumentKeydown)
  listenersAttached = true
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || props.staticBackdrop || !transitioning) return
  requestHide()
}

function detachKeydownListeners() {
  if (!listenersAttached) return
  if (listenersEl) {
    listenersEl.removeEventListener('keydown', onModalKeydown)
    listenersEl = null
  }
  document.removeEventListener('keydown', onDocumentKeydown)
  listenersAttached = false
}

// Bug 1: async init with in-flight guard
// Bug 4: detach old listeners before dispose, attach after new instance
// Instance construction owned by the shared composable (#247); the transition
// state reset plus keydown wiring stay here (composable does not own them).
const { init: initInstance, instance: bsModal } = useBootstrapInstance<BootstrapModal>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => modalRef.value,
  create: (el, bootstrap) =>
    new bootstrap.Modal(el, {
      backdrop: props.staticBackdrop ? 'static' : true,
      keyboard: !props.staticBackdrop,
      focus: true
    }) as unknown as BootstrapModal,
  disposeInstance: (modal) => modal.dispose(),
  events: {
    'show.bs.modal': onShow as EventListener,
    'shown.bs.modal': onShown as EventListener,
    'hide.bs.modal': onHide as EventListener,
    'hidden.bs.modal': onHidden as EventListener
  },
  componentName: 'VibeModal',
  onError: (error) => reportComponentError(emit, error)
})

const initModal = async (): Promise<void> => {
  if (!modalRef.value) return

  detachKeydownListeners()
  // Fresh instance, fresh transition tracking. The init-time show below
  // re-arms the flag through requestShow.
  transitioning = false
  pendingDesired = null

  await initInstance()
  attachKeydownListeners()

  if (props.modelValue) {
    requestShow()
  }
}

onMounted(initModal)

// Bug 2: just call dispose() directly — Bootstrap handles backdrop cleanup internally
// (dispose itself is owned by the composable; this hook keeps the rest).
onBeforeUnmount(() => {
  isUnmounted = true
  pendingDesired = null
  // WCAG 2.1.2: must clear inert even if the modal was never formally closed.
  removeInert()
  detachKeydownListeners()
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) requestShow()
  else requestHide()
})

// Re-init when config changes
watch(() => props.staticBackdrop, initModal)

const show = () => requestShow()
const hide = () => requestHide()
const handleUpdate = () => bsModal.value?.handleUpdate()

// #121: v-model and the bus command channel are mutually exclusive per instance.
// Vue exposes a v-model binding as an `onUpdate:modelValue` listener on the vnode;
// detect it once at setup (getCurrentInstance() is null outside setup, so the
// bus controller below reads this captured flag, not a fresh lookup).
const vModelBound = getCurrentInstance()?.vnode.props?.['onUpdate:modelValue'] != null
const warnIfVModel = () => {
  if (isDev() && vModelBound) {
    console.warn(
      `[VibeModal] "${computedId.value}" received a bus command while bound with v-model. ` +
      'Use either v-model or the bus command channel for one instance, not both (#121).'
    )
  }
}

// Event-bus modal channel (#98): open/close this modal by id from anywhere.
// Guards are cancelable; the payload is exposed to the default slot.
const openFromBus = (payload?: unknown) => {
  warnIfVModel()
  let canceled = false
  emitEvent('modal:beforeOpen', { id: computedId.value, cancel: () => { canceled = true } })
  if (canceled) return
  busPayload.value = payload
  show()
}
const closeFromBus = () => {
  warnIfVModel()
  let canceled = false
  emitEvent('modal:beforeClose', { id: computedId.value, cancel: () => { canceled = true } })
  if (canceled) return
  hide()
}
let unregisterModal = registerModal(computedId.value, { open: openFromBus, close: closeFromBus })
// Re-register if the id changes after mount (e.g. a `:id` bound to data that
// resolves later), so bus commands always reach this modal under its current id.
watch(computedId, (id) => {
  unregisterModal()
  unregisterModal = registerModal(id, { open: openFromBus, close: closeFromBus })
})
onBeforeUnmount(() => unregisterModal())

// Support Android back button in hybrid mobile apps
useBackButton(() => {
  if (isVisible.value) hide()
})

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ show, hide, handleUpdate, _unsafe_bsInstance: bsModal })
</script>

<template>
  <Teleport :to="resolvedTeleport === true ? 'body' : (resolvedTeleport || undefined)" :disabled="!resolvedTeleport">
    <div
      ref="modalRef"
      :id="computedId"
      class="modal fade"
      tabindex="-1"
      :aria-labelledby="`${computedId}-label`"
      :aria-hidden="isVisible ? undefined : 'true'"
      :data-bs-backdrop="staticBackdrop ? 'static' : undefined"
      :data-bs-keyboard="!staticBackdrop"
    >
      <div :class="dialogClass">
        <div class="modal-content">
          <div v-if="!hideHeader" class="modal-header">
            <h5 :id="`${computedId}-label`" class="modal-title">
              <slot name="header">{{ title }}</slot>
            </h5>
            <button type="button" class="btn-close" aria-label="Close" @click="hide"></button>
          </div>
          <div class="modal-body">
            <slot :payload="busPayload" />
          </div>
          <div v-if="!hideFooter" class="modal-footer">
            <slot name="footer">
              <button type="button" class="btn btn-secondary" @click="hide">Close</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal.show .modal-dialog.modal-fullscreen {
  height: 100dvh;
}

.modal.show .modal-dialog.modal-fullscreen .modal-content {
  height: 100dvh;
}

.modal-header {
  padding-top: calc(1rem + env(safe-area-inset-top, 0));
}

.modal-footer {
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
}
</style>
