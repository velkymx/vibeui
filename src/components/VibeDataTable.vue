<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { DataTableColumn } from '../types'

const props = defineProps({
  // Data
  items: { type: Array as () => T[], default: () => [] },
  columns: { type: Array as () => DataTableColumn[], required: true },
  rowKey: { type: String, default: 'id' }, // Key to use for unique row identification

  // Table styling
  striped: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
  borderless: { type: Boolean, default: false },
  hover: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  responsive: { type: Boolean, default: true },
  variant: { type: String, default: undefined },

  // Features
  searchable: { type: Boolean, default: true },
  sortable: { type: Boolean, default: true },
  paginated: { type: Boolean, default: true },

  // Search
  searchPlaceholder: { type: String, default: 'Search...' },
  searchDebounce: { type: Number, default: 300 },

  // Display
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No data available' },
  showPerPage: { type: Boolean, default: true },
  showInfo: { type: Boolean, default: true },
  infoText: { type: String, default: 'Showing {start} to {end} of {total} entries' },
  filteredInfoText: { type: String, default: 'Showing {start} to {end} of {total} entries (filtered from {totalRows} total entries)' },
  perPageOptions: { type: Array as () => number[], default: () => [5, 10, 25, 50, 100] }
})

// Use defineModel for two-way binding (Vue 3.4+)
const currentPage = defineModel<number>('currentPage', { default: 1 })
const perPage = defineModel<number>('perPage', { default: 10 })
const sortBy = defineModel<string | undefined>('sortBy', { default: undefined })
const sortDesc = defineModel<boolean>('sortDesc', { default: false })

const emit = defineEmits(['row-clicked', 'component-error'])

// Local state for search
const searchQuery = ref('')
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const debouncedSearchQuery = ref('')

/**
 * Generate a unique key for each row.
 * IMPORTANT: For best performance, always provide a `rowKey` prop that matches
 * a unique identifier property in your data (e.g., 'id', 'uuid', '_id').
 * The fallback uses index which can cause issues with sorting/filtering.
 */
const getRowKey = (item: T, index: number): string | number => {
  // Try to use the specified rowKey property
  if (props.rowKey && item[props.rowKey] !== undefined) {
    return String(item[props.rowKey])
  }

  // Warn in development if no rowKey is found
  if (import.meta.env.DEV && index === 0) {
    console.warn(
      `[VibeDataTable] No unique key found for rows. ` +
      `For better performance and correct behavior during sorting/filtering, ` +
      `provide a 'rowKey' prop that matches a unique property in your items (e.g., rowKey="id").`
    )
  }

  // Fallback to index - not ideal but avoids expensive JSON.stringify
  return index
}

// Debounced search with proper cleanup
watch(searchQuery, (newVal) => {
  if (searchDebounceTimer.value !== null) {
    clearTimeout(searchDebounceTimer.value)
  }
  searchDebounceTimer.value = setTimeout(() => {
    debouncedSearchQuery.value = newVal
    currentPage.value = 1 // Reset to first page on search
    searchDebounceTimer.value = null
  }, props.searchDebounce)
})

// Cleanup debounce timer on unmount
onBeforeUnmount(() => {
  if (searchDebounceTimer.value !== null) {
    clearTimeout(searchDebounceTimer.value)
    searchDebounceTimer.value = null
  }
})

// Filtered items (based on search)
const filteredItems = computed(() => {
  if (!props.searchable || !debouncedSearchQuery.value) {
    return props.items || []
  }

  const query = debouncedSearchQuery.value.toLowerCase()
  return (props.items || []).filter((item) => {
    return (props.columns || []).some((column) => {
      if (column.searchable === false) return false
      const value = item[column.key]
      if (value == null) return false
      return String(value).toLowerCase().includes(query)
    })
  })
})

/**
 * Compare two values for sorting, handling unknown types safely.
 * Supports strings, numbers, booleans, and Dates.
 * Non-comparable types (objects, arrays, symbols) are treated as equal.
 */
const compareValues = (a: unknown, b: unknown, desc: boolean): number => {
  // Handle null/undefined - push to end
  if (a == null) return 1
  if (b == null) return -1

  // Handle strings
  if (typeof a === 'string' && typeof b === 'string') {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()
    if (aLower < bLower) return desc ? 1 : -1
    if (aLower > bLower) return desc ? -1 : 1
    return 0
  }

  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    if (a < b) return desc ? 1 : -1
    if (a > b) return desc ? -1 : 1
    return 0
  }

  // Handle booleans (false < true)
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    if (a === b) return 0
    return (a ? 1 : -1) * (desc ? -1 : 1)
  }

  // Handle Dates
  if (a instanceof Date && b instanceof Date) {
    const aTime = a.getTime()
    const bTime = b.getTime()
    if (aTime < bTime) return desc ? 1 : -1
    if (aTime > bTime) return desc ? -1 : 1
    return 0
  }

  // Non-comparable types (objects, arrays, symbols, mixed types) - treat as equal
  return 0
}

// Sorted items
const sortedItems = computed(() => {
  if (!props.sortable || !sortBy.value) {
    return filteredItems.value
  }

  const items = [...filteredItems.value]
  const sortKey = sortBy.value

  items.sort((a, b) => compareValues(a[sortKey], b[sortKey], sortDesc.value))

  return items
})

