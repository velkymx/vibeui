<script setup lang="ts">
import { computed } from 'vue'
import type { BreadcrumbItem } from '../types'

const props = defineProps({
  ariaLabel: { type: String, default: 'breadcrumb' },
  items: { type: Array as () => BreadcrumbItem[], required: true }
})

const emit = defineEmits(['item-click', 'component-error'])

const handleItemClick = (item: BreadcrumbItem, index: number, event: Event) => {
  if (!item.active) {
    emit('item-click', { item, index, event })
  }
}
</script>

<template>
  <nav :aria-label="ariaLabel">
    <ol class="breadcrumb">
      <li
        v-for="(item, index) in items"
        :key="index"
        :class="['breadcrumb-item', { active: item.active }]"
        :aria-current="item.active ? 'page' : undefined"
      >
        <component
          :is="item.href ? 'a' : item.to ? 'router-link' : 'span'"
          :href="item.href"
          :to="item.to"
          @click="handleItemClick(item, index, $event)"
        >
          <!-- Scoped slot for custom item rendering -->
          <slot name="item" :item="item" :index="index">
            {{ item.text }}
          </slot>
        </component>
      </li>
    </ol>
  </nav>
</template>
