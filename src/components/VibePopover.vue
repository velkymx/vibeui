<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { TooltipPlacement } from '../types'

interface BootstrapPopover {
  dispose: () => void
  setContent: (content: object) => void
}

const props = defineProps({
  title: { type: String, default: undefined },
  content: { type: String, default: undefined },
  text: { type: String, default: undefined },
  placement: { type: String as () => TooltipPlacement, default: 'top' },
  trigger: { type: String, default: 'click' }
})

const emit = defineEmits(['component-error'])

const popoverRef = ref<HTMLElement | null>(null)
const bsPopover = ref<BootstrapPopover | null>(null)

const isTouchDevice = () => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}

const computedTrigger = computed(() => {
  if (isTouchDevice() && props.trigger === 'hover focus') {
    return 'click'
  }
  return props.trigger
})

let initInFlight = false
let pendingReinit = false

const initPopover = async () => {
  if (!popoverRef.value) return
  if (initInFlight) { pendingReinit = true; return }
  initInFlight = true

  if (bsPopover.value) {
    bsPopover.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    if (!popoverRef.value) return
    const Popover = bootstrap.Popover

    bsPopover.value = new Popover(popoverRef.value, {
      title: props.title,
      content: props.text || props.content || '',
      placement: props.placement,
      trigger: computedTrigger.value,
      html: false
    }) as BootstrapPopover
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Popover will use data attributes only.',
      componentName: 'VibePopover',
      originalError: error
    })
  } finally {
    initInFlight = false
    if (pendingReinit) { pendingReinit = false; void initPopover() }
  }
}

onMounted(initPopover)

onBeforeUnmount(() => {
  if (bsPopover.value) {
    bsPopover.value.dispose()
    bsPopover.value = null
  }
})

// Update popover content when props change
watch([() => props.content, () => props.text, () => props.title], () => {
  if (bsPopover.value) {
    bsPopover.value.setContent({
      '.popover-header': props.title || '',
      '.popover-body': props.text || props.content || ''
    })
  }
})

watch([() => props.placement, () => props.trigger], initPopover)

defineExpose({ bsInstance: bsPopover })
</script>

<template>
  <span
    ref="popoverRef"

    :data-bs-placement="placement"
    :data-bs-title="title"
    :data-bs-content="text || content"
    :data-bs-trigger="computedTrigger"
  >
    <slot />
  </span>
</template>
