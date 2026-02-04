<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Size } from '../types'

interface BootstrapModal {
  show: () => void
  hide: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String as () => Size | 'xl', default: undefined },
  centered: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  fullscreen: { type: [Boolean, String], default: false },
  staticBackdrop: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const modalRef = ref<HTMLElement | null>(null)
const bsModal = ref<BootstrapModal | null>(null)
const isVisible = ref(false)

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

// Event handlers for Bootstrap modal events
const onShow = () => {
  isVisible.value = true
  emit('show')
}

const onShown = () => {
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

onMounted(async () => {
  if (!modalRef.value) return

  try {
    // Dynamically import Bootstrap's Modal
    const bootstrap = await import('bootstrap')
    const Modal = bootstrap.Modal

    bsModal.value = new Modal(modalRef.value, {
      backdrop: props.staticBackdrop ? 'static' : true,
      keyboard: !props.staticBackdrop
    }) as BootstrapModal

    // Add event listeners
    modalRef.value.addEventListener('show.bs.modal', onShow)
    modalRef.value.addEventListener('shown.bs.modal', onShown)
    modalRef.value.addEventListener('hide.bs.modal', onHide)
    modalRef.value.addEventListener('hidden.bs.modal', onHidden)

    // Show modal if modelValue is initially true
    if (props.modelValue) {
      bsModal.value.show()
    }
  } catch {
    // Bootstrap JS not available, fall back to data attributes
    emit('component-error', 'Bootstrap JS not loaded. Modal will use data attributes only.')
  }
})

onBeforeUnmount(() => {
  if (modalRef.value) {
    modalRef.value.removeEventListener('show.bs.modal', onShow)
    modalRef.value.removeEventListener('shown.bs.modal', onShown)
    modalRef.value.removeEventListener('hide.bs.modal', onHide)
    modalRef.value.removeEventListener('hidden.bs.modal', onHidden)
  }

  if (bsModal.value) {
    bsModal.value.dispose()
    bsModal.value = null
  }
})

// Watch modelValue to show/hide modal programmatically
watch(() => props.modelValue, (newValue) => {
  if (!bsModal.value) return

  if (newValue && !isVisible.value) {
    bsModal.value.show()
  } else if (!newValue && isVisible.value) {
    bsModal.value.hide()
  }
})
</script>

<template>
  <div
    ref="modalRef"
    :id="id"
    class="modal fade"
    tabindex="-1"
    :aria-labelledby="`${id}-label`"
    :aria-hidden="!isVisible"
    :data-bs-backdrop="staticBackdrop ? 'static' : undefined"
    :data-bs-keyboard="!staticBackdrop"
  >
    <div :class="dialogClass">
      <div class="modal-content">
        <div v-if="!hideHeader" class="modal-header">
          <h5 :id="`${id}-label`" class="modal-title">
            <slot name="header">{{ title }}</slot>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="!hideFooter" class="modal-footer">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
