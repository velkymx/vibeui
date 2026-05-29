<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

interface BootstrapAlert {
  close: () => void
  dispose: () => void
}

const props = defineProps({
  variant: { type: String, default: 'primary' },
  subtle: { type: Boolean, default: false },
  modelValue: { type: Boolean, default: true },
  dismissible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  fade: { type: Boolean, default: true }
})

import type { ComponentError } from '../types'

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'closed'): void
  (e: 'component-error', error: ComponentError): void
}>()

const alertRef = ref<HTMLElement | null>(null)
const bsAlert = ref<BootstrapAlert | null>(null)
const isVisible = ref(props.modelValue)

let alertListenersAttached = false
let initInFlight = false
let pendingReinit = false
let isUnmounted = false

const onClose = () => {
  emit('close')
}

const onClosed = () => {
  bsAlert.value = null
  isVisible.value = false
  emit('update:modelValue', false)
  emit('closed')
}

const attachAlertListeners = () => {
  if (alertListenersAttached || !alertRef.value) return
  alertRef.value.addEventListener('close.bs.alert', onClose)
  alertRef.value.addEventListener('closed.bs.alert', onClosed)
  alertListenersAttached = true
}

const detachAlertListeners = () => {
  if (!alertListenersAttached || !alertRef.value) return
  alertRef.value.removeEventListener('close.bs.alert', onClose)
  alertRef.value.removeEventListener('closed.bs.alert', onClosed)
  alertListenersAttached = false
}

const setupBootstrap = async () => {
  if (initInFlight) { pendingReinit = true; return }
  initInFlight = true
  detachAlertListeners()
  try {
    if (!alertRef.value || bsAlert.value) return
    const bootstrap = await import('bootstrap')
    if (!alertRef.value || isUnmounted) return
    bsAlert.value = new bootstrap.Alert(alertRef.value) as BootstrapAlert
    attachAlertListeners()
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Alert will use basic Vue logic.',
      componentName: 'VibeAlert',
      originalError: error
    })
  } finally {
    initInFlight = false
    if (pendingReinit) { pendingReinit = false; void setupBootstrap() }
  }
}

onMounted(() => {
  if (isVisible.value) void setupBootstrap()
})

onBeforeUnmount(() => {
  isUnmounted = true
  detachAlertListeners()

  if (bsAlert.value) {
    bsAlert.value.dispose()
    bsAlert.value = null
  }
})

watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    isVisible.value = true
    await nextTick()
    void setupBootstrap()
  } else if (isVisible.value) {
    if (bsAlert.value) {
      bsAlert.value.close()
    } else {
      isVisible.value = false
      emit('update:modelValue', false)
      emit('closed')
    }
  } else {
    isVisible.value = false
  }
})

const dismiss = () => {
  if (bsAlert.value) {
    bsAlert.value.close()
  } else {
    isVisible.value = false
    emit('update:modelValue', false)
    emit('closed')
  }
}

const alertClass = computed(() => {
  const classes = ['alert']
  if (props.subtle) {
    classes.push(`bg-${props.variant}-subtle`, `text-${props.variant}-emphasis`, `border-${props.variant}-subtle`)
  } else {
    classes.push(`alert-${props.variant}`)
  }
  if (props.dismissible) classes.push('alert-dismissible')
  if (props.fade) classes.push('fade', 'show')
  return classes.join(' ')
})
</script>

<template>
  <div
    v-if="isVisible"
    ref="alertRef"
    :class="alertClass"
    role="alert"
  >
    <template v-if="message">{{ message }}</template><slot />
    <button
      v-if="dismissible"
      type="button"
      class="btn-close"
      aria-label="Close"
      @click="dismiss"
    ></button>
  </div>
</template>
