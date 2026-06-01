<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { Placement } from '../types'

interface BootstrapTooltip {
  dispose: () => void
  setContent: (content: object) => void
}

const props = defineProps({
  content: { type: String, default: undefined },
  text: { type: String, default: undefined },
  placement: { type: String as () => Placement, default: 'top' },
  trigger: { type: String, default: 'hover focus' },
  html: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])

const tooltipRef = ref<HTMLElement | null>(null)
const bsTooltip = ref<BootstrapTooltip | null>(null)

const isTouchDevice = () => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}

const computedTrigger = computed(() => {
  if (isTouchDevice() && props.trigger === 'hover focus') {
    return 'click'
  }
  return props.trigger
})

const initTooltip = async () => {
  if (!tooltipRef.value) return

  // Clean up existing instance if any
  if (bsTooltip.value) {
    bsTooltip.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    const Tooltip = bootstrap.Tooltip

    bsTooltip.value = new Tooltip(tooltipRef.value, {
      title: props.text || props.content || '',
      placement: props.placement,
      trigger: computedTrigger.value,
      html: props.html
    }) as BootstrapTooltip
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Tooltip will use data attributes only.',
      componentName: 'VibeTooltip',
      originalError: error
    })
  }
}

onMounted(initTooltip)

onBeforeUnmount(() => {
  if (bsTooltip.value) {
    bsTooltip.value.dispose()
    bsTooltip.value = null
  }
})

// Watch for content changes (can be updated without re-init)
watch([() => props.content, () => props.text], () => {
  if (bsTooltip.value) {
    bsTooltip.value.setContent({ '.tooltip-inner': props.text || props.content || '' })
  }
})

// Watch for functional changes that require re-initialization
watch([() => props.placement, () => props.trigger, () => props.html], initTooltip)

defineExpose({ bsInstance: bsTooltip })
</script>

<template>
  <span
    ref="tooltipRef"
    data-bs-toggle="tooltip"
    :data-bs-placement="placement"
    :data-bs-title="text || content"
    :data-bs-trigger="trigger"
    :data-bs-html="html"
  >
    <slot />
  </span>
</template>
