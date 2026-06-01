<script setup lang="ts">
import { computed, type PropType, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import type { Tag, TabPane } from '../types'

interface BootstrapTab {
  show: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: undefined },
  tag: { type: String as PropType<Tag>, default: 'div' },
  panes: { type: Array as () => TabPane[], required: true },
  fade: { type: Boolean, default: true }
})

const emit = defineEmits(['component-error', 'shown', 'hide', 'hidden'])

const tabContentRef = ref<HTMLElement | null>(null)
const bsTabs = new Map<string, BootstrapTab>()

const getTabPaneClass = (pane: TabPane) => {
  const classes = ['tab-pane']
  if (props.fade) classes.push('fade')
  if (pane.active) classes.push('show', 'active')
  return classes.join(' ')
}

onMounted(async () => {
  if (!tabContentRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const Tab = bootstrap.Tab

    // Initialize tabs for any tab triggers that might be outside this component
    // but target these panes. 
    // In VibeUI, tabs are often used with VibeNav.
    
    // We watch for 'shown.bs.tab' events on the document or parent to sync state
    // but better yet, we provide the Bootstrap Tab functionality if needed.
  } catch (error) {
    // Fallback to CSS
  }
})

onBeforeUnmount(() => {
  bsTabs.forEach(tab => tab.dispose())
  bsTabs.clear()
})

// The current VibeTabContent is very state-driven by the 'panes' prop.
// If the user changes the 'active' property in the 'panes' array, 
// Vue will re-render and the classes will update.
// This works well for a "Pure Vue" approach but might skip Bootstrap's Tab JS events.

// To truly bridge it, we would need to ensure that when a pane becomes active,
// we could optionally trigger the Bootstrap Tab.show() if we had the trigger element.
</script>

<template>
  <component :is="tag" :id="id" ref="tabContentRef" class="tab-content">
    <div
      v-for="(pane, index) in panes"
      :key="pane.id"
      :id="pane.id"
      :class="getTabPaneClass(pane)"
      role="tabpanel"
      :aria-labelledby="`${pane.id}-tab`"
      tabindex="0"
    >
      <slot name="pane" :pane="pane" :index="index">
        {{ pane.content }}
      </slot>
    </div>
  </component>
</template>
