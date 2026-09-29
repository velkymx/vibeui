<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BreadcrumbItem, ComponentError } from '../types'
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'
import { onNavBreadcrumbUpdated } from '../composables/eventHelpers'

const props = defineProps({
  ariaLabel: { type: String, default: 'breadcrumb' },
  // Optional: when omitted, the trail can be driven by the bus (see busUpdates).
  items: { type: Array as () => BreadcrumbItem[], default: () => [] },
  // Opt in to render the trail published on the bus `nav:breadcrumb-updated`
  // channel. Explicit `items` always take precedence.
  busUpdates: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'item-click', payload: { item: BreadcrumbItem; index: number; event: Event }): void
  (e: 'component-error', error: ComponentError): void
}>()

// Trail received from the bus, mapped from { label, path } to BreadcrumbItem.
const busItems = ref<BreadcrumbItem[]>([])
if (props.busUpdates) {
  // on() auto-unsubscribes when this component unmounts.
  onNavBreadcrumbUpdated(({ items }) => {
    busItems.value = items.map(i => ({ text: i.label, to: i.path }))
  })
}

// Explicit items win; otherwise fall back to the bus-provided trail.
const displayItems = computed<BreadcrumbItem[]>(() =>
  props.items.length > 0 ? props.items : busItems.value
)

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
        v-for="(item, index) in displayItems"
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
