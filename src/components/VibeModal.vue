<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Size } from '../types'
import { useId } from '../composables/useId'

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

const initModal = async () => {
  if (!modalRef.value) return

  // Cleanup existing instance
  if (bsModal.value) {
    bsModal.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    const Modal = bootstrap.Modal

    bsModal.value = new Modal(modalRef.value, {
      backdrop: props.staticBackdrop ? 'static' : true,
      keyboard: !props.staticBackdrop,
      focus: true
    }) as BootstrapModal

    modalRef.value.addEventListener('show.bs.modal', onShow)
    modalRef.value.addEventListener('shown.bs.modal', onShown)
    modalRef.value.addEventListener('hide.bs.modal', onHide)
    modalRef.value.addEventListener('hidden.bs.modal', onHidden)

    if (props.modelValue) {
      bsModal.value.show()
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Modal will use data attributes only.',
      componentName: 'VibeModal',
      originalError: error
    })
  }
}

onMounted(initModal)

onBeforeUnmount(() => {
  if (modalRef.value) {
    modalRef.value.removeEventListener('show.bs.modal', onShow)
    modalRef.value.removeEventListener('shown.bs.modal', onShown)
    modalRef.value.removeEventListener('hide.bs.modal', onHide)
    modalRef.value.removeEventListener('hidden.bs.modal', onHidden)
  }

  if (bsModal.value) {
    if (isVisible.value) {
      bsModal.value.hide()
    }
    bsModal.value.dispose()
    bsModal.value = null
  }
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

defineExpose({ show, hide, handleUpdate, bsInstance: bsModal })
</script>

<template>
  <Teleport :to="teleport === true ? 'body' : (teleport || undefined)" :disabled="!teleport">
    <div
      ref="modalRef"
      :id="id"
      class="modal fade"
      :class="{ show: isVisible }"
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
