<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Tag, ListGroupItem } from '../types'
import VibeListGroupItem from './VibeListGroupItem.vue'

const props = defineProps({
  flush: { type: Boolean, default: false },
  horizontal: { type: [Boolean, String], default: false },
  numbered: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'ul' | 'ol', default: 'ul' },
  items: { type: Array as () => ListGroupItem[], default: undefined }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()

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
</script>

<template>
  <component :is="tag" :class="listGroupClass">
    <!-- Shorthand mode: generate from items array -->
    <template v-if="items && items.length > 0 && !slots.default">
      <VibeListGroupItem
        v-for="(item, index) in items"
        :key="index"
        :href="item.href"
        :to="item.to"
        :active="item.active"
        :disabled="item.disabled"
        :variant="item.variant"
      >
        {{ item.text }}
      </VibeListGroupItem>
    </template>

    <!-- Slot mode: full control -->
    <slot v-else />
  </component>
</template>
