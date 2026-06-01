<script setup lang="ts">
import { shallowRef, ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { TooltipPlacement, ComponentError } from '../types'

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

const emit = defineEmits<{
  (e: 'component-error', error: ComponentError): void
}>()

const popoverRef = ref<HTMLElement | null>(null)
const bsPopover = shallowRef<BootstrapPopover | null>(null)

// Tracks whether onBeforeUnmount has fired. The template ref (popoverRef) may still be
// non-null during the window between onBeforeUnmount and Vue removing the DOM element,
// so a plain !popoverRef.value check post-await is insufficient in all environments.
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

const initPopover = async () => {
  if (!popoverRef.value) return
  if (initInFlight) { pendingReinit = true; return }
  initInFlight = true

  if (bsPopover.value) {
    bsPopover.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    // Guard against race: component may have unmounted while the import was in-flight.
    // isUnmounted is set in onBeforeUnmount (before Vue removes the DOM), so this check
    // fires even when popoverRef.value is still non-null during teardown.
    if (!popoverRef.value || isUnmounted) return
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
  isUnmounted = true
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

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ _unsafe_bsInstance: bsPopover })
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
