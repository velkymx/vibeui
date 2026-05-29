<script setup lang="ts">
import { computed } from 'vue'
import type { Tag, ListGroupItem, ComponentError } from '../types'
import { safeHref } from '../utils/safeHref'

const props = defineProps({
  flush: { type: Boolean, default: false },
  horizontal: { type: [Boolean, String], default: false },
  numbered: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'ul' | 'ol', default: 'ul' },
  items: { type: Array as () => ListGroupItem[], required: true }
})

const emit = defineEmits<{
  (e: 'item-click', payload: { item: ListGroupItem; index: number; event: Event }): void
  (e: 'component-error', error: ComponentError): void
}>()

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
    <template v-for="(item, index) in items" :key="item.href ?? item.text ?? index">
    <component
      v-memo="[item.href, item.to, item.active, item.disabled, item.variant, item.text]"
      :is="safeHref(item.href) ? 'a' : item.to ? 'router-link' : 'li'"
      :class="getItemClass(item)"
      :href="safeHref(item.href)"
      :to="item.to"
      :aria-disabled="item.disabled || undefined"
      :aria-current="item.active"
      @click="handleItemClick(item, index, $event)"
    >
      <!-- Scoped slot for custom item rendering -->
      <slot name="item" :item="item" :index="index">
        {{ item.text }}
      </slot>
    </component>
    </template>
  </component>
</template>
