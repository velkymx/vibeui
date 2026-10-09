<script setup lang="ts" generic="T extends object">
import { ref, computed, watch, type PropType } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { DataTableColumn, ComponentError, Variant } from '../types'
import { safeCssObject } from '../utils/safeCss'
import { useDebouncedRef } from '../composables/useDebouncedRef'
import { isDev } from '../composables/useEventBus'
import { useVibeTable } from '../composables/useVibeTable'

const props = defineProps({
  // Data
  items: { type: Array as () => T[], default: () => [] },
  // Defaults to [] rather than required: undefined/missing columns is a supported
  // transient state (e.g. async data not yet loaded). A default keeps every
  // `for (… of props.columns)` safe and avoids a Vue "Invalid prop" warning.
  columns: { type: Array as () => DataTableColumn<T>[], default: () => [] },
  rowKey: { type: String, default: 'id' }, // Key to use for unique row identification

  // Table styling
  striped: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
  borderless: { type: Boolean, default: false },
  hover: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  responsive: { type: Boolean, default: true },
  stack: { type: Boolean, default: false },
  variant: { type: String as PropType<Variant>, default: undefined },

  // Features
  searchable: { type: Boolean, default: true },
  sortable: { type: Boolean, default: true },
  paginated: { type: Boolean, default: true },
  // #283 Phase 1: row selection. false (off), 'single', 'multiple', or true
  // (= multiple). Renders an opt-in leading checkbox column.
  selectable: { type: [Boolean, String] as PropType<boolean | 'single' | 'multiple'>, default: false },
  // #283 Phase 2a: enable multi-column sort (shift-click appends). Off = the
  // existing single-column sort.
  multiSort: { type: Boolean, default: false },

  // #124: server-side (manual) mode. When true, the table does no local
  // filtering/sorting/paging: `items` is rendered as-is (the current page from
  // the backend) and `totalRows` drives pagination. Page/sort changes emit via
  // the existing models (update:currentPage/update:sortBy); search emits `search`.
  serverMode: { type: Boolean, default: false },
  totalRows: { type: Number, default: undefined },

  // Search
  searchPlaceholder: { type: String, default: 'Search...' },
  searchDebounce: { type: Number, default: undefined },

  // Display
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No data available' },
  loading: { type: Boolean, default: false },
  showPerPage: { type: Boolean, default: true },
  showInfo: { type: Boolean, default: true },
  infoText: { type: String, default: 'Showing {start} to {end} of {total} entries' },
  filteredInfoText: { type: String, default: 'Showing {start} to {end} of {total} entries (filtered from {totalRows} total entries)' },
  perPageOptions: { type: Array as () => number[], default: () => [5, 10, 25, 50, 100] },
  clickable: { type: Boolean, default: false }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, undefined))


// Use defineModel for two-way binding (Vue 3.4+)
const currentPage = defineModel<number>('currentPage', { default: 1 })
const perPage = defineModel<number>('perPage', { default: 10 })
const sortBy = defineModel<string | undefined>('sortBy', { default: undefined })
const sortDesc = defineModel<boolean>('sortDesc', { default: false })
// #283 Phase 2a: ordered multi-sort state (source of truth when multiSort is on).
const sort = defineModel<{ id: string; desc: boolean }[]>('sort', { default: () => [] })
// #283 Phase 1: selected row keys (ids per rowKey). Two-way for controlled use.
const selectedRows = defineModel<(string | number)[]>('selectedRows', { default: () => [] })

const emit = defineEmits<{
  (e: 'row-clicked', item: T, globalIndex: number): void
  (e: 'component-error', error: ComponentError): void
  // #124: emitted with the (debounced) search query so a server-mode consumer can fetch.
  (e: 'search', query: string): void
  // #283: emitted when a row's selection toggles (the row and its new state).
  (e: 'row-selected', item: T, selected: boolean): void
}>()

