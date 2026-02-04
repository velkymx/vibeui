<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Tag, TabPane } from '../types'

const props = defineProps({
  id: { type: String, default: undefined },
  tag: { type: String as PropType<Tag>, default: 'div' },
  panes: { type: Array as () => TabPane[], required: true },
  fade: { type: Boolean, default: true }
})

const emit = defineEmits(['component-error'])

const getTabPaneClass = (pane: TabPane) => {
  const classes = ['tab-pane']
  if (props.fade) classes.push('fade')
  if (pane.active) classes.push('show', 'active')
  return classes.join(' ')
}
</script>

<template>
  <component :is="tag" :id="id" class="tab-content">
    <div
      v-for="(pane, index) in panes"
      :key="pane.id"
      :id="pane.id"
      :class="getTabPaneClass(pane)"
      role="tabpanel"
      :aria-labelledby="`${pane.id}-tab`"
      tabindex="0"
    >
      <!-- Scoped slot for custom pane content -->
      <slot name="pane" :pane="pane" :index="index">
        {{ pane.content }}
      </slot>
    </div>
  </component>
</template>
