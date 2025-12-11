<script setup lang="ts">
import { useSlots } from 'vue'
import type { AccordionItem } from '../types'
import VibeAccordionItem from './VibeAccordionItem.vue'

const props = defineProps({
  id: { type: String, required: true },
  flush: { type: Boolean, default: false },
  items: { type: Array as () => AccordionItem[], default: undefined }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()
</script>

<template>
  <div :id="id" :class="['accordion', { 'accordion-flush': flush }]">
    <!-- Shorthand mode: generate from items array -->
    <template v-if="items && items.length > 0 && !slots.default">
      <VibeAccordionItem
        v-for="(item, index) in items"
        :key="index"
        :id="item.id"
        :parent-id="id"
        :title="item.title"
        :show="item.show"
      >
        {{ item.content }}
      </VibeAccordionItem>
    </template>

    <!-- Slot mode: full control -->
    <slot v-else />
  </div>
</template>
