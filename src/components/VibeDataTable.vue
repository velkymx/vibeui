<script setup lang="ts" generic="T extends object">
import { ref, computed, watch, useSlots, type PropType } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { DataTableColumn, ComponentError, Variant } from '../types'
import { safeCssObject, safeLength } from '../utils/safeCss'
import { useDebouncedRef } from '../composables/useDebouncedRef'
import { useVibeTable, type VibeTableRow } from '../composables/useVibeTable'
import { useVirtualizer, observeElementRect, type Virtualizer, type Rect } from '@tanstack/vue-virtual'

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
  // #283 Phase 3a: render a column-visibility chooser (dropdown of checkboxes).
  showColumnToggle: { type: Boolean, default: false },
  // #283 Phase 4a: row expansion master switch, per-row predicate (default:
  // every row), and the item field holding child rows.
  expandable: { type: Boolean, default: false },
  expandableRow: { type: Function as PropType<(item: T) => boolean>, default: undefined },
  subRowsKey: { type: String, default: 'children' },
  // #283 Phase 4b: group rows by these column keys (engine grouping state).
  groupBy: { type: [String, Array] as PropType<string | string[]>, default: () => [] },
  // #283 Phase 5: windowed rendering for large datasets. Bypasses pagination
  // (one windowing source, not two); rows render from estimates until measured.
  virtualized: { type: Boolean, default: false },
  virtualEstimateSize: { type: Number, default: 48 },
  virtualOverscan: { type: Number, default: 3 },
  virtualHeight: { type: [String, Number] as PropType<string | number>, default: 400 },

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
// #283 Phase 2b: per-column filter state ({ id, value }).
const columnFilters = defineModel<{ id: string; value: unknown }[]>('columnFilters', { default: () => [] })
// #283 Phase 3a: per-column visibility (false = hidden). Two-way for the chooser.
const columnVisibility = defineModel<Record<string, boolean>>('columnVisibility', { default: () => ({}) })
// #283 Phase 3b: per-column sizes in px. Two-way so consumers can read and
// drive resize state.
const columnSizing = defineModel<Record<string, number>>('columnSizing', { default: () => ({}) })
// #283 Phase 4a: expanded row keys (engine row ids). Two-way.
const expandedRows = defineModel<(string | number)[]>('expandedRows', { default: () => [] })

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
  // #147: per-column cell slots plus #283 Phase 4b per-column footer slots.
  // One mapped member covers both families (two `as` remaps in one literal
  // break the SFC parser); props are the union of both shapes.
  [K in keyof T & string as `cell(${K})` | `footer(${K})`]?: (
    props:
      | { item: T; value: T[K]; index: number }
      | { column: DataTableColumn<T> }
  ) => unknown
} & {
  // #283 Phase 4a: expanded-row detail content for an expanded row.
  expanded?: (props: { item: T; index: number }) => unknown
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
const { paginatedItems, filteredCount, selection, filters, visibility, layout, expansion, displayedRows } = useVibeTable<T>({
  items: () => props.items,
  columns: () => props.columns,
  rowKey: () => props.rowKey,
  searchable: () => props.searchable,
  sortable: () => props.sortable,
  // #283 Phase 5: virtualization replaces pagination (bypassed while on).
  paginated: () => props.paginated && !props.virtualized,
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
  selectedRows,
  columnFilters,
  columnVisibility,
  columnSizing,
  expandedRows,
  expandable: () => props.expandable,
  expandableRow: (item: T) => props.expandableRow?.(item) ?? true,
  subRowsKey: () => props.subRowsKey,
  groupBy: () => (Array.isArray(props.groupBy) ? props.groupBy : props.groupBy ? [props.groupBy] : [])
})

// #283 Phase 5: row virtualizer over the displayed rows. Always constructed
// (composables cannot be conditional); inert unless virtualized is on.
const scrollEl = ref<HTMLElement | null>(null)
// Virtual height in px for the scroll container style and the virtualizer's
// initial rect (happy-dom and SSR never report layout, so without a seed the
// first window would be empty; the observer corrects it once measured).
const virtualHeightPx = computed(() => {
  if (typeof props.virtualHeight === 'number') return props.virtualHeight
  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(props.virtualHeight.trim())
  return match ? Number(match[1]) : 400
})
const virtualCount = computed(() => displayedRows.value.length)
const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: virtualCount.value,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => props.virtualEstimateSize,
    overscan: props.virtualOverscan,
    initialRect: { width: 800, height: virtualHeightPx.value },
    // Layout-less harnesses (happy-dom, SSR) report zero rects, which would
    // collapse the seeded window. Ignore zero-height reports; real containers
    // always measure non-zero once laid out.
    observeElementRect: (instance: Virtualizer<HTMLElement, Element>, onRect: (rect: Rect) => void) => {
      observeElementRect(instance, (measured) => {
        if (measured.height > 0) onRect(measured)
      })
    }
  }))
)
// Absolute displayed-row indices in the current window (or all rows when off).
const windowedIndices = computed<number[] | null>(() => {
  if (!props.virtualized) return null
  return rowVirtualizer.value.getVirtualItems().map((item) => item.index)
})
const virtualPadding = computed(() => {
  if (!props.virtualized) return { top: 0, bottom: 0 }
  const virtualizer = rowVirtualizer.value
  const items = virtualizer.getVirtualItems()
  const total = virtualizer.getTotalSize()
  const top = items.length > 0 ? items[0].start : 0
  const bottom = items.length > 0 ? total - items[items.length - 1].end : total
  return { top, bottom }
})
const scrollStyle = computed(() =>
  props.virtualized
    ? {
        maxHeight: typeof props.virtualHeight === 'number' ? `${props.virtualHeight}px` : props.virtualHeight,
        overflowY: 'auto' as const
      }
    : {}
)
// Rows actually rendered: the virtual window (absolute indices preserved for
// slots and emits) or everything when virtualization is off.
const renderEntries = computed(() => {
  const indices = windowedIndices.value
  if (indices === null) {
    return displayedRows.value.map((row, index) => ({ row, index }))
  }
  const entries: { row: VibeTableRow<T>; index: number }[] = []
  for (const index of indices) {
    const row = displayedRows.value[index]
    if (row !== undefined) entries.push({ row, index })
  }
  return entries
})

