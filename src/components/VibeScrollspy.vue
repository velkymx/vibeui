<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, onActivated } from 'vue'
import type { Tag } from '../types'

interface BootstrapScrollSpy {
  refresh: () => void
  dispose: () => void
}

const props = defineProps({
  target: { type: String, required: true },
  /** @deprecated Bootstrap 5.2+ uses rootMargin. Use rootMargin instead. */
  offset: { type: Number, default: undefined },
  rootMargin: { type: String, default: '0px 0px -25%' },
  method: { type: String, default: 'auto' },
  smoothScroll: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' },
  height: { type: String, default: '100%' }
})

const emit = defineEmits(['activate', 'component-error'])

const scrollspyRef = ref<HTMLElement | null>(null)
const bsScrollspy = ref<BootstrapScrollSpy | null>(null)
let initInFlight = false

const onActivate = (event: any) => {
  emit('activate', event)
}

const initScrollspy = async () => {
  if (!scrollspyRef.value || initInFlight) return
  initInFlight = true

  try {
    const bootstrap = await import('bootstrap')
    const ScrollSpy = bootstrap.ScrollSpy

    if (!scrollspyRef.value) return

    if (props.offset !== undefined) {
      console.warn('[VibeScrollspy] The `offset` prop is deprecated (Bootstrap 5.2+). Use `rootMargin` instead.')
    }

    bsScrollspy.value = new ScrollSpy(scrollspyRef.value, {
      target: props.target,
      rootMargin: props.rootMargin,
      method: props.method,
      smoothScroll: props.smoothScroll
    } as any) as BootstrapScrollSpy

    scrollspyRef.value.addEventListener('activate.bs.scrollspy', onActivate)
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. ScrollSpy will use data attributes only.',
      componentName: 'VibeScrollspy',
      originalError: error
    })
  } finally {
    initInFlight = false
  }
}

onMounted(initScrollspy)

// Re-init when configuration props change after mount
watch([() => props.target, () => props.rootMargin, () => props.method, () => props.smoothScroll], async () => {
  if (scrollspyRef.value) {
    scrollspyRef.value.removeEventListener('activate.bs.scrollspy', onActivate)
  }
  bsScrollspy.value?.dispose()
  bsScrollspy.value = null
  await nextTick()
  if (!scrollspyRef.value) return
  await initScrollspy()
})

onBeforeUnmount(() => {
  if (scrollspyRef.value) {
    scrollspyRef.value.removeEventListener('activate.bs.scrollspy', onActivate)
  }

  if (bsScrollspy.value) {
    bsScrollspy.value.dispose()
    bsScrollspy.value = null
  }
})

const refresh = () => bsScrollspy.value?.refresh()

// Refresh when reactivated inside KeepAlive so positions are recalculated
onActivated(refresh)

defineExpose({ refresh })
</script>

<template>
  <component
    :is="tag"
    ref="scrollspyRef"
    data-bs-spy="scroll"
    :data-bs-target="target"
    :data-bs-root-margin="rootMargin"
    :data-bs-method="method"
    :data-bs-smooth-scroll="smoothScroll"
    tabindex="0"
    :style="{ position: 'relative', height: height, overflow: 'auto' }"
  >
    <slot />
  </component>
</template>
