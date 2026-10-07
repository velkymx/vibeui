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
  // Log directly and render without group wiring: a missing provider must not
  // tear down the tree. NOTE: app.config.errorHandler does not catch
  // console.error output, it only receives errors Vue itself throws or
  // propagates during render/lifecycle.
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
