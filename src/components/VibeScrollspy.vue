<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Tag } from '../types'

interface BootstrapScrollSpy {
  refresh: () => void
  dispose: () => void
}

const props = defineProps({
  target: { type: String, required: true },
  offset: { type: Number, default: 10 },
  method: { type: String, default: 'auto' },
  smoothScroll: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' }
})

const emit = defineEmits(['activate', 'component-error'])

const scrollspyRef = ref<HTMLElement | null>(null)
const bsScrollspy = ref<BootstrapScrollSpy | null>(null)

const onActivate = (event: any) => {
  emit('activate', event)
}

onMounted(async () => {
  if (!scrollspyRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const ScrollSpy = bootstrap.ScrollSpy

    bsScrollspy.value = new ScrollSpy(scrollspyRef.value, {
      target: props.target,
      offset: props.offset,
      method: props.method,
      smoothScroll: props.smoothScroll
    }) as BootstrapScrollSpy

    scrollspyRef.value.addEventListener('activate.bs.scrollspy', onActivate)
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. ScrollSpy will use data attributes only.',
      componentName: 'VibeScrollspy',
      originalError: error
    })
  }
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

// Provide a way to refresh the ScrollSpy if content changes
const refresh = () => {
  if (bsScrollspy.value) {
    bsScrollspy.value.refresh()
  }
}

defineExpose({ refresh })
</script>

<template>
  <component
    :is="tag"
    ref="scrollspyRef"
    data-bs-spy="scroll"
    :data-bs-target="target"
    :data-bs-offset="offset"
    :data-bs-method="method"
    :data-bs-smooth-scroll="smoothScroll"
    tabindex="0"
    style="position: relative; height: 100%; overflow: auto;"
  >
    <slot />
  </component>
</template>
