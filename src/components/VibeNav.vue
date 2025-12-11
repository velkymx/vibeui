<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Tag, NavItem } from '../types'
import VibeNavItem from './VibeNavItem.vue'

const props = defineProps({
  tabs: { type: Boolean, default: false },
  pills: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
  justified: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'ul', default: 'ul' },
  items: { type: Array as () => NavItem[], default: undefined }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()

const navClass = computed(() => {
  const classes = ['nav']
  if (props.tabs) classes.push('nav-tabs')
  if (props.pills) classes.push('nav-pills')
  if (props.fill) classes.push('nav-fill')
  if (props.justified) classes.push('nav-justified')
  if (props.vertical) classes.push('flex-column')
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="navClass">
    <!-- Shorthand mode: generate from items array -->
    <template v-if="items && items.length > 0 && !slots.default">
      <VibeNavItem
        v-for="(item, index) in items"
        :key="index"
        :href="item.href"
        :to="item.to"
        :active="item.active"
        :disabled="item.disabled"
      >
        {{ item.text }}
      </VibeNavItem>
    </template>

    <!-- Slot mode: full control -->
    <slot v-else />
  </component>
</template>
