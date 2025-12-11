<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataTableColumn, DataTableSort } from '../types'

const props = defineProps({
  // Data
  items: { type: Array as () => any[], default: () => [] },
  columns: { type: Array as () => DataTableColumn[], required: true },

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

  // Pagination
  perPage: { type: Number, default: 10 },
  currentPage: { type: Number, default: 1 },
  perPageOptions: { type: Array as () => number[], default: () => [5, 10, 25, 50, 100] },

  // Sorting
  sortBy: { type: String, default: undefined },
  sortDesc: { type: Boolean, default: false },

  // Display
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No data available' },
  showPerPage: { type: Boolean, default: true },
  showInfo: { type: Boolean, default: true },
  infoText: { type: String, default: 'Showing {start} to {end} of {total} entries' },
  filteredInfoText: { type: String, default: 'Showing {start} to {end} of {total} entries (filtered from {totalRows} total entries)' }
})

const emit = defineEmits(['update:currentPage', 'update:perPage', 'update:sortBy', 'update:sortDesc', 'row-clicked', 'component-error'])

// Local state
const searchQuery = ref('')
const searchDebounceTimer = ref<number | null>(null)
const debouncedSearchQuery = ref('')
const localCurrentPage = ref(props.currentPage)
const localPerPage = ref(props.perPage)
const localSortBy = ref(props.sortBy)
const localSortDesc = ref(props.sortDesc)

// Watch for prop changes
watch(() => props.currentPage, (val) => { localCurrentPage.value = val })
watch(() => props.perPage, (val) => { localPerPage.value = val })
watch(() => props.sortBy, (val) => { localSortBy.value = val })
watch(() => props.sortDesc, (val) => { localSortDesc.value = val })

// Debounced search
watch(searchQuery, (newVal) => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  searchDebounceTimer.value = window.setTimeout(() => {
    debouncedSearchQuery.value = newVal
    localCurrentPage.value = 1 // Reset to first page on search
  }, props.searchDebounce)
})

// Filtered items (based on search)
const filteredItems = computed(() => {
  if (!props.searchable || !debouncedSearchQuery.value) {
    return props.items
  }

  const query = debouncedSearchQuery.value.toLowerCase()
  return props.items.filter((item) => {
    return props.columns.some((column) => {
      if (column.searchable === false) return false
      const value = item[column.key]
      if (value == null) return false
      return String(value).toLowerCase().includes(query)
    })
  })
})

// Sorted items
const sortedItems = computed(() => {
  if (!props.sortable || !localSortBy.value) {
    return filteredItems.value
  }

  const items = [...filteredItems.value]
  const sortKey = localSortBy.value

  items.sort((a, b) => {
    let aVal = a[sortKey]
    let bVal = b[sortKey]

    // Handle null/undefined
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Convert to comparable values
    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()

    if (aVal < bVal) return localSortDesc.value ? 1 : -1
    if (aVal > bVal) return localSortDesc.value ? -1 : 1
    return 0
  })

  return items
})

// Paginated items
const paginatedItems = computed(() => {
  if (!props.paginated) {
    return sortedItems.value
  }

  const start = (localCurrentPage.value - 1) * localPerPage.value
  const end = start + localPerPage.value
  return sortedItems.value.slice(start, end)
})

// Pagination info
const totalRows = computed(() => props.items.length)
const totalFilteredRows = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.ceil(totalFilteredRows.value / localPerPage.value))
const startRow = computed(() => {
  if (totalFilteredRows.value === 0) return 0
  return (localCurrentPage.value - 1) * localPerPage.value + 1
})
const endRow = computed(() => {
  const end = localCurrentPage.value * localPerPage.value
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

  if (localSortBy.value === column.key) {
    localSortDesc.value = !localSortDesc.value
  } else {
    localSortBy.value = column.key
    localSortDesc.value = false
  }

  emit('update:sortBy', localSortBy.value)
  emit('update:sortDesc', localSortDesc.value)
}

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  localCurrentPage.value = page
  emit('update:currentPage', page)
}

const handlePerPageChange = () => {
  localCurrentPage.value = 1
  emit('update:perPage', localPerPage.value)
  emit('update:currentPage', 1)
}

const handleRowClick = (item: any, index: number) => {
  emit('row-clicked', item, index)
}

const getCellValue = (item: any, column: DataTableColumn) => {
  const value = item[column.key]
  if (column.formatter) {
    return column.formatter(value, item)
  }
  return value
}

const getSortIcon = (column: DataTableColumn) => {
  if (!props.sortable || column.sortable === false) return ''
  if (localSortBy.value !== column.key) return '⇅'
  return localSortDesc.value ? '↓' : '↑'
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
            v-model.number="localPerPage"
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
            :key="index"
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
            <li class="page-item" :class="{ disabled: localCurrentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="handlePageChange(localCurrentPage - 1)">
                Previous
              </a>
            </li>

            <!-- First page -->
            <li v-if="localCurrentPage > 3" class="page-item">
              <a class="page-link" href="#" @click.prevent="handlePageChange(1)">1</a>
            </li>
            <li v-if="localCurrentPage > 4" class="page-item disabled">
              <span class="page-link">...</span>
            </li>

            <!-- Page numbers around current page -->
            <li
              v-for="page in Array.from({ length: totalPages }, (_, i) => i + 1).filter(
                p => p >= localCurrentPage - 2 && p <= localCurrentPage + 2
              )"
              :key="page"
              class="page-item"
              :class="{ active: page === localCurrentPage }"
            >
              <a class="page-link" href="#" @click.prevent="handlePageChange(page)">
                {{ page }}
              </a>
            </li>

            <!-- Last page -->
            <li v-if="localCurrentPage < totalPages - 3" class="page-item disabled">
              <span class="page-link">...</span>
            </li>
            <li v-if="localCurrentPage < totalPages - 2" class="page-item">
              <a class="page-link" href="#" @click.prevent="handlePageChange(totalPages)">
                {{ totalPages }}
              </a>
            </li>

            <li class="page-item" :class="{ disabled: localCurrentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="handlePageChange(localCurrentPage + 1)">
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
