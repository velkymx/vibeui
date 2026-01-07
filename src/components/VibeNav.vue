<script setup lang="ts">
import { computed } from 'vue'
import type { Tag, NavItem } from '../types'

const props = defineProps({
  tabs: { type: Boolean, default: false },
  pills: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
  justified: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'ul', default: 'ul' },
  items: { type: Array as () => NavItem[], required: true }
})

const emit = defineEmits(['item-click', 'component-error'])

const navClass = computed(() => {
  const classes = ['nav']
  if (props.tabs) classes.push('nav-tabs')
  if (props.pills) classes.push('nav-pills')
  if (props.fill) classes.push('nav-fill')
  if (props.justified) classes.push('nav-justified')
  if (props.vertical) classes.push('flex-column')
  return classes.join(' ')
})

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
  <component :is="tag" :class="navClass">
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
  </component>
</template>
