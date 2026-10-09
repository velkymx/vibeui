import { computed, type ComputedRef, type Ref } from 'vue'
import {
  useTable,
  tableFeatures,
  createCoreRowModel,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  columnFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  type ColumnDef,
  type Row,
  type SortFn
} from '@tanstack/vue-table'
import type { DataTableColumn } from '../types'

// #283 Phase 0: translate the VibeUI DataTable surface (props + models) into a
// TanStack Table v9 instance. The component keeps its own markup and v-models;
// this layer only owns the row-model math (filter/sort/paginate), replacing the
// hand-rolled pipeline. Semantics are preserved exactly so the existing suite is
// the characterization gate (see the sort/filter notes below).

// `object` rows are read by a runtime string key (rowKey, column.key); `object`
// is not indexable, so those reads go through this cast.
const readField = <T extends object>(row: T, key: string): unknown =>
  (row as Record<string, unknown>)[key]

// Sort normalization: compareValues pushed null AND undefined to the end in BOTH
// directions. v9's `sortUndefined: 'last'` does that for undefined only and is
// direction-independent, so mapping null -> undefined in the accessor reproduces
// the original null-last-both-directions behavior exactly.
const normalizeForSort = (value: unknown): unknown => (value == null ? undefined : value)

// Numeric column width in px for the engine size model (drives pin offsets
// and resize state). Numbers pass through; px strings parse; anything else
// falls back to the engine default.
const numericWidth = (width: string | number | undefined): number | undefined => {
  if (typeof width === 'number') return width
  if (typeof width === 'string') {
    const match = /^(-?\d+(?:\.\d+)?)px$/.exec(width.trim())
    if (match) return Number(match[1])
  }
  return undefined
}

// Ascending comparator for defined values only (undefined is handled by
// sortUndefined). Table reverses this for descending, so return ascending order
// exactly as the old compareValues did for its non-null branches; non-comparable
// or mixed types compare equal.
const ascendingCompare = (a: unknown, b: unknown): number => {
  if (typeof a === 'string' && typeof b === 'string') {
    const al = a.toLowerCase()
    const bl = b.toLowerCase()
    return al < bl ? -1 : al > bl ? 1 : 0
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a < b ? -1 : a > b ? 1 : 0
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }
  return 0
}

// Static feature set: filtering (global reuses the column-filter pipeline),
// sorting, pagination, plus their row models. Stable module-level reference so
// the table is not reconstructed per render.
const features = tableFeatures({
  columnFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  coreRowModel: createCoreRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  // Faceting feeds the select filter's option list (unique values per column).
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues()
})

export interface UseVibeTableParams<T extends object> {
  items: () => T[]
  columns: () => DataTableColumn<T>[]
  rowKey: () => string
  searchable: () => boolean
  sortable: () => boolean
  paginated: () => boolean
  serverMode: () => boolean
  totalRows: () => number | undefined
  search: Ref<string>
  currentPage: Ref<number>
  perPage: Ref<number>
  sortBy: Ref<string | undefined>
  sortDesc: Ref<boolean>
  // #283 Phase 2a: when multiSort is on, `sort` (ordered ColumnSort[]) is the
  // sort source; otherwise the single sortBy/sortDesc pair is (unchanged).
  multiSort: () => boolean
  sort: Ref<{ id: string; desc: boolean }[]>
  // #283 Phase 1: false (off), 'single', 'multiple', or true (= multiple).
  selectable: () => boolean | 'single' | 'multiple'
  selectedRows: Ref<(string | number)[]>
  // #283 Phase 2b: per-column filter state ({ id, value }); value is a string
  // (text/select) or a [min, max] tuple (range).
  columnFilters: Ref<{ id: string; value: unknown }[]>
  // #283 Phase 3a: per-column visibility ({ id: false } = hidden). Owned by the
  // engine's columnVisibility state; the component's v-model mirrors it.
  columnVisibility: Ref<Record<string, boolean>>
  // #283 Phase 3b: per-column sizes in px ({ id: px }). Owned by the engine's
  // columnSizing state; the component's v-model mirrors it.
  columnSizing: Ref<Record<string, number>>
}

