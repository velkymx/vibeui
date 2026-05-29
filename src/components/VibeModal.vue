<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Size, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { useBackButton } from '../composables/useBackButton'

interface BootstrapModal {
  show: () => void
  hide: () => void
  dispose: () => void
  handleUpdate: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('modal') },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String as () => Size | 'xl', default: undefined },
  centered: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  fullscreen: { type: [Boolean, String], default: false },
  staticBackdrop: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
  teleport: { type: [String, Boolean], default: 'body' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

const modalRef = ref<HTMLElement | null>(null)
const bsModal = ref<BootstrapModal | null>(null)
const isVisible = ref(false)

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

// Bug 4: listener attach/detach helpers
function attachListeners() {
  if (listenersAttached || !modalRef.value) return
  modalRef.value.addEventListener('show.bs.modal', onShow)
  modalRef.value.addEventListener('shown.bs.modal', onShown)
  modalRef.value.addEventListener('hide.bs.modal', onHide)
  modalRef.value.addEventListener('hidden.bs.modal', onHidden)
  listenersAttached = true
}

function detachListeners() {
  if (!listenersAttached || !modalRef.value) return
  modalRef.value.removeEventListener('show.bs.modal', onShow)
  modalRef.value.removeEventListener('shown.bs.modal', onShown)
  modalRef.value.removeEventListener('hide.bs.modal', onHide)
  modalRef.value.removeEventListener('hidden.bs.modal', onHidden)
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

defineExpose({ show, hide, handleUpdate, bsInstance: bsModal })
</script>

<template>
  <Teleport :to="teleport === true ? 'body' : (teleport || undefined)" :disabled="!teleport">
    <div
      ref="modalRef"
      :id="id"
      class="modal fade"
      tabindex="-1"
      :aria-labelledby="`${id}-label`"
      :aria-hidden="isVisible ? undefined : 'true'"
      :data-bs-backdrop="staticBackdrop ? 'static' : undefined"
      :data-bs-keyboard="!staticBackdrop"
    >
      <div :class="dialogClass">
        <div class="modal-content">
          <div v-if="!hideHeader" class="modal-header">
            <h5 :id="`${id}-label`" class="modal-title">
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
