<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, watch, onMounted, onActivated, computed } from 'vue'
import type { Tag, ComponentError } from '../types'
import { safeLength } from '../utils/safeCss'

interface BootstrapScrollSpy {
  refresh: () => void
  dispose: () => void
}

interface ScrollSpyOptions {
  target: string
  rootMargin?: string
  method?: string
  smoothScroll?: boolean
  threshold?: number[]
  /** @deprecated Bootstrap 5.2+. Use rootMargin instead. */
  offset?: number
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

const emit = defineEmits<{
  (e: 'activate', event: Event): void
  (e: 'component-error', error: ComponentError): void
}>()

const scrollspyRef = useTemplateRef<HTMLElement>('scrollspyRef')

const onActivate = (event: Event) => {
  emit('activate', event)
}

// Instance lifecycle owned by the shared composable (#247): lazy async
// construction, per-instance activate listener, dispose plus nulling, and
// unmount-race guards. The exposed refresh reads the live ref.
const { init: initScrollspy, instance: bsScrollspy } = useBootstrapInstance<BootstrapScrollSpy>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => scrollspyRef.value,
  create: (el, bootstrap) => {
    if (props.offset !== undefined) {
      console.warn('[VibeScrollspy] The `offset` prop is deprecated (Bootstrap 5.2+). Use `rootMargin` instead.')
    }
    const scrollSpyOpts: ScrollSpyOptions = {
      target: props.target,
      rootMargin: props.rootMargin,
      method: props.method,
      smoothScroll: props.smoothScroll
    }
    const ScrollSpy = bootstrap.ScrollSpy
    return new (ScrollSpy as unknown as new (el: HTMLElement, opts: ScrollSpyOptions) => BootstrapScrollSpy)(
      el,
      scrollSpyOpts
    )
  },
  disposeInstance: (scrollspy) => scrollspy.dispose(),
  events: {
    'activate.bs.scrollspy': onActivate as EventListener
  },
  componentName: 'VibeScrollspy',
  onError: (error) => reportComponentError(emit, error)
})

onMounted(initScrollspy)

// Re-init when configuration props change after mount
watch([() => props.target, () => props.rootMargin, () => props.method, () => props.smoothScroll], () => {
  void initScrollspy()
})

const safeHeight = computed(() => safeLength(props.height) ?? '100%')

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
    :data-bs-smooth-scroll="smoothScroll ? 'true' : undefined"
    tabindex="0"
    :style="{ position: 'relative', height: safeHeight, overflow: 'auto' }"
  >
    <slot />
  </component>
</template>
