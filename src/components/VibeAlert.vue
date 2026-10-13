<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, ref, onMounted, watch, nextTick } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Variant } from '../types'

interface BootstrapAlert {
  close: () => void
  dispose: () => void
}

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  subtle: { type: Boolean, default: false },
  modelValue: { type: Boolean, default: true },
  dismissible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  fade: { type: Boolean, default: true }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, 'primary'))


import type { ComponentError } from '../types'

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'closed'): void
  (e: 'component-error', error: ComponentError): void
}>()

const alertRef = useTemplateRef<HTMLElement>('alertRef')
const isVisible = ref(props.modelValue)

const onClose = () => {
  emit('close')
}

const onClosed = () => {
  bsAlert.value = null
  isVisible.value = false
  emit('update:modelValue', false)
  emit('closed')
}

// Instance lifecycle owned by the shared composable (#247): lazy async
// construction, per-instance close/closed listeners, dispose plus nulling,
// and unmount-race guards. The exposed ref stays live through reinits.
const { init: setupBootstrap, instance: bsAlert } = useBootstrapInstance<BootstrapAlert>({
  // Template ref read at call time: v-if toggles null it, which the
  // composable treats as a no-op instead of constructing on nothing.
  resolveElement: () => alertRef.value,
  create: (el, bootstrap) => new bootstrap.Alert(el) as unknown as BootstrapAlert,
  disposeInstance: (alert) => alert.dispose(),
  events: {
    'close.bs.alert': onClose as EventListener,
    'closed.bs.alert': onClosed as EventListener
  },
  componentName: 'VibeAlert',
  onError: (error) => reportComponentError(emit, error)
})

onMounted(() => {
  if (isVisible.value) void setupBootstrap()
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
    classes.push(`bg-${resolvedVariant.value}-subtle`, `text-${resolvedVariant.value}-emphasis`, `border-${resolvedVariant.value}-subtle`)
  } else {
    classes.push(`alert-${resolvedVariant.value}`)
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