// #147: type the per-column cell slots to the row type T. A `cell(<key>)` slot
// receives the typed row, the typed cell value, and the row index, so consumers
// get autocomplete and type-checking instead of `any`.
defineSlots<{
  [K in keyof T & string as `cell(${K})`]?: (props: { item: T; value: T[K]; index: number }) => unknown
}>()

// Local state for search
const searchQuery = ref('')
// #158: debounced mirror. The pending timer clears on scope dispose, so no
// post-unmount commit can fire (replaces the hand-rolled timer + guard).
const debouncedSearchQuery = useDebouncedRef('', () => resolveProp(props.searchDebounce, vibeDefaults.debounce, 300))

/**
 * Generate a unique key for each row.
 * IMPORTANT: For best performance, always provide a `rowKey` prop that matches
 * a unique identifier property in your data (e.g., 'id', 'uuid', '_id').
 * The fallback uses index which can cause issues with sorting/filtering.
 */
// T is constrained to `object` so plain interfaces (no index signature) work as
// row types (#38). `object` can't be indexed by an arbitrary string, so reads by
// a runtime string key (rowKey, sortBy) go through this cast. Column reads use
// `keyof T`, which type-checks without it.
const readField = (row: T, key: string): unknown => (row as Record<string, unknown>)[key]

const getRowKey = (item: T, index: number): string | number => {
  // Try to use the specified rowKey property
  const rowKeyValue = readField(item, props.rowKey)
  if (props.rowKey && rowKeyValue !== undefined) {
    return String(rowKeyValue)
  }

  // Warn in development if no rowKey is found
  if (isDev() && index === 0) {
    console.warn(
      `[VibeDataTable] No unique key found for rows. ` +
      `For better performance and correct behavior during sorting/filtering, ` +
      `provide a 'rowKey' prop that matches a unique property in your items (e.g., rowKey="id").`
    )
  }

  // Fallback: use a globally unique index by combining page offset + local index.
  // Page-local index alone causes duplicate Vue keys across pages (page 1 and page 2
  // both have indices 0..perPage-1), which makes Vue patch wrong DOM rows.
  return `__row_${(startRow.value - 1) + index}`
}

// Fan raw input into the debounced mirror; side effects run on commit.
watch(searchQuery, (newVal) => {
  debouncedSearchQuery.value = newVal
})

// Watch through a fresh array so every commit notifies: watch() skips the
// callback when the value is unchanged, but every input event schedules work
// (matches the pre-#158 per-keystroke timer behavior).
watch(() => [debouncedSearchQuery.value], ([newVal]) => {
  currentPage.value = 1
  // #124: let a server-mode consumer fetch the matching page.
  emit('search', newVal)
})

// #283: the filter/sort/paginate pipeline is owned by TanStack Table v9 via
// useVibeTable. `paginatedItems` (visible rows) and `filteredCount` (local
// filtered total) preserve the previous contracts exactly; the component keeps
// its own markup, v-models, and per-cell maps.
const { paginatedItems, filteredCount, selection } = useVibeTable<T>({
  items: () => props.items,
  columns: () => props.columns,
  rowKey: () => props.rowKey,
  searchable: () => props.searchable,
  sortable: () => props.sortable,
  paginated: () => props.paginated,
  serverMode: () => props.serverMode,
  totalRows: () => props.totalRows,
  search: debouncedSearchQuery,
  currentPage,
  perPage,
  sortBy,
  sortDesc,
  multiSort: () => props.multiSort,
  sort,
  selectable: () => props.selectable,
  selectedRows
})

// Selection key for a row, matching the engine's getRowId (rowKey value).
const selectKey = (item: T): string => String(readField(item, props.rowKey))

const onToggleRow = (event: Event, item: T) => {
  const key = selectKey(item)
  selection.toggleRow(event, key)
  emit('row-selected', item, selection.isSelected(key))
}

