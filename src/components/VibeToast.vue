<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Variant, ToastPlacement } from '../types'
import { useId } from '../composables/useId'

interface BootstrapToast {
  show: () => void
  hide: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('toast') },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  variant: { type: String as () => Variant, default: undefined },
  autohide: { type: Boolean, default: true },
  delay: { type: Number, default: 5000 },
  teleport: { type: [String, Boolean], default: 'body' },
  placement: { type: String as () => ToastPlacement, default: 'top-end' }
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

const initToast = async () => {
  if (!toastRef.value) return

  if (bsToast.value) {
    bsToast.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    const Toast = bootstrap.Toast

    bsToast.value = new Toast(toastRef.value, {
      autohide: props.autohide,
      delay: props.delay
    }) as BootstrapToast

    toastRef.value.addEventListener('show.bs.toast', onShow)
    toastRef.value.addEventListener('shown.bs.toast', onShown)
    toastRef.value.addEventListener('hide.bs.toast', onHide)
    toastRef.value.addEventListener('hidden.bs.toast', onHidden)

    if (props.modelValue) {
      bsToast.value.show()
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Toast will use data attributes only.',
      componentName: 'VibeToast',
      originalError: error
    })
  }
}

onMounted(initToast)

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

defineExpose({ show, hide, bsInstance: bsToast })
</script>

<template>
  <Teleport :to="teleport === true ? 'body' : (teleport || undefined)" :disabled="!teleport">
    <div :class="containerClass" style="z-index: 1090">
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
          <button type="button" class="btn-close" aria-label="Close" @click="hide"></button>
        </div>
        <div class="toast-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
