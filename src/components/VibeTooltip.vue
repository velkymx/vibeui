<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { TooltipPlacement, ComponentError } from '../types'

interface BootstrapTooltip {
  dispose: () => void
  setContent: (content: object) => void
}

const props = defineProps({
  content: { type: String, default: undefined },
  text: { type: String, default: undefined },
  placement: { type: String as () => TooltipPlacement, default: 'top' },
  trigger: { type: String, default: 'hover focus' }
})

const emit = defineEmits<{
  (e: 'component-error', error: ComponentError): void
}>()

// Deprecation warning for content prop
if (props.content !== undefined && props.text === undefined) {
  console.warn('[VibeTooltip] The `content` prop is deprecated and may be removed in a future version. Use `text` instead.')
}

const tooltipRef = ref<HTMLElement | null>(null)
const bsTooltip = ref<BootstrapTooltip | null>(null)

// Tracks whether onBeforeUnmount has fired. The template ref (tooltipRef) may still be
// non-null during the window between onBeforeUnmount and Vue removing the DOM element,
// so a plain !tooltipRef.value check post-await is insufficient in all environments.
let isUnmounted = false

const isTouchDevice = () => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))
}

const computedTrigger = computed(() => {
  if (isTouchDevice() && props.trigger === 'hover focus') {
    return 'click'
  }
  return props.trigger
})

let initInFlight = false
let pendingReinit = false

const initTooltip = async () => {
  if (!tooltipRef.value) return
  if (initInFlight) { pendingReinit = true; return }
  initInFlight = true

  if (bsTooltip.value) {
    bsTooltip.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    // Guard against race: component may have unmounted while the import was in-flight.
    // isUnmounted is set in onBeforeUnmount (before Vue removes the DOM), so this check
    // fires even when tooltipRef.value is still non-null during teardown.
    if (!tooltipRef.value || isUnmounted) return
    const Tooltip = bootstrap.Tooltip

    bsTooltip.value = new Tooltip(tooltipRef.value, {
      title: props.text || props.content || '',
      placement: props.placement,
      trigger: computedTrigger.value,
      html: false
    }) as BootstrapTooltip
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Tooltip will use data attributes only.',
      componentName: 'VibeTooltip',
      originalError: error
    })
  } finally {
    initInFlight = false
    if (pendingReinit) { pendingReinit = false; void initTooltip() }
  }
}

onMounted(initTooltip)

onBeforeUnmount(() => {
  isUnmounted = true
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
watch([() => props.placement, () => props.trigger], initTooltip)

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ _unsafe_bsInstance: bsTooltip })
</script>

<template>
  <span
    ref="tooltipRef"

    :data-bs-placement="placement"
    :data-bs-title="text || content"
    :data-bs-trigger="computedTrigger"
  >
    <slot />
  </span>
</template>