// Unwrapped for the template (selection holds ComputedRefs, not auto-unwrapped
// as nested object properties).
const selectEnabled = computed(() => selection.enabled.value)
const selectMultiple = computed(() => selection.multiple.value)
const selectAllChecked = computed(() => selection.isAllSelected.value)
const selectAllIndeterminate = computed(() => selection.isIndeterminate.value)
const isRowSelected = (item: T): boolean => selection.isSelected(selectKey(item))
// Colspan for the loading/empty rows, including the select column when shown.
const colspanCount = computed(() => (props.columns?.length || 1) + (selectEnabled.value ? 1 : 0))

// Pagination info
// Rows loaded in the browser. In server mode this is just the current page slice.
const clientTotalRows = computed(() => props.items.length)
// #124: the total the pagination reflects. Server mode uses the external totalRows
// prop (the backend's full count); client mode uses the locally filtered count.
const totalFilteredRows = computed(() =>
  props.serverMode ? (props.totalRows ?? clientTotalRows.value) : filteredCount.value
)
const totalPages = computed(() => Math.ceil(totalFilteredRows.value / Math.max(1, perPage.value)))
const startRow = computed(() => {
  if (totalFilteredRows.value === 0) return 0
  return (currentPage.value - 1) * perPage.value + 1
})
const endRow = computed(() => {
  // Server mode: the slice length is whatever the backend returned for this page.
  if (props.serverMode) {
    return startRow.value === 0 ? 0 : startRow.value + props.items.length - 1
  }
  const end = currentPage.value * perPage.value
  return Math.min(end, totalFilteredRows.value)
})

const infoString = computed(() => {
  // "filtered from N" only makes sense for local filtering.
  const isFiltered = !props.serverMode && totalFilteredRows.value !== clientTotalRows.value
  const template = isFiltered ? props.filteredInfoText : props.infoText

  return template
    .replace('{start}', String(startRow.value))
    .replace('{end}', String(endRow.value))
    .replace('{total}', String(totalFilteredRows.value))
    .replace('{totalRows}', String(props.serverMode ? totalFilteredRows.value : clientTotalRows.value))
})

const visiblePages = computed(() => {
  const lo = currentPage.value - 2
  const hi = currentPage.value + 2
  const pages: number[] = []
  for (let p = Math.max(1, lo); p <= Math.min(totalPages.value, hi); p++) {
    pages.push(p)
  }
  return pages
})

// Table classes
const tableClass = computed(() => {
  const classes = ['table']
  if (props.striped) classes.push('table-striped')
  if (props.bordered) classes.push('table-bordered')
  if (props.borderless) classes.push('table-borderless')
  if (props.hover) classes.push('table-hover')
  if (props.small) classes.push('table-sm')
  if (props.stack) classes.push('vibe-table-stack')
  if (resolvedVariant.value) classes.push(`table-${resolvedVariant.value}`)
  return classes.join(' ')
})

// Methods
const handleSort = (column: DataTableColumn<T>, event?: MouseEvent) => {
  if (!props.sortable || column.sortable === false) return
  const key = column.key
  const additive = props.multiSort && !!event?.shiftKey
  const current = [...sort.value]
  const idx = current.findIndex((s) => s.id === key)

  if (additive) {
    // Shift-click cycles the column: absent -> asc -> desc -> removed.
    if (idx === -1) current.push({ id: key, desc: false })
    else if (!current[idx].desc) current[idx] = { id: key, desc: true }
    else current.splice(idx, 1)
    sort.value = current
  } else if (current.length === 1 && current[0].id === key) {
    // Sole sort on this column: toggle direction (unchanged single behavior).
    sort.value = [{ id: key, desc: !current[0].desc }]
  } else {
    // New or collapsing click: single ascending sort on this column.
    sort.value = [{ id: key, desc: false }]
  }

  // sortBy/sortDesc track the primary sort for back-compat consumers.
  const primary = sort.value[0]
  sortBy.value = primary ? primary.id : undefined
  sortDesc.value = primary ? primary.desc : false
}