export interface VibeTableFilters {
  enabled: ComputedRef<boolean>
  get: (id: string) => unknown
  set: (id: string, value: unknown) => void
  uniqueValues: (id: string) => string[]
}

export interface VibeTableVisibility {
  isVisible: (id: string) => boolean
  set: (id: string, visible: boolean) => void
}

export interface VibeTableLayout {
  pinSide: (id: string) => 'start' | 'end' | false
  pinOffset: (id: string) => number | undefined
  size: (id: string) => number
  resizeHandler: (id: string) => ((event: unknown) => void) | undefined
}

export interface VibeTableSelection {
  enabled: ComputedRef<boolean>
  multiple: ComputedRef<boolean>
  isAllSelected: ComputedRef<boolean>
  isIndeterminate: ComputedRef<boolean>
  isSelected: (key: string | number) => boolean
  toggleRow: (event: Event, key: string | number) => void
  toggleAll: (event: Event) => void
}

export interface UseVibeTableResult<T extends object> {
  // The visible rows' original data, after filter/sort/paginate (or as-is in
  // server mode), matching the previous `paginatedItems` contract.
  paginatedItems: ComputedRef<T[]>
  // Count the pagination reflects locally: the filtered row count (client) so
  // the info line and "filtered from N" check behave identically.
  filteredCount: ComputedRef<number>
  // Row selection surface (engine-owned), consumed by the checkbox column.
  selection: VibeTableSelection
  // Per-column filter surface, consumed by the filter row.
  filters: VibeTableFilters
  // Column visibility surface (engine-owned), consumed by the chooser.
  visibility: VibeTableVisibility
  // Pin/size/resize surface (engine-owned), consumed by header and cells.
  layout: VibeTableLayout
}

