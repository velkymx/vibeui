<script setup lang="ts">
import type { BreadcrumbItem, ComponentError } from '../types'
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'

const props = defineProps({
  ariaLabel: { type: String, default: 'breadcrumb' },
  items: { type: Array as () => BreadcrumbItem[], required: true }
})

const emit = defineEmits<{
  (e: 'item-click', payload: { item: BreadcrumbItem; index: number; event: Event }): void
  (e: 'component-error', error: ComponentError): void
}>()

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
        :key="item.href || item.text || String(index)"
        :class="['breadcrumb-item', { active: item.active }]"
        :aria-current="item.active ? 'page' : undefined"
      >
        <component
          :is="item.active ? 'span' : safeHref(item.href) ? 'a' : item.to ? 'router-link' : 'button'"
          v-bind="item.active ? {} : linkBindings(safeHref(item.href), item.to)"
          :type="!item.active && !item.href && !item.to ? 'button' : undefined"
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
