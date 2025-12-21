<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Tag } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  active: { type: Boolean, default: false },
  fade: { type: Boolean, default: true },
  tag: { type: String as PropType<Tag>, default: 'div' },
  ariaLabelledby: { type: String, default: undefined }
})

const emit = defineEmits(['component-error'])

const tabPaneClass = computed(() => {
  const classes = ['tab-pane']
  if (props.fade) classes.push('fade')
  if (props.active) {
    classes.push('show', 'active')
  }
  return classes.join(' ')
})
</script>

<template>
  <component
    :is="tag"
    :id="id"
    :class="tabPaneClass"
    role="tabpanel"
    :aria-labelledby="ariaLabelledby"
    tabindex="0"
  >
    <slot />
  </component>
</template>