// Paginated items
const paginatedItems = computed(() => {
  if (!props.paginated) {
    return sortedItems.value
  }

  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return sortedItems.value.slice(start, end)
})

// Pagination info
const totalRows = computed(() => props.items.length)
const totalFilteredRows = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.ceil(totalFilteredRows.value / perPage.value))
const startRow = computed(() => {
  if (totalFilteredRows.value === 0) return 0
  return (currentPage.value - 1) * perPage.value + 1
})
const endRow = computed(() => {
  const end = currentPage.value * perPage.value
  return Math.min(end, totalFilteredRows.value)
})

const infoString = computed(() => {
  const isFiltered = totalFilteredRows.value !== totalRows.value
  const template = isFiltered ? props.filteredInfoText : props.infoText

  return template
    .replace('{start}', String(startRow.value))
    .replace('{end}', String(endRow.value))
    .replace('{total}', String(totalFilteredRows.value))
    .replace('{totalRows}', String(totalRows.value))
})

// Table classes
const tableClass = computed(() => {
  const classes = ['table']
  if (props.striped) classes.push('table-striped')
  if (props.bordered) classes.push('table-bordered')
  if (props.borderless) classes.push('table-borderless')
  if (props.hover) classes.push('table-hover')
  if (props.small) classes.push('table-sm')
  if (props.variant) classes.push(`table-${props.variant}`)
  return classes.join(' ')
})

// Methods
const handleSort = (column: DataTableColumn) => {
  if (!props.sortable || column.sortable === false) return

  if (sortBy.value === column.key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = column.key
    sortDesc.value = false
  }
}

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const handlePerPageChange = () => {
  currentPage.value = 1
}

const handleRowClick = (item: T, index: number) => {
  emit('row-clicked', item, index)
}

const getCellValue = (item: T, column: DataTableColumn) => {
  const value = item[column.key]
  if (column.formatter) {
    return column.formatter(value, item)
  }
  return value
}

const getSortIcon = (column: DataTableColumn) => {
  if (!props.sortable || column.sortable === false) return ''
  if (sortBy.value !== column.key) return '⇅'
  return sortDesc.value ? '↓' : '↑'
}

const getThStyle = (column: DataTableColumn) => {
  const style = { ...column.thStyle }
  if (props.sortable && column.sortable !== false) {
    style.cursor = 'pointer'
  }
  return style
}
</script>

<template>
  <div class="vibe-datatable">
    <!-- Top controls -->
    <div class="row mb-3">
      <div v-if="searchable" class="col-md-6 mb-2 mb-md-0">
        <input
          v-model="searchQuery"
          type="search"
          class="form-control"
          :placeholder="searchPlaceholder"
        />
      </div>
      <div v-if="showPerPage && paginated" class="col-md-6">
        <div class="d-flex justify-content-md-end align-items-center">
          <label class="me-2 mb-0">Show</label>
          <select
            v-model.number="perPage"
            class="form-select form-select-sm"
            style="width: auto"
            @change="handlePerPageChange"
          >
            <option v-for="option in perPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <span class="ms-2">entries</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div :class="{ 'table-responsive': responsive }">
      <table :class="tableClass">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="column.headerClass"
              :style="getThStyle(column)"
              @click="handleSort(column)"
            >
              {{ column.label }}
              <span v-if="sortable && column.sortable !== false" class="ms-1">
                {{ getSortIcon(column) }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="getRowKey(item, index)"
            @click="handleRowClick(item, index)"
            :style="{ cursor: 'pointer' }"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.class"
              :style="column.tdStyle"
            >
              <slot :name="`cell(${column.key})`" :item="item" :value="item[column.key]" :index="index">
                {{ getCellValue(item, column) }}
              </slot>
            </td>
          </tr>
          <tr v-if="paginatedItems.length === 0 && showEmpty">
            <td :colspan="columns.length" class="text-center">
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom controls -->
    <div class="row">
      <div v-if="showInfo" class="col-md-6 mb-2 mb-md-0">
        <div class="datatable-info">
          {{ infoString }}
        </div>
      </div>
      <div v-if="paginated && totalPages > 1" class="col-md-6">
        <nav>
          <ul class="pagination justify-content-md-end mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="handlePageChange(currentPage - 1)">
                Previous
              </a>
            </li>

            <!-- First page -->
            <li v-if="currentPage > 3" class="page-item">
              <a class="page-link" href="#" @click.prevent="handlePageChange(1)">1</a>
            </li>
            <li v-if="currentPage > 4" class="page-item disabled">
              <span class="page-link">...</span>
            </li>

            <!-- Page numbers around current page -->
            <li
              v-for="page in Array.from({ length: totalPages }, (_, i) => i + 1).filter(
                p => p >= currentPage - 2 && p <= currentPage + 2
              )"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="handlePageChange(page)">
                {{ page }}
              </a>
            </li>

            <!-- Last page -->
            <li v-if="currentPage < totalPages - 3" class="page-item disabled">
              <span class="page-link">...</span>
            </li>
            <li v-if="currentPage < totalPages - 2" class="page-item">
              <a class="page-link" href="#" @click.prevent="handlePageChange(totalPages)">
                {{ totalPages }}
              </a>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="handlePageChange(currentPage + 1)">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vibe-datatable {
  width: 100%;
}

.datatable-info {
  padding: 0.5rem 0;
  color: #6c757d;
}
</style>
