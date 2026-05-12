<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount } from 'vue'

interface TabsContext {
  register: (name: string, label: string, disabled: boolean) => void
  unregister: (name: string) => void
  isActive: (name: string) => boolean
  hasBeenActive: (name: string) => boolean
  lazy: boolean
}

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})

const ctx = inject<TabsContext | null>('vibeTabsContext', null)
if (!ctx) {
  throw new Error('[VibeTab] must be a descendant of <VibeTabs>')
}

onMounted(() => {
  ctx.register(props.name, props.label, props.disabled)
})

onBeforeUnmount(() => {
  ctx.unregister(props.name)
})

const isActive = computed(() => ctx.isActive(props.name))
const shouldRender = computed(() => {
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
