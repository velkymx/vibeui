<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, onMounted, watch, computed } from 'vue'
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

const popoverRef = useTemplateRef<HTMLElement>('popoverRef')

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))

const computedTrigger = computed(() => {
  if (isTouch && props.trigger === 'hover focus') {
    return 'click'
  }
  return props.trigger
})

// Instance lifecycle owned by the shared composable (#247, same migration as
// VibeTooltip). The exposed ref stays live through queued reinits.
const { init: initPopover, instance: bsPopover } = useBootstrapInstance<BootstrapPopover>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => popoverRef.value,
  create: (el, bootstrap) =>
    new bootstrap.Popover(el, {
      title: props.title,
      content: props.text || props.content || '',
      placement: props.placement,
      trigger: computedTrigger.value,
      html: false
    }) as unknown as BootstrapPopover,
  disposeInstance: (popover) => popover.dispose(),
  componentName: 'VibePopover',
  onError: (error) => reportComponentError(emit, error)
})

onMounted(initPopover)

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