// #283 Phase 2b: filter row helpers (unwrapped for the template).
const filtersEnabled = computed(() => filters.enabled.value)
const filterText = (column: DataTableColumn<T>): string => String(filters.get(column.key) ?? '')
const filterOptions = (column: DataTableColumn<T>): string[] => filters.uniqueValues(column.key)
const setFilter = (column: DataTableColumn<T>, value: unknown) => filters.set(column.key, value)
// Range tuple read/write: [min, max] as strings for the number inputs.
const filterRange = (column: DataTableColumn<T>): [string, string] => {
  const value = filters.get(column.key)
  return Array.isArray(value) ? [String(value[0] ?? ''), String(value[1] ?? '')] : ['', '']
}
const setFilterRange = (column: DataTableColumn<T>, index: 0 | 1, value: string) => {
  const next = filterRange(column)
  next[index] = value
  filters.set(column.key, next)
}

// #283 Phase 3a: column visibility is engine-owned (core columnVisibility
// state); the component reads it for rendering and the chooser writes it.
const isColumnVisible = (column: DataTableColumn<T>): boolean =>
  visibility.isVisible(column.key)
const visibleColumns = computed(() => props.columns.filter(isColumnVisible))
const setColumnVisible = (column: DataTableColumn<T>, visible: boolean) => {
  visibility.set(column.key, visible)
}
const chooserOpen = ref(false)

// align -> Bootstrap text utility; width -> validated CSS length (number = px).
const alignClass = (column: DataTableColumn<T>): string =>
  column.align ? `text-${column.align}` : ''
const columnWidth = (column: DataTableColumn<T>): string | undefined => {
  if (column.width === undefined) return undefined
  return typeof column.width === 'number'
    ? `${column.width}px`
    : safeLength(String(column.width))
}
// #283 Phase 3b: resizable columns render at the engine size so drags and
// keyboard steps show immediately; other columns keep the explicit width.
const renderWidth = (column: DataTableColumn<T>): string | undefined =>
  column.resizable === true ? `${layout.size(column.key)}px` : columnWidth(column)
