<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { TABS_CONTEXT_KEY } from '../injectionKeys'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})

const ctx = inject(TABS_CONTEXT_KEY, null)
if (!ctx) {
  // Use console.error instead of throw so app.config.errorHandler can catch it
  // and the component renders without tearing down the entire component tree
  console.error('[VibeTab] must be a descendant of <VibeTabs>')
}

onMounted(() => {
  ctx?.register(props.name, props.label, props.disabled)
})

onBeforeUnmount(() => {
  ctx?.unregister(props.name)
})

const isActive = computed(() => ctx?.isActive(props.name) ?? false)
const shouldRender = computed(() => {
  if (!ctx) return true
  if (!ctx.lazy) return true
  return ctx.hasBeenActive(props.name)
})
</script>

<template>
  <div
    v-if="shouldRender"
    v-show="isActive"
    class="tab-pane"
    :class="{ active: isActive, show: isActive }"
    role="tabpanel"
  >
    <slot />
  </div>
</template>
