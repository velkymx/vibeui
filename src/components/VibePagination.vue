<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Size } from '../types'
import VibePaginationItem from './VibePaginationItem.vue'

const props = defineProps({
  size: { type: String as () => Size, default: undefined },
  ariaLabel: { type: String, default: 'Pagination' },
  // Shorthand props
  totalPages: { type: Number, default: undefined },
  currentPage: { type: Number, default: 1 },
  showPrevNext: { type: Boolean, default: true }
})

const emit = defineEmits(['page-click', 'component-error'])

const slots = useSlots()

const paginationClass = computed(() => {
  const classes = ['pagination']
  if (props.size) classes.push(`pagination-${props.size}`)
  return classes.join(' ')
})

const pages = computed(() => {
  if (!props.totalPages) return []
  return Array.from({ length: props.totalPages }, (_, i) => i + 1)
})

const handlePageClick = (page: number) => {
  if (page >= 1 && page <= props.totalPages!) {
    emit('page-click', page)
  }
}
</script>

<template>
  <nav :aria-label="ariaLabel">
    <ul :class="paginationClass">
      <!-- Shorthand mode: generate from totalPages -->
      <template v-if="totalPages && !slots.default">
        <VibePaginationItem
          v-if="showPrevNext"
          :disabled="currentPage === 1"
          @click="handlePageClick(currentPage - 1)"
        >
          Previous
        </VibePaginationItem>

        <VibePaginationItem
          v-for="page in pages"
          :key="page"
          :active="page === currentPage"
          @click="handlePageClick(page)"
        >
          {{ page }}
        </VibePaginationItem>

        <VibePaginationItem
          v-if="showPrevNext"
          :disabled="currentPage === totalPages"
          @click="handlePageClick(currentPage + 1)"
        >
          Next
        </VibePaginationItem>
      </template>

      <!-- Slot mode: full control -->
      <slot v-else />
    </ul>
  </nav>
</template>
