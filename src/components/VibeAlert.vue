<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface BootstrapAlert {
  close: () => void
  dispose: () => void
}

const props = defineProps({
  variant: { type: String, default: 'primary' },
  subtle: { type: Boolean, default: false },
  modelValue: { type: Boolean, default: true },
  dismissable: { type: Boolean, default: false },
  message: { type: String, required: true },
  fade: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close', 'closed', 'component-error'])

const alertRef = ref<HTMLElement | null>(null)
const bsAlert = ref<BootstrapAlert | null>(null)
const isVisible = ref(props.modelValue)

const onClose = () => {
  emit('close')
}

const onClosed = () => {
  isVisible.value = false
  emit('update:modelValue', false)
  emit('closed')
}

onMounted(async () => {
  if (!alertRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const Alert = bootstrap.Alert

    bsAlert.value = new Alert(alertRef.value) as BootstrapAlert

    alertRef.value.addEventListener('close.bs.alert', onClose)
    alertRef.value.addEventListener('closed.bs.alert', onClosed)
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Alert will use basic Vue logic.',
      componentName: 'VibeAlert',
      originalError: error
    })
  }
})

onBeforeUnmount(() => {
  if (alertRef.value) {
    alertRef.value.removeEventListener('close.bs.alert', onClose)
    alertRef.value.removeEventListener('closed.bs.alert', onClosed)
  }

  if (bsAlert.value) {
    bsAlert.value.dispose()
    bsAlert.value = null
  }
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    isVisible.value = true
  } else if (bsAlert.value && isVisible.value) {
    bsAlert.value.close()
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
  if (props.dismissable) classes.push('alert-dismissible')
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
    <slot>{{ message }}</slot>
    <button
      v-if="dismissable"
      type="button"
      class="btn-close"
      aria-label="Close"
      @click="dismiss"
    ></button>
  </div>
</template>