// Sticky class plus the engine offset for pinned columns.
const pinClass = (column: DataTableColumn<T>): string => {
  const side = layout.pinSide(column.key)
  return side === false ? '' : `vibe-pinned-${side}`
}
const pinOffset = (column: DataTableColumn<T>): Record<string, string> => {
  const side = layout.pinSide(column.key)
  if (side === false) return {}
  const offset = layout.pinOffset(column.key) ?? 0
  return side === 'start' ? { left: `${offset}px` } : { right: `${offset}px` }
}
// Keyboard resize: arrows step 10px (shift = 50px). Pointer drags go straight
// to the engine handler; both write the columnSizing model.
const stepSize = (column: DataTableColumn<T>, delta: number) => {
  columnSizing.value = { ...columnSizing.value, [column.key]: layout.size(column.key) + delta }
}
const onResizeKey = (column: DataTableColumn<T>, event: KeyboardEvent) => {
  const step = event.shiftKey ? 50 : 10
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    stepSize(column, -step)
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    stepSize(column, step)
  }
}

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
// Colspan for the loading/empty rows, including the select/expand columns.
const colspanCount = computed(
  () =>
    (visibleColumns.value.length || 1) +
    (selectEnabled.value ? 1 : 0) +
    (props.expandable || grouped.value ? 1 : 0)
)
// The expanded-row detail slot, when provided.
const slots = useSlots()
const hasExpandedSlot = computed(() => slots.expanded !== undefined)
// #283 Phase 4b: group header cell text. The grouping column shows the value
// plus leaf count; aggregated columns show the engine aggregation; the rest
// stay blank so the group label reads cleanly.
const groupCellText = (row: Extract<VibeTableRow<T>, { group: object }>, column: DataTableColumn<T>): string => {
  if (!row.group) return ''
  if (column.key === row.group.columnId) {
    return `${String(row.group.value)} (${row.group.leafCount})`
  }
  if (column.aggregate !== undefined) {
    const value = row.group.values[column.key]
    return value === undefined || value === null ? '' : String(value)
  }
  return ''
}
// #283 Phase 4b: grouping active when groupBy names at least one column.
const grouped = computed(() => (Array.isArray(props.groupBy) ? props.groupBy.length > 0 : !!props.groupBy))
// Footer renders when any column carries footer text or a footer slot.
const footEnabled = computed(
  () =>
    props.columns.some((column) => column.footer !== undefined) ||
    Object.keys(slots).some((name) => name.startsWith('footer('))
)

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
  // Virtualized tables window instead of paging: report the row count.
  if (props.virtualized) return `Showing ${totalFilteredRows.value} rows`
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
    const width = renderWidth(column)
    if (width) style.width = width
    Object.assign(style, pinOffset(column))
    m.set(column, style)
  }
  return m
})

