<script setup lang="ts">
import { computed } from 'vue'
import type { Size } from '../types'

const props = defineProps({
  size: { type: String as () => Size, default: undefined },
  ariaLabel: { type: String, default: 'Pagination' },
  totalPages: { type: Number, required: true },
  currentPage: { type: Number, default: 1 },
  showPrevNext: { type: Boolean, default: true },
  prevText: { type: String, default: 'Previous' },
  nextText: { type: String, default: 'Next' }
})

const emit = defineEmits(['update:currentPage', 'page-click', 'component-error'])

const paginationClass = computed(() => {
  const classes = ['pagination']
  if (props.size) classes.push(`pagination-${props.size}`)
  return classes.join(' ')
})

const pages = computed(() => {
  return Array.from({ length: props.totalPages }, (_, i) => i + 1)
})

const handlePageClick = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
    emit('page-click', page)
  }
}

const isPrevDisabled = computed(() => props.currentPage === 1)
const isNextDisabled = computed(() => props.currentPage === props.totalPages)
</script>

<template>
  <nav :aria-label="ariaLabel">
    <ul :class="paginationClass">
      <!-- Previous button -->
      <li v-if="showPrevNext" :class="['page-item', { disabled: isPrevDisabled }]">
        <button
          class="page-link"
          type="button"
          :disabled="isPrevDisabled"
          :aria-disabled="isPrevDisabled"
          @click="handlePageClick(currentPage - 1)"
        >
          <!-- Scoped slot for custom prev button -->
          <slot name="prev" :disabled="isPrevDisabled">
            {{ prevText }}
          </slot>
        </button>
      </li>

      <!-- Page numbers -->
      <li
        v-for="page in pages"
        :key="page"
        :class="['page-item', { active: page === currentPage }]"
      >
        <button
          class="page-link"
          type="button"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="handlePageClick(page)"
        >
          <!-- Scoped slot for custom page rendering -->
          <slot name="page" :page="page" :active="page === currentPage">
            {{ page }}
          </slot>
        </button>
      </li>

      <!-- Next button -->
      <li v-if="showPrevNext" :class="['page-item', { disabled: isNextDisabled }]">
        <button
          class="page-link"
          type="button"
          :disabled="isNextDisabled"
          :aria-disabled="isNextDisabled"
          @click="handlePageClick(currentPage + 1)"
        >
          <!-- Scoped slot for custom next button -->
          <slot name="next" :disabled="isNextDisabled">
            {{ nextText }}
          </slot>
        </button>
      </li>
    </ul>
  </nav>
</template>
