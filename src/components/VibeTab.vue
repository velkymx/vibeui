<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, watch } from 'vue'
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

// The name under which this tab is currently registered. Tracked separately
// from props.name so a rename unregisters the OLD entry instead of orphaning
// it (unmount after a rename would otherwise remove the new name and leave a
// ghost button behind).
let registeredName = props.name

onMounted(() => {
  registeredName = props.name
  ctx?.register(props.name, props.label, props.disabled)
})

onBeforeUnmount(() => {
  ctx?.unregister(registeredName)
})

watch(
  () => [props.name, props.label, props.disabled] as const,
  ([name, label, disabled]) => {
    if (!ctx) return
    ctx.update(registeredName, name, label, disabled)
    registeredName = name
  }
)

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
    :id="ctx?.panelId(props.name) ?? `vibe-panel-${props.name}`"
    class="tab-pane"
    :class="{ active: isActive, show: isActive }"
    role="tabpanel"
    :aria-labelledby="ctx?.tabId(props.name) ?? `vibe-tab-${props.name}`"
    :tabindex="isActive ? 0 : -1"
  >
    <slot />
  </div>
</template>
