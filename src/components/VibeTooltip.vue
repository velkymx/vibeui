<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, onMounted, watch, computed } from 'vue'
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

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))

const computedTrigger = computed(() => {
  if (isTouch && props.trigger === 'hover focus') {
    return 'click'
  }
  return props.trigger
})

// Instance lifecycle (lazy async construction, unmount-race guards, dispose)
// is owned by the shared composable (see #230). The exposed ref stays live:
// it reads the composable state, so queued reinits never leave it stale.
const tooltipRef = useTemplateRef<HTMLElement>('tooltipRef')
const { init: initTooltip, instance: bsTooltip } = useBootstrapInstance<BootstrapTooltip>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => tooltipRef.value,
  create: (el, bootstrap) =>
    new bootstrap.Tooltip(el, {
      title: props.text || props.content || '',
      placement: props.placement,
      trigger: computedTrigger.value,
      html: false
    }) as unknown as BootstrapTooltip,
  disposeInstance: (tooltip) => tooltip.dispose(),
  componentName: 'VibeTooltip',
  onError: (error) => reportComponentError(emit, error)
})

onMounted(initTooltip)

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
