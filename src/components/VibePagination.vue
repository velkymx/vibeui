<script setup lang="ts">
import { computed } from 'vue'
import type { Size, ComponentError } from '../types'

const props = defineProps({
  size: { type: String as () => Size, default: undefined },
  ariaLabel: { type: String, default: 'Pagination' },
  totalPages: { type: Number, required: true },
  currentPage: {
    type: Number,
    default: 1,
    validator: (v: number) => {
      if (import.meta.env.DEV && (!Number.isInteger(v) || v < 1)) {
        console.warn(`[VibePagination] currentPage must be a positive integer, got ${v}`)
      }
      return true
    }
  },
  showPrevNext: { type: Boolean, default: true },
  prevText: { type: String, default: 'Previous' },
  nextText: { type: String, default: 'Next' },
  maxVisiblePages: { type: Number, default: 7 }
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'page-click', page: number): void
  (e: 'component-error', error: ComponentError): void
}>()

const paginationClass = computed(() => {
  const classes = ['pagination']
  if (props.size) classes.push(`pagination-${props.size}`)
  return classes.join(' ')
})

// Returns page numbers and null for ellipsis separators
const visibleItems = computed((): (number | null)[] => {
  const total = props.totalPages
  if (total === 0) return []
  if (import.meta.env.DEV && props.maxVisiblePages < 5) {
    console.warn('[VibePagination] maxVisiblePages must be at least 5. Got:', props.maxVisiblePages)
  }
  const max = Math.max(5, props.maxVisiblePages)

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const sidePages = Math.max(1, max - 4)
  const half = Math.floor(sidePages / 2)
  let lo = Math.max(2, props.currentPage - half)
  let hi = lo + sidePages - 1

  if (hi > total - 1) {
    hi = total - 1
    lo = Math.max(2, hi - sidePages + 1)
  }

  const result: (number | null)[] = [1]
  if (lo > 2) result.push(null)
  for (let p = lo; p <= hi; p++) result.push(p)
  if (hi < total - 1) result.push(null)
  result.push(total)
  return result
})

const handlePageClick = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
    emit('page-click', page)
  }
}

const isPrevDisabled = computed(() => props.totalPages === 0 || props.currentPage <= 1)
const isNextDisabled = computed(() => props.totalPages === 0 || props.currentPage >= props.totalPages)
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
          @click="handlePageClick(currentPage - 1)"
        >
          <!-- Scoped slot for custom prev button -->
          <slot name="prev" :disabled="isPrevDisabled">
            {{ prevText }}
          </slot>
        </button>
      </li>

      <!-- Page numbers (with optional ellipsis) -->
      <template v-for="(item, idx) in visibleItems" :key="item !== null ? `p${item}` : `e${idx}`">
        <li v-if="item === null" class="page-item disabled" aria-hidden="true">
          <span class="page-link">…</span>
        </li>
        <li v-else :class="['page-item', { active: item === currentPage }]">
          <button
            class="page-link"
            type="button"
            :aria-current="item === currentPage ? 'page' : undefined"
            @click="handlePageClick(item)"
          >
            <slot name="page" :page="item" :active="item === currentPage">
              {{ item }}
            </slot>
          </button>
        </li>
      </template>

      <!-- Next button -->
      <li v-if="showPrevNext" :class="['page-item', { disabled: isNextDisabled }]">
        <button
          class="page-link"
          type="button"
          :disabled="isNextDisabled"
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
