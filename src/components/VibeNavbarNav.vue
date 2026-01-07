<script setup lang="ts">
import { computed } from 'vue'
import type { NavItem } from '../types'

const props = defineProps({
  tag: { type: String, default: 'ul' },
  items: { type: Array as () => NavItem[], default: undefined }
})

const emit = defineEmits(['item-click', 'component-error'])

const getItemClass = (item: NavItem) => {
  const classes = ['nav-link']
  if (item.active) classes.push('active')
  if (item.disabled) classes.push('disabled')
  return classes.join(' ')
}

const getItemTag = (item: NavItem) => {
  if (item.href) return 'a'
  if (item.to) return 'router-link'
  return 'a'
}

const handleItemClick = (item: NavItem, index: number, event: Event) => {
  if (!item.disabled) {
    emit('item-click', { item, index, event })
  }
}
</script>

<template>
  <component :is="tag" class="navbar-nav">
    <!-- Data-driven mode: generate from items array -->
    <template v-if="items && items.length > 0">
      <li v-for="(item, index) in items" :key="index" class="nav-item">
        <component
          :is="getItemTag(item)"
          :class="getItemClass(item)"
          :href="item.href"
          :to="item.to"
          :aria-current="item.active ? 'page' : undefined"
          :aria-disabled="item.disabled"
          @click="handleItemClick(item, index, $event)"
        >
          <!-- Scoped slot for custom item rendering -->
          <slot name="item" :item="item" :index="index">
            {{ item.text }}
          </slot>
        </component>
      </li>
    </template>

    <!-- Slot mode: for custom navbar content (not nav items) -->
    <slot v-else />
  </component>
</template>