export function useVibeTable<T extends object>(
  params: UseVibeTableParams<T>
): UseVibeTableResult<T> {
  // Per-column id -> VibeUI column, for the global filter's displayed-text rule.
  const columnsById = computed(() => {
    const map = new Map<string, DataTableColumn<T>>()
    for (const column of params.columns()) map.set(column.key, column)
    return map
  })

  // Displayed value for a column (searchValue hook, then formatter, then raw),
  // shared by global search and the per-column text filter.
  const displayedText = (column: DataTableColumn<T>, item: T): unknown =>
    column.searchValue
      ? column.searchValue(item)
      : column.formatter
        ? column.formatter(item[column.key], item)
        : item[column.key]

  const columnDefs = computed<ColumnDef<typeof features, T>[]>(() =>
    params.columns().map((column) => {
      const sortFn: SortFn<typeof features, T> = (rowA: Row<typeof features, T>, rowB: Row<typeof features, T>, columnId: string) =>
        ascendingCompare(rowA.getValue(columnId), rowB.getValue(columnId))
      const def: ColumnDef<typeof features, T> = {
        id: column.key,
        accessorFn: (row: T) => normalizeForSort(readField(row, column.key)),
        sortUndefined: 'last',
        sortFn,
        enableColumnFilter: !!column.filter,
        // #283 Phase 3b: numeric widths seed the engine size (drives pin
        // offsets); resizing is opt-in per column.
        size: numericWidth(column.width),
        enableResizing: column.resizable === true
      }
      // Per-column filter functions (#283 Phase 2b).
      if (column.filter === 'text') {
        def.filterFn = (row, _columnId, value) => {
          const query = String(value ?? '').toLowerCase()
          if (!query) return true
          const text = displayedText(column, row.original)
          return text != null && String(text).toLowerCase().includes(query)
        }
      } else if (column.filter === 'select') {
        def.filterFn = (row, columnId, value) => {
          if (value === '' || value == null) return true
          return String(row.getValue(columnId) ?? '') === String(value)
        }
      } else if (column.filter === 'range') {
        def.filterFn = (row, columnId, value) => {
          const [rawMin, rawMax] = Array.isArray(value) ? value : []
          const hasMin = rawMin !== '' && rawMin != null
          const hasMax = rawMax !== '' && rawMax != null
          if (!hasMin && !hasMax) return true
          const v = row.getValue(columnId)
          if (typeof v !== 'number') return false
          const lo = hasMin ? Number(rawMin) : -Infinity
          const hi = hasMax ? Number(rawMax) : Infinity
          return v >= lo && v <= hi
        }
      }
      return def
    })
  )

  // Displayed-text global filter: searchValue hook wins, then formatter output,
  // then the raw value (#70). A row matches if ANY eligible column matches.
  const globalFilterFn = (row: Row<typeof features, T>, columnId: string, filterValue: unknown): boolean => {
    const query = String(filterValue ?? '').toLowerCase()
    if (!query) return true
    const column = columnsById.value.get(columnId)
    if (!column) return false
    const value = displayedText(column, row.original)
    if (value == null) return false
    return String(value).toLowerCase().includes(query)
  }

  const data = computed(() => params.items() || [])

  // Controlled state mirrors the component's v-models. Search and sort are gated
  // by the feature flags so toggling them off restores the unfiltered/unsorted
  // order exactly as the old computeds did.
  const state = computed(() => ({
    pagination: {
      pageIndex: Math.max(0, params.currentPage.value - 1),
      pageSize: Math.max(1, params.perPage.value)
    },
    sorting: !params.sortable()
      ? []
      : params.multiSort()
        ? params.sort.value
        : params.sortBy.value
          ? [{ id: params.sortBy.value, desc: params.sortDesc.value }]
          : [],
    globalFilter: params.searchable() ? params.search.value : '',
    // Selection is id-keyed; mirror the selectedRows model (ids are stringified
    // by getRowId, so normalize here too).
    rowSelection: params.selectedRows.value.reduce<Record<string, true>>((acc, key) => {
      acc[String(key)] = true
      return acc
    }, {}),
    columnFilters: params.columnFilters.value,
    columnVisibility: params.columnVisibility.value,
    // #283 Phase 3b: pinning is config-driven (columns' pinned fields); no
    // v-model, so no change handler needed.
    columnPinning: {
      start: params.columns().filter((c) => c.pinned === 'start').map((c) => c.key),
      end: params.columns().filter((c) => c.pinned === 'end').map((c) => c.key)
    },
    columnSizing: params.columnSizing.value
  }))

  const selectionEnabled = computed(() => params.selectable() !== false)
  const selectionMultiple = computed(
    () => params.selectable() === true || params.selectable() === 'multiple'
  )

  const table = useTable({
    features,
    data,
    columns: columnDefs,
    state,
    // Component owns page reset (search watch + totalPages clamp); do not let the
    // table also reset the index.
    autoResetPageIndex: false,
    globalFilterFn,
    getColumnCanGlobalFilter: (column) => columnsById.value.get(column.id)?.searchable !== false,
    getRowId: (row: T, index: number) => {
      const key = readField(row, params.rowKey())
      return key != null ? String(key) : String(index)
    },
    // #124 server mode: the backend already filtered/sorted/paged; trust `items`
    // as the current page and drive the count from totalRows.
    manualFiltering: params.serverMode(),
    manualSorting: params.serverMode(),
    manualPagination: params.serverMode(),
    rowCount: params.serverMode() ? params.totalRows() : undefined,
    enableMultiSort: computed(() => params.multiSort()),
    enableRowSelection: selectionEnabled,
    enableMultiRowSelection: selectionMultiple,
    onRowSelectionChange: (updater) => {
      const prev = state.value.rowSelection
      const next = typeof updater === 'function' ? updater(prev) : updater
      params.selectedRows.value = Object.keys(next).filter((key) => next[key])
    },
    // Callbacks accept a value or an updater of the previous value. State is
    // owned by the v-models; these keep the table in sync if it ever sets state.
    onPaginationChange: (updater) => {
      const prev = state.value.pagination
      const next = typeof updater === 'function' ? updater(prev) : updater
      params.currentPage.value = next.pageIndex + 1
      params.perPage.value = next.pageSize
    },
    onSortingChange: (updater) => {
      const prev = state.value.sorting
      const next = typeof updater === 'function' ? updater(prev) : updater
      params.sort.value = next
      const first = next[0]
      params.sortBy.value = first ? first.id : undefined
      params.sortDesc.value = first ? first.desc : false
    },
    onColumnFiltersChange: (updater) => {
      const prev = state.value.columnFilters
      const next = typeof updater === 'function' ? updater(prev) : updater
      params.columnFilters.value = next
    },
    onColumnVisibilityChange: (updater) => {
      const prev = state.value.columnVisibility
      const next = typeof updater === 'function' ? updater(prev) : updater
      params.columnVisibility.value = next
    },
    onColumnSizingChange: (updater) => {
      const prev = state.value.columnSizing
      const next = typeof updater === 'function' ? updater(prev) : updater
      params.columnSizing.value = next
    }
  })

  const paginatedItems = computed<T[]>(() => {
    // Server mode: manual flags make getRowModel return `items` unmodified.
    if (params.serverMode()) return table.getRowModel().rows.map((r) => r.original)
    // Pagination off: render every filtered/sorted row (pre-slice).
    if (!params.paginated()) return table.getSortedRowModel().rows.map((r) => r.original)
    return table.getRowModel().rows.map((r) => r.original)
  })

  const filteredCount = computed(() => table.getFilteredRowModel().rows.length)

  const selection: VibeTableSelection = {
    enabled: selectionEnabled,
    multiple: selectionMultiple,
    isAllSelected: computed(() => table.getIsAllRowsSelected()),
    isIndeterminate: computed(() => table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()),
    isSelected: (key) => params.selectedRows.value.map(String).includes(String(key)),
    toggleRow: (event, key) => {
      const row = table.getRowModel().rowsById[String(key)] ?? table.getCoreRowModel().rowsById[String(key)]
      row?.getToggleSelectedHandler()(event)
    },
    toggleAll: (event) => table.getToggleAllRowsSelectedHandler()(event)
  }

  const filters: VibeTableFilters = {
    enabled: computed(() => params.columns().some((column) => !!column.filter)),
    get: (id) => params.columnFilters.value.find((filter) => filter.id === id)?.value,
    set: (id, value) => {
      const others = params.columnFilters.value.filter((filter) => filter.id !== id)
      const empty =
        value === '' ||
        value == null ||
        (Array.isArray(value) && value.every((v) => v === '' || v == null))
      params.columnFilters.value = empty ? others : [...others, { id, value }]
    },
    uniqueValues: (id) => {
      const map = table.getColumn(id)?.getFacetedUniqueValues()
      if (!map) return []
      return Array.from(map.keys())
        .filter((value) => value != null && value !== '')
        .map((value) => String(value))
        .sort()
    }
  }

  const visibility: VibeTableVisibility = {
    isVisible: (id) => table.getColumn(id)?.getIsVisible() ?? true,
    set: (id, visible) => {
      table.getColumn(id)?.toggleVisibility(visible)
    }
  }

  const layout: VibeTableLayout = {
    pinSide: (id) => table.getColumn(id)?.getIsPinned() ?? false,
    pinOffset: (id) => {
      const column = table.getColumn(id)
      const side = column?.getIsPinned()
      if (!column || !side) return undefined
      return column.getStart(side)
    },
    size: (id) => table.getColumn(id)?.getSize() ?? 0,
    resizeHandler: (id) =>
      table.getLeafHeaders().find((header) => header.column.id === id)?.getResizeHandler()
  }

  return { paginatedItems, filteredCount, selection, filters, visibility, layout }
}
