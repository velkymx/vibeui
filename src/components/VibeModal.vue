<script setup lang="ts">
import { shallowRef, computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Size, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { useBackButton } from '../composables/useBackButton'

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
  teleport: { type: [String, Boolean], default: 'body' },
  // WCAG 2.4.3: move focus to the first form control when the modal opens.
  // Set false to opt out (e.g. modals with a long async transition).
  autoFocus: { type: Boolean, default: true },
  // WCAG 2.1.1: Cmd+Enter / Ctrl+Enter submits the first <form> inside the modal,
  // matching the UX convention from Apple Mail, Google Docs, and Slack.
  // Set false to opt out.
  submitOnMetaEnter: { type: Boolean, default: true }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

const computedId = computed(() => props.id || _generatedId)

const modalRef = ref<HTMLElement | null>(null)
const bsModal = shallowRef<BootstrapModal | null>(null)
const isVisible = ref(false)

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

// Single keydown handler for the modal — handles both focus trapping and form submission.
function onModalKeydown(e: KeyboardEvent) {
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
let initInFlight = false

// Bug 4: track whether listeners are attached to prevent stacking
let listenersAttached = false

// Set first in onBeforeUnmount — guards the post-await section against constructing
// a Bootstrap Modal instance on a detached element during a mount/unmount race.
let isUnmounted = false

const dialogClass = computed(() => {
  const classes = ['modal-dialog']
  if (props.size) classes.push(`modal-${props.size}`)
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
  // WCAG 2.1.2: lock out the page behind the modal from keyboard / SR navigation.
  applyInert()
  // WCAG 2.4.3: move keyboard focus to the first form control so users don't
  // have to tab from the trigger through the whole page to reach modal inputs.
  if (props.autoFocus && modalRef.value) {
    const first = modalRef.value.querySelector<HTMLElement>(
      'input:not([type="hidden"]), select, textarea'
    )
    first?.focus()
  }
}

const onHide = () => {
  emit('hide')
}

const onHidden = () => {
  isVisible.value = false
  emit('hidden')
  emit('update:modelValue', false)
  // WCAG 2.1.2: restore inert on any previously locked-out siblings.
  removeInert()
  // WCAG 2.4.3: return focus to the element that opened the modal.
  if (preFocusEl && typeof preFocusEl.focus === 'function') {
    preFocusEl.focus()
  }
  preFocusEl = null
}

// Bug 4: listener attach/detach helpers
function attachListeners() {
  if (listenersAttached || !modalRef.value) return
  modalRef.value.addEventListener('show.bs.modal', onShow)
  modalRef.value.addEventListener('shown.bs.modal', onShown)
  modalRef.value.addEventListener('hide.bs.modal', onHide)
  modalRef.value.addEventListener('hidden.bs.modal', onHidden)
  // Keyboard events bubble up from children to the modal root.
  modalRef.value.addEventListener('keydown', onModalKeydown)
  listenersAttached = true
}

function detachListeners() {
  if (!listenersAttached || !modalRef.value) return
  modalRef.value.removeEventListener('show.bs.modal', onShow)
  modalRef.value.removeEventListener('shown.bs.modal', onShown)
  modalRef.value.removeEventListener('hide.bs.modal', onHide)
  modalRef.value.removeEventListener('hidden.bs.modal', onHidden)
  modalRef.value.removeEventListener('keydown', onModalKeydown)
  listenersAttached = false
}

// Bug 1: async init with in-flight guard
// Bug 4: detach old listeners before dispose, attach after new instance
const initModal = async () => {
  if (!modalRef.value) return

  // Bug 1: prevent concurrent init races
  if (initInFlight) return
  initInFlight = true

  try {
    // Cleanup existing instance
    if (bsModal.value) {
      detachListeners()
      bsModal.value.dispose()
      bsModal.value = null
    }

    const bootstrap = await import('bootstrap')

    // Guard: component may have unmounted while the import was in-flight.
    if (!modalRef.value || isUnmounted) return

    const Modal = bootstrap.Modal

    bsModal.value = new Modal(modalRef.value, {
      backdrop: props.staticBackdrop ? 'static' : true,
      keyboard: !props.staticBackdrop,
      focus: true
    }) as BootstrapModal

    attachListeners()

    if (props.modelValue) {
      bsModal.value.show()
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Modal will use data attributes only.',
      componentName: 'VibeModal',
      originalError: error
    })
  } finally {
    initInFlight = false
  }
}

onMounted(initModal)

// Bug 2: just call dispose() directly — Bootstrap handles backdrop cleanup internally
// Bug 4: detach listeners before dispose
onBeforeUnmount(() => {
  isUnmounted = true
  // WCAG 2.1.2: must clear inert even if the modal was never formally closed.
  removeInert()
  detachListeners()
  bsModal.value?.dispose()
  bsModal.value = null
})

watch(() => props.modelValue, (newValue) => {
  if (!bsModal.value) return
  if (newValue && !isVisible.value) {
    bsModal.value.show()
  } else if (!newValue && isVisible.value) {
    bsModal.value.hide()
  }
})

// Re-init when config changes
watch(() => props.staticBackdrop, initModal)

const show = () => bsModal.value?.show()
const hide = () => bsModal.value?.hide()
const handleUpdate = () => bsModal.value?.handleUpdate()

// Support Android back button in hybrid mobile apps
useBackButton(() => {
  if (isVisible.value) hide()
})

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ show, hide, handleUpdate, _unsafe_bsInstance: bsModal })
</script>

<template>
  <Teleport :to="teleport === true ? 'body' : (teleport || undefined)" :disabled="!teleport">
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
            <slot />
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
