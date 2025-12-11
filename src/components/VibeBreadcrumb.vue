<script setup lang="ts">
import { useSlots } from 'vue'
import type { BreadcrumbItem } from '../types'
import VibeBreadcrumbItem from './VibeBreadcrumbItem.vue'

const props = defineProps({
  ariaLabel: { type: String, default: 'breadcrumb' },
  items: { type: Array as () => BreadcrumbItem[], default: undefined }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()
</script>

<template>
  <nav :aria-label="ariaLabel">
    <ol class="breadcrumb">
      <!-- Shorthand mode: generate from items array -->
      <template v-if="items && items.length > 0 && !slots.default">
        <VibeBreadcrumbItem
          v-for="(item, index) in items"
          :key="index"
          :href="item.href"
          :to="item.to"
          :active="item.active"
        >
          {{ item.text }}
        </VibeBreadcrumbItem>
      </template>

      <!-- Slot mode: full control -->
      <slot v-else />
    </ol>
  </nav>
</template>
