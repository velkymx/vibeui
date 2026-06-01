<script setup lang="ts">
import { computed } from 'vue'
import type { Tag, ListGroupItem } from '../types'

const props = defineProps({
  flush: { type: Boolean, default: false },
  horizontal: { type: [Boolean, String], default: false },
  numbered: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'ul' | 'ol', default: 'ul' },
  items: { type: Array as () => ListGroupItem[], required: true }
})

const emit = defineEmits(['item-click', 'component-error'])

const listGroupClass = computed(() => {
  const classes = ['list-group']
  if (props.flush) classes.push('list-group-flush')
  if (props.numbered) classes.push('list-group-numbered')

  if (props.horizontal === true) {
    classes.push('list-group-horizontal')
  } else if (typeof props.horizontal === 'string') {
    classes.push(`list-group-horizontal-${props.horizontal}`)
  }

  return classes.join(' ')
})

const getItemTag = (item: ListGroupItem) => {
  if (item.href) return 'a'
  if (item.to) return 'router-link'
  return 'li'
}

const getItemClass = (item: ListGroupItem) => {
  const classes = ['list-group-item']
  if (item.active) classes.push('active')
  if (item.disabled) classes.push('disabled')
  if (item.variant) classes.push(`list-group-item-${item.variant}`)
  return classes.join(' ')
}

const handleItemClick = (item: ListGroupItem, index: number, event: Event) => {
  if (!item.disabled) {
    emit('item-click', { item, index, event })
  }
}
</script>

<template>
  <component :is="tag" :class="listGroupClass">
    <component
      :is="getItemTag(item)"
      v-for="(item, index) in items"
      :key="index"
      :class="getItemClass(item)"
      :href="item.href"
      :to="item.to"
      :aria-disabled="item.disabled"
      :aria-current="item.active"
      @click="handleItemClick(item, index, $event)"
    >
      <!-- Scoped slot for custom item rendering -->
      <slot name="item" :item="item" :index="index">
        {{ item.text }}
      </slot>
    </component>
  </component>
</template>