// Effective sort list drives the header icons/aria: the multi-sort array when
// enabled, otherwise the single sortBy/sortDesc pair (identical to before).
const effectiveSort = computed<{ id: string; desc: boolean }[]>(() => {
  if (!props.sortable) return []
  if (props.multiSort) return sort.value
  return sortBy.value ? [{ id: sortBy.value, desc: sortDesc.value }] : []
})
const sortByKey = computed(() => {
  const m = new Map<string, boolean>()
  for (const s of effectiveSort.value) m.set(s.id, s.desc)
  return m
})

watch(totalPages, (newTotal) => {
  if (newTotal > 0 && currentPage.value > newTotal) {
    currentPage.value = newTotal
  }
})

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const handlePerPageChange = () => {
  currentPage.value = 1
}

const handleRowClick = (item: T, index: number) => {
  emit('row-clicked', item, (startRow.value - 1) + index)
}

// Hoisted: a fresh object literal in :style defeats Vue's reference-based
// style patch check on every render (same as VibeListGroup CLICKABLE_STYLE).
const CLICKABLE_ROW_STYLE = { cursor: 'pointer' }

// Row keys computed once per page/sort/filter change instead of re-running
// the key resolution per row on every render. Keyed by row object so an
// identity change invalidates only its own entry.
const rowKeyMap = computed(() => {
  const map = new Map<T, string | number>()
  const page = paginatedItems.value
  for (let index = 0; index < page.length; index++) {
    map.set(page[index], getRowKey(page[index], index))
  }
  return map
})

// Precompute sort icons once per sort-state/columns change instead of calling a function
// per header cell on every render. Keyed by column (consistent with the style maps).
const sortIconMap = computed(() => {
  const m = new Map<DataTableColumn<T>, string>()
  for (const column of props.columns) {
    if (!props.sortable || column.sortable === false) {
      m.set(column, '')
    } else if (!sortByKey.value.has(column.key)) {
      m.set(column, 'sort-none')
    } else {
      m.set(column, sortByKey.value.get(column.key) ? 'sort-desc' : 'sort-asc')
    }
  }
  return m
})

const ariaSortMap = computed(() => {
  // Literal union (not plain string) so the value is assignable to the native
  // aria-sort attribute type without a cast.
  const m = new Map<DataTableColumn<T>, 'none' | 'ascending' | 'descending' | undefined>()
  for (const column of props.columns) {
    if (!props.sortable || column.sortable === false) {
      m.set(column, undefined)
    } else if (!sortByKey.value.has(column.key)) {
      m.set(column, 'none')
    } else {
      m.set(column, sortByKey.value.get(column.key) ? 'descending' : 'ascending')
    }
  }
  return m
})

// Precompute sanitized per-column styles once per columns/sortable change. Returning a
// stable object reference per column lets Vue's :style (compared by reference) skip DOM
// patching when nothing changed, instead of allocating a fresh object every render/cell.
// safeCssObject also filters consumer-supplied styles to an allowlist (CSS-injection defense).
const thStyleMap = computed(() => {
  const m = new Map<DataTableColumn<T>, Record<string, string>>()
  for (const column of props.columns) {
    const style = safeCssObject(column.thStyle)
    if (props.sortable && column.sortable !== false) style.cursor = 'pointer'
    m.set(column, style)
  }
  return m
})

const tdStyleMap = computed(() => {
  const m = new Map<DataTableColumn<T>, Record<string, string>>()
  for (const column of props.columns) m.set(column, safeCssObject(column.tdStyle))
  return m
})

