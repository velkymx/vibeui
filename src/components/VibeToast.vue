<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Variant } from '../types'

interface BootstrapToast {
  show: () => void
  hide: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  variant: { type: String as () => Variant, default: undefined },
  autohide: { type: Boolean, default: true },
  delay: { type: Number, default: 5000 }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const toastRef = ref<HTMLElement | null>(null)
const bsToast = ref<BootstrapToast | null>(null)
const isVisible = ref(false)

const toastClass = computed(() => {
  const classes = ['toast']
  if (props.variant) classes.push(`text-bg-${props.variant}`)
  return classes.join(' ')
})

// Event handlers for Bootstrap toast events
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
  if (!toastRef.value) return

  try {
    // Dynamically import Bootstrap's Toast
    const bootstrap = await import('bootstrap')
    const Toast = bootstrap.Toast

    bsToast.value = new Toast(toastRef.value, {
      autohide: props.autohide,
      delay: props.delay
    }) as BootstrapToast

    // Add event listeners
    toastRef.value.addEventListener('show.bs.toast', onShow)
    toastRef.value.addEventListener('shown.bs.toast', onShown)
    toastRef.value.addEventListener('hide.bs.toast', onHide)
    toastRef.value.addEventListener('hidden.bs.toast', onHidden)

    // Show toast if modelValue is initially true
    if (props.modelValue) {
      bsToast.value.show()
    }
  } catch {
    // Bootstrap JS not available, fall back to data attributes
    emit('component-error', 'Bootstrap JS not loaded. Toast will use data attributes only.')
  }
})

onBeforeUnmount(() => {
  if (toastRef.value) {
    toastRef.value.removeEventListener('show.bs.toast', onShow)
    toastRef.value.removeEventListener('shown.bs.toast', onShown)
    toastRef.value.removeEventListener('hide.bs.toast', onHide)
    toastRef.value.removeEventListener('hidden.bs.toast', onHidden)
  }

  if (bsToast.value) {
    bsToast.value.dispose()
    bsToast.value = null
  }
})

// Watch modelValue to show/hide toast programmatically
watch(() => props.modelValue, (newValue) => {
  if (!bsToast.value) return

  if (newValue && !isVisible.value) {
    bsToast.value.show()
  } else if (!newValue && isVisible.value) {
    bsToast.value.hide()
  }
})
</script>

<template>
  <div
    ref="toastRef"
    :id="id"
    :class="toastClass"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    :data-bs-autohide="autohide"
    :data-bs-delay="delay"
  >
    <div v-if="title || $slots.header" class="toast-header">
      <slot name="header">
        <strong class="me-auto">{{ title }}</strong>
      </slot>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      <slot />
    </div>
  </div>
</template>
