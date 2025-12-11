<script setup lang="ts">
import { useSlots } from 'vue'
import type { NavItem } from '../types'
import VibeNavItem from './VibeNavItem.vue'

const props = defineProps({
  tag: { type: String, default: 'ul' },
  items: { type: Array as () => NavItem[], default: undefined }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()
</script>

<template>
  <component :is="tag" class="navbar-nav">
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