const tdStyleMap = computed(() => {
  const m = new Map<DataTableColumn<T>, Record<string, string>>()
  for (const column of props.columns) {
    m.set(column, { ...safeCssObject(column.tdStyle), ...pinOffset(column) })
  }
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
    // Displayed rows (not just the page slice) so expanded sub-rows resolve.
    // Group header rows carry no item and are skipped here; their cells render
    // from the engine aggregated values instead.
    for (const { item } of displayedRows.value) {
      if (item === null) continue
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

    <!-- #283 Phase 3a: column visibility chooser -->
    <div v-if="showColumnToggle" class="dropdown mb-2 vibe-column-toggle">
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm dropdown-toggle"
        :aria-expanded="chooserOpen"
        @click="chooserOpen = !chooserOpen"
      >
        Columns
      </button>
      <ul class="dropdown-menu" :class="{ show: chooserOpen }">
        <li v-for="column in columns" :key="column.key">
          <label class="dropdown-item d-flex align-items-center gap-2">
            <input
              type="checkbox"
              class="form-check-input mt-0"
              :checked="isColumnVisible(column)"
              @change="setColumnVisible(column, ($event.target as HTMLInputElement).checked)"
            />
            {{ column.label }}
          </label>
        </li>
      </ul>
    </div>

    <!-- Table -->
    <div ref="scrollEl" :class="{ 'table-responsive': responsive }" :style="scrollStyle">
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
            <th v-if="expandable || grouped" class="vibe-expand-cell" scope="col">
              <span class="visually-hidden">Expand rows</span>
            </th>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[column.headerClass, alignClass(column), pinClass(column), column.resizable === true ? 'position-relative' : '']"
              :style="thStyleMap.get(column)"
              :aria-sort="ariaSortMap.get(column)"
              @click="handleSort(column, $event)"
            >
              <!-- #283 Phase 0 a11y baseline: the sort control is a real
              button (keyboard-operable); the th click stays so pointer and
              existing behavior are unchanged. -->
              <button
                v-if="sortable && column.sortable !== false"
                type="button"
                class="vibe-sort-button"
                :aria-label="`Sort by ${column.label}`"
                @click.stop="handleSort(column, $event)"
              >{{ column.label }}</button>
              <template v-else>{{ column.label }}</template>
              <span
                v-if="sortable && column.sortable !== false"
                :class="['ms-1', 'vibe-sort-icon', sortIconMap.get(column)]"
                aria-hidden="true"
              ></span>
              <button
                v-if="column.resizable === true"
                type="button"
                class="vibe-resize-handle"
                :aria-label="`Resize ${column.label} column`"
                @mousedown="layout.resizeHandler(column.key)?.($event)"
                @touchstart="layout.resizeHandler(column.key)?.($event)"
                @keydown="onResizeKey(column, $event)"
                @click.stop
              ></button>
            </th>
          </tr>
          <tr v-if="filtersEnabled" class="vibe-filter-row">
            <th v-if="selectEnabled" class="vibe-select-cell"></th>
            <th v-if="expandable || grouped" class="vibe-expand-cell"></th>
            <th v-for="column in visibleColumns" :key="column.key" :class="column.headerClass">
              <input
                v-if="column.filter === 'text'"
                type="search"
                class="form-control form-control-sm vibe-filter-text"
                :aria-label="`Filter ${column.label}`"
                :value="filterText(column)"
                @input="setFilter(column, ($event.target as HTMLInputElement).value)"
              />
              <select
                v-else-if="column.filter === 'select'"
                class="form-select form-select-sm vibe-filter-select"
                :aria-label="`Filter ${column.label}`"
                :value="filterText(column)"
                @change="setFilter(column, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">All</option>
                <option v-for="opt in filterOptions(column)" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <div v-else-if="column.filter === 'range'" class="d-flex gap-1">
                <input
                  type="number"
                  class="form-control form-control-sm vibe-filter-range"
                  :aria-label="`Filter ${column.label} minimum`"
                  :value="filterRange(column)[0]"
                  @input="setFilterRange(column, 0, ($event.target as HTMLInputElement).value)"
                />
                <input
                  type="number"
                  class="form-control form-control-sm vibe-filter-range"
                  :aria-label="`Filter ${column.label} maximum`"
                  :value="filterRange(column)[1]"
                  @input="setFilterRange(column, 1, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="virtualized">
            <tr class="vibe-virtual-spacer" aria-hidden="true">
              <td :colspan="colspanCount" :style="{ height: `${virtualPadding.top}px`, padding: '0', border: '0' }"></td>
            </tr>
          </template>
          <template v-for="entry in renderEntries" :key="entry.row.key">
            <!-- #283 Phase 4b: group header row (toggle plus aggregate cells). -->
            <tr v-if="entry.row.group" class="vibe-group-row">
              <td v-if="selectEnabled" class="vibe-select-cell"></td>
              <td class="vibe-expand-cell">
                <button
                  v-if="expansion.canExpand(entry.row.key)"
                  type="button"
                  class="btn btn-sm btn-link vibe-expand-toggle p-0"
                  :aria-expanded="expansion.isExpanded(entry.row.key)"
                  :aria-label="expansion.isExpanded(entry.row.key) ? 'Collapse group' : 'Expand group'"
                  @click.stop="expansion.toggle(entry.row.key)"
                >
                  <span
                    class="vibe-expand-icon"
                    :class="{ 'vibe-expand-icon-open': expansion.isExpanded(entry.row.key) }"
                    aria-hidden="true"
                  >&#8250;</span>
                </button>
              </td>
              <td
                v-for="column in visibleColumns"
                :key="column.key"
                :class="[column.class, alignClass(column)]"
                :data-label="column.label"
              >
                {{ groupCellText(entry.row, column) }}
              </td>
            </tr>
            <tr
              v-else
              :class="{ 'vibe-sub-row': entry.row.depth > 0 }"
              :style="clickable ? CLICKABLE_ROW_STYLE : undefined"
              @click="handleRowClick(entry.row.item, entry.index)"
            >
              <td v-if="expandable" class="vibe-expand-cell">
                <button
                  v-if="expansion.canExpand(entry.row.key)"
                  type="button"
                  class="btn btn-sm btn-link vibe-expand-toggle p-0"
                  :aria-expanded="expansion.isExpanded(entry.row.key)"
                  :aria-label="expansion.isExpanded(entry.row.key) ? 'Collapse row' : 'Expand row'"
                  @click.stop="expansion.toggle(entry.row.key)"
                >
                  <span
                    class="vibe-expand-icon"
                    :class="{ 'vibe-expand-icon-open': expansion.isExpanded(entry.row.key) }"
                    aria-hidden="true"
                  >&#8250;</span>
                </button>
              </td>
            <td v-if="selectEnabled" class="vibe-select-cell">
              <input
                type="checkbox"
                class="form-check-input"
                aria-label="Select row"
                :checked="isRowSelected(entry.row.item)"
                @click.stop="onToggleRow($event, entry.row.item)"
              />
            </td>
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[column.class, alignClass(column), pinClass(column)]"
              :style="tdStyleMap.get(column)"
              :data-label="column.label"
            >
              <slot :name="`cell(${column.key})`" :item="entry.row.item" :value="entry.row.item[column.key]" :index="entry.index">
                {{ cellValueMap.get(column)?.get(entry.row.item) }}
              </slot>
            </td>
          </tr>
          <tr
            v-if="!entry.row.group && expandable && hasExpandedSlot && expansion.isExpanded(entry.row.key)"
            class="vibe-expanded-row"
          >
            <td :colspan="colspanCount">
              <slot name="expanded" :item="entry.row.item" :index="entry.index" />
            </td>
          </tr>
          </template>
          <template v-if="virtualized">
            <tr class="vibe-virtual-spacer" aria-hidden="true">
              <td :colspan="colspanCount" :style="{ height: `${virtualPadding.bottom}px`, padding: '0', border: '0' }"></td>
            </tr>
          </template>
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
        <!-- #283 Phase 4b: footer row from column footer text or footer slots. -->
        <tfoot v-if="footEnabled">
          <tr>
            <td v-if="selectEnabled" class="vibe-select-cell"></td>
            <td v-if="expandable || grouped" class="vibe-expand-cell"></td>
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[column.class, alignClass(column)]"
            >
              <slot :name="`footer(${column.key})`" :column="column">{{ column.footer }}</slot>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Bottom controls -->
    <div class="row">
      <div v-if="showInfo" class="col-md-6 mb-2 mb-md-0">
        <div class="datatable-info">
          {{ infoString }}
        </div>
      </div>
      <div v-if="paginated && !virtualized && totalPages > 1" class="col-md-6">
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

/* #283 Phase 3b: pinned columns stick within the scroll container. Offsets
come from the engine (inline left/right); the class only supplies position,
opaque background, and stacking. Scoped to internally generated cells. */
.vibe-datatable :deep(.vibe-pinned-start),
.vibe-datatable :deep(.vibe-pinned-end) {
  position: sticky;
  background-color: var(--bs-body-bg);
  z-index: 1;
}

/* Expand toggle icon: chevron rotates when open. */
.vibe-datatable :deep(.vibe-expand-icon) {
  display: inline-block;
  transition: transform 0.15s ease-in-out;
}
.vibe-datatable :deep(.vibe-expand-icon-open) {
  transform: rotate(90deg);
}

/* Sort button: inherit header typography; the th keeps its click target. */
.vibe-datatable :deep(.vibe-sort-button) {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
}

/* Resize handle: slim button at the header's trailing edge. */
.vibe-datatable :deep(.vibe-resize-handle) {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: col-resize;
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