// Cell display values, computed once per data/columns change. Previously
// getCellValue() ran (and invoked the consumer formatter) on every render for
// every visible cell. Keyed by column then row so a row identity change
// invalidates only its own entry.
const cellValueMap = computed(() => {
  const byColumn = new Map<DataTableColumn<T>, Map<T, unknown>>()
  for (const column of props.columns) {
    const byRow = new Map<T, unknown>()
    for (const item of paginatedItems.value) {
      const value = item[column.key]
      byRow.set(item, column.formatter ? column.formatter(value, item) : value)
    }
    byColumn.set(column, byRow)
  }
  return byColumn
})
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
            <th v-if="selectEnabled" class="vibe-select-cell" scope="col">
              <input
                v-if="selectMultiple"
                type="checkbox"
                class="form-check-input"
                aria-label="Select all rows"
                :checked="selectAllChecked"
                :indeterminate.prop="selectAllIndeterminate"
                @click="selection.toggleAll($event)"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="column.headerClass"
              :style="thStyleMap.get(column)"
              :aria-sort="ariaSortMap.get(column)"
              @click="handleSort(column, $event)"
            >
              {{ column.label }}
              <span
                v-if="sortable && column.sortable !== false"
                :class="['ms-1', 'vibe-sort-icon', sortIconMap.get(column)]"
                aria-hidden="true"
              ></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="rowKeyMap.get(item)"
            :style="clickable ? CLICKABLE_ROW_STYLE : undefined"
            @click="handleRowClick(item, index)"
          >
            <td v-if="selectEnabled" class="vibe-select-cell">
              <input
                type="checkbox"
                class="form-check-input"
                aria-label="Select row"
                :checked="isRowSelected(item)"
                @click.stop="onToggleRow($event, item)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.class"
              :style="tdStyleMap.get(column)"
              :data-label="column.label"
            >
              <slot :name="`cell(${column.key})`" :item="item" :value="item[column.key]" :index="index">
                {{ cellValueMap.get(column)?.get(item) }}
              </slot>
            </td>
          </tr>
          <tr v-if="props.loading">
            <td :colspan="colspanCount" class="text-center text-body-secondary">
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Loading...
            </td>
          </tr>
          <tr v-else-if="paginatedItems.length === 0 && showEmpty">
            <td :colspan="colspanCount" class="text-center">
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
              <button type="button" class="page-link" @click="handlePageChange(currentPage - 1)">
                Previous
              </button>
            </li>

            <!-- First page -->
            <li v-if="currentPage > 3" class="page-item">
              <button type="button" class="page-link" @click="handlePageChange(1)">1</button>
            </li>
            <li v-if="currentPage > 4" class="page-item disabled">
              <span class="page-link">...</span>
            </li>

            <!-- Page numbers around current page -->
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button type="button" class="page-link" @click="handlePageChange(page)">
                {{ page }}
              </button>
            </li>

            <!-- Last page -->
            <li v-if="currentPage < totalPages - 3" class="page-item disabled">
              <span class="page-link">...</span>
            </li>
            <li v-if="currentPage < totalPages - 2" class="page-item">
              <button type="button" class="page-link" @click="handlePageChange(totalPages)">
                {{ totalPages }}
              </button>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button type="button" class="page-link" @click="handlePageChange(currentPage + 1)">
                Next
              </button>
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

/* Sort icon — CSS border triangles avoid font/emoji rendering issues with Unicode arrows */
.vibe-sort-icon {
  display: inline-block;
  width: 0.75em;
  position: relative;
  opacity: 0.4;
}
.vibe-sort-icon::before {
  content: '↕';
}
.vibe-sort-icon.sort-asc::before {
  content: '↑';
  opacity: 1;
}
.vibe-sort-icon.sort-desc::before {
  content: '↓';
  opacity: 1;
}

.datatable-info {
  padding: 0.5rem 0;
  color: var(--bs-secondary-color);
}

/* Stack mode for mobile */
@media (max-width: 767.98px) {
  .vibe-table-stack,
  .vibe-table-stack tbody,
  .vibe-table-stack tr,
  .vibe-table-stack td {
    display: block;
    width: 100%;
  }

  .vibe-table-stack thead {
    display: none;
  }

  .vibe-table-stack tr {
    margin-bottom: 1rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    background-color: var(--bs-body-bg);
  }

  .vibe-table-stack td {
    text-align: right;
    padding: 0.5rem 1rem;
    position: relative;
    padding-left: 50%;
    border-top: none;
    border-bottom: 1px solid var(--bs-border-color);
  }

  .vibe-table-stack td:last-child {
    border-bottom: none;
  }

  .vibe-table-stack td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    width: 45%;
    text-align: left;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
