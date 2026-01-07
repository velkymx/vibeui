<script setup lang="ts">
import { computed } from 'vue'
import type { AccordionItem } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  flush: { type: Boolean, default: false },
  items: { type: Array as () => AccordionItem[], required: true }
})

const emit = defineEmits(['item-click', 'component-error'])

const handleItemClick = (item: AccordionItem, index: number) => {
  emit('item-click', { item, index })
}
</script>

<template>
  <div :id="id" :class="['accordion', { 'accordion-flush': flush }]">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="accordion-item"
    >
      <h2 class="accordion-header">
        <button
          :class="['accordion-button', { collapsed: !item.show }]"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#${item.id}`"
          :aria-expanded="item.show"
          :aria-controls="item.id"
          @click="handleItemClick(item, index)"
        >
          <!-- Scoped slot for custom title rendering -->
          <slot name="title" :item="item" :index="index">
            {{ item.title }}
          </slot>
        </button>
      </h2>
      <div
        :id="item.id"
        :class="['accordion-collapse', 'collapse', { show: item.show }]"
        :data-bs-parent="`#${id}`"
      >
        <div class="accordion-body">
          <!-- Scoped slot for custom content rendering -->
          <slot name="content" :item="item" :index="index">
            {{ item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
