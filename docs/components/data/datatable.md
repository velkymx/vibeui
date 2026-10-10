# VibeDataTable

Powerful data table component with search, sorting, and pagination - similar to DataTables.net but built for Vue 3 and Bootstrap 5.3. The row-model math (filter, sort, paginate, and everything below) is powered by TanStack Table; VibeDataTable is its Bootstrap renderer plus a11y owner.

Two tiers, one engine. The simple props (`items`, `columns`, `searchable`, `sortable`, `paginated`, server mode) are the easy 80% and keep working exactly as documented. Every advanced feature below is opt-in and powered by the same engine. Nothing here changes default rendering.

## Features

- **Search/Filter** - Real-time search across all searchable columns
- **Column Sorting** - Click column headers to sort (asc/desc)
- **Pagination** - Built-in pagination with customizable page sizes
- **Responsive** - Mobile-friendly with responsive table wrapper
- **Bootstrap Styling** - All Bootstrap table variants (striped, bordered, hover, etc.)
- **Custom Cell Rendering** - Slots for custom cell content
- **Formatters** - Custom data formatters per column
- **TypeScript** - Fully typed with comprehensive interfaces
- **Row selection** - Single/multi checkbox column with select-all (indeterminate)
- **Multi-sort** - Shift-click appends; `sort` array model
- **Column filters** - Per-column text/select/range filter row with faceted options
- **Column presentation** - Align, width, visibility chooser, sticky pinning, resize handles
- **Expansion** - Detail rows plus sub-rows
- **Grouping** - Group headers with aggregation plus footer row
- **Virtualization** - Windowed rendering for large datasets

## Props

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | `[]` | Array of data objects to display |
| `columns` | `DataTableColumn<T>[]` | `[]` | Column definitions. Defaults to an empty array, so an unset/loading state renders an empty table rather than erroring. |
| `rowKey` | `String` | `'id'` | Property name used as the unique key for each row. **Recommended** — set it to a unique field in your data (e.g. `'id'`, `'uuid'`) so selection, expansion, and sorting track rows correctly. Falls back to the positional index when missing. |

> **Typing tip**: `DataTableColumn` is generic over your row type. For full slot-prop / formatter typing, annotate the column array:
>
> ```ts
> import type { DataTableColumn } from '@velkymx/vibeui'
> interface User { id: number; name: string; active: boolean }
> const columns: DataTableColumn<User>[] = [
>   { key: 'name', label: 'Name' },              // key narrowed to keyof User
>   { key: 'active', label: 'Active', formatter: v => v ? 'Yes' : 'No' }
> ]
> ```
>
> Any plain object type works as the row type `T` — no string index signature (`[key: string]: unknown`) and no cast are required, so your existing domain interfaces slot in directly. Without the annotation, `T` defaults to `Record<string, unknown>` and slot props arrive as `unknown`.

### Table Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `striped` | `Boolean` | `false` | Striped table rows |
| `bordered` | `Boolean` | `false` | Bordered table |
| `borderless` | `Boolean` | `false` | Remove all borders |
| `hover` | `Boolean` | `false` | Hover effect on rows |
| `small` | `Boolean` | `false` | Compact table |
| `responsive` | `Boolean` | `true` | Responsive table wrapper |
| `stack` | `Boolean` | `false` | Transforms table into cards on mobile screens |
| `variant` | `Variant` | `undefined` | Table color variant (`table-{variant}`); typed to the `Variant` union. |

### Feature Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchable` | `Boolean` | `true` | Enable search functionality |
| `sortable` | `Boolean` | `true` | Enable column sorting |
| `paginated` | `Boolean` | `true` | Enable pagination |
| `clickable` | `Boolean` | `false` | Show a pointer cursor on rows to signal they are interactive (pair with a `@row-clicked` listener) |
| `serverMode` | `Boolean` | `false` | Server-side mode: disable all local filtering, sorting, and paging. `items` is rendered as-is (the current page from your backend) |
| `totalRows` | `Number` | `undefined` | Total row count from the backend; drives pagination in `serverMode` |
| `selectable` | `Boolean \| 'single' \| 'multiple'` | `false` | Row selection. `true` equals `'multiple'`. Adds a checkbox column; selection lives in the `selectedRows` model |
| `selectedRows` | `(String \| Number)[]` | `[]` | Two-way: keys (rowKey values) of the selected rows |
| `multiSort` | `Boolean` | `false` | Multi-column sort. Shift-click appends; state lives in the `sort` model (`sortBy`/`sortDesc` mirror the first entry) |
| `sort` | `{ id, desc }[]` | `[]` | Two-way: ordered multi-sort state |
| `columnFilters` | `{ id, value }[]` | `[]` | Two-way: per-column filter state. Pairs with column `filter: 'text' \| 'select' \| 'range'` |
| `showColumnToggle` | `Boolean` | `false` | Column-visibility chooser (dropdown of checkboxes) |
| `columnVisibility` | `Record<String, Boolean>` | `{}` | Two-way: `{ key: false }` hides a column |
| `columnSizing` | `Record<String, Number>` | `{}` | Two-way: per-column width in px. Driven by `resizable` handles; read or set it programmatically |
| `columnOrder` | `String[]` | `[]` | Two-way: column id order. Unknown ids are ignored; unlisted columns keep props order. Programmatic moves via the exposed `moveColumn(key, toIndex)` template-ref method |
| `expandable` | `Boolean` | `false` | Row expansion toggle column. Per-row opt-out via `expandableRow`, children via `subRowsKey`, state in `expandedRows` |
| `expandableRow` | `(item) => Boolean` | `undefined` | Predicate; rows failing it render no toggle (default: every row) |
| `subRowsKey` | `String` | `'children'` | Item field holding child rows, rendered when the parent expands |
| `expandedRows` | `(String \| Number)[]` | `[]` | Two-way: engine row ids of expanded rows (and groups) |
| `groupBy` | `String \| String[]` | `[]` | Group rows by column keys. Renders collapsible group headers with leaf counts; aggregates show in `aggregate` columns |
| `virtualized` | `Boolean` | `false` | Windowed rendering for large datasets. Bypasses `paginated` (one windowing source); see estimates below |
| `virtualEstimateSize` | `Number` | `48` | Estimated row height in px until measured |
| `virtualOverscan` | `Number` | `3` | Extra rows rendered above/below the viewport |
| `virtualHeight` | `String \| Number` | `400` | Scroll container max-height (number = px) |

### Search Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | `String` | `'Search...'` | Search input placeholder |
| `searchDebounce` | `Number` | `undefined` | Search debounce delay (ms). Unset falls back to the global `debounce` default, then `300` |

### Pagination Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `perPage` | `Number` | `10` | Items per page |
| `currentPage` | `Number` | `1` | Current page number |
| `perPageOptions` | `Number[]` | `[5, 10, 25, 50, 100]` | Page size options |

### Sorting Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortBy` | `String` | `undefined` | Initial sort column key |
| `sortDesc` | `Boolean` | `false` | Initial sort direction (true = descending) |

### Display Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showEmpty` | `Boolean` | `true` | Show message when no data |
| `emptyText` | `String` | `'No data available'` | Empty state message |
| `loading` | `Boolean` | `false` | Show pending row instead of stale or empty content (serverMode fetches) |
| `showPerPage` | `Boolean` | `true` | Show per-page selector |
| `showInfo` | `Boolean` | `true` | Show info text (X to Y of Z entries) |
| `infoText` | `String` | `'Showing {start} to {end} of {total} entries'` | Info text template |
| `filteredInfoText` | `String` | `'Showing {start} to {end} of {total} entries (filtered from {totalRows} total entries)'` | Filtered info text template |

## Column Definition

The `columns` prop accepts an array of `DataTableColumn` objects:

```typescript
interface DataTableColumn {
  key: string                    // Property key in data object
  label: string                  // Column header label
  sortable?: boolean            // Enable/disable sorting (default: true)
  searchable?: boolean          // Include in search (default: true)
  formatter?: (value: any, row: any) => string | number  // Custom formatter
  searchValue?: (row: any) => string | number  // Text to search for this column
  class?: string                // CSS class for td
  headerClass?: string          // CSS class for th
  thStyle?: Record<string, string>  // Inline styles for th (sanitized — see note)
  tdStyle?: Record<string, string>  // Inline styles for td (sanitized — see note)
  filter?: 'text' | 'select' | 'range'  // Filter control in the filter row (omit = none)
  align?: 'start' | 'center' | 'end'    // Text alignment (Bootstrap text-* utility)
  width?: string | number       // Column width (number = px; string = any safe CSS length)
  pinned?: 'start' | 'end'      // Sticky edge column (offsets from the engine)
  resizable?: boolean            // Resize handle (drag, or arrow keys: 10px/step, 50px with Shift; state in columnSizing)
  aggregate?: 'sum' | 'mean' | 'min' | 'max' | 'count' | ((values: unknown[]) => unknown)
                                // Group-row aggregation for this column
  footer?: string               // Footer cell text (overridden by the footer(key) slot)
}
```

> **`thStyle` / `tdStyle` are sanitized.** Both objects are filtered against a safe CSS-property allowlist before being applied, as a defense against CSS injection (data exfiltration / UI spoofing) when column config comes from an API or untrusted source. Properties outside the allowlist are dropped.

### Searching the displayed value

Search matches the text a column actually shows. A column with a `formatter` is searched by its formatted output (search "Yes", not the raw `true`). When the displayed value comes from a `#cell` slot, or is otherwise derived, give the column a `searchValue(row)` function returning the text to match. `searchValue` takes precedence over `formatter`.

```typescript
const columns = [
  // Searched by "Enabled" / "Disabled", not the raw status string.
  { key: 'status', label: 'Status', formatter: (v) => (v === 'active' ? 'Enabled' : 'Disabled') },
  // #cell slot renders tags; searchValue makes them searchable.
  { key: 'tags', label: 'Tags', searchValue: (row) => row.tags.join(' ') },
]
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:currentPage` | `Number` | Emitted when page changes |
| `update:perPage` | `Number` | Emitted when per-page changes |
| `update:sortBy` | `String` | Emitted when sort column changes |
| `update:sortDesc` | `Boolean` | Emitted when sort direction changes |
| `update:sort` | `{ id, desc }[]` | Multi-sort state changes |
| `update:selectedRows` | `(String \| Number)[]` | Selection changes |
| `update:columnFilters` | `{ id, value }[]` | Per-column filter changes |
| `update:columnVisibility` | `Record<String, Boolean>` | Visibility changes (chooser or model) |
| `update:columnOrder` | `String[]` | Column reorder changes (chooser drag or `moveColumn`) |
| `update:columnSizing` | `Record<String, Number>` | Resize changes (px per column) |
| `update:expandedRows` | `(String \| Number)[]` | Expansion changes (rows and groups) |
| `row-selected` | `(item, selected)` | Emitted when a row's selection flips |
| `row-clicked` | `(item, globalIndex)` | Emitted on every row click. `globalIndex` is the index within the full filtered/sorted dataset, not the current page. Set the `clickable` prop to show the pointer cursor that signals rows are interactive. |
| `search` | `String` | Emitted (debounced) with the search query. Use it in `serverMode` to fetch the matching page. |
| `component-error` | `ComponentError` | Emitted if an internal error occurs |

### Server-side mode

Set `serverMode` to hand filtering, sorting, and paging to your backend. The table renders `items` exactly as given (the current page), uses `totalRows` for the page count, and emits the state you need to refetch: `update:currentPage`, `update:perPage`, `update:sortBy`, `update:sortDesc`, and `search`. No local filtering, sorting, or slicing happens.

```vue
<template>
  <VibeDataTable
    :columns="columns"
    :items="rows"
    server-mode
    :total-rows="total"
    v-model:current-page="page"
    v-model:sort-by="sortBy"
    v-model:sort-desc="sortDesc"
    @search="onSearch"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
const rows = ref([]); const total = ref(0)
const page = ref(1); const sortBy = ref(); const sortDesc = ref(false); const query = ref('')
function onSearch(q) { query.value = q }
// Refetch whenever any server-driven input changes.
watch([page, sortBy, sortDesc, query], async () => {
  const res = await api.fetch({ page: page.value, sortBy: sortBy.value, sortDesc: sortDesc.value, q: query.value })
  rows.value = res.items
  total.value = res.total
}, { immediate: true })
</script>
```

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `cell({columnKey})` | `{ item, value, index }` | Custom cell rendering for specific column |
| `expanded` | `{ item, index }` | Detail content for an expanded row |
| `footer({columnKey})` | `{ column }` | Custom footer cell for specific column |

## Usage

### Basic DataTable

```vue
<script setup>
import { ref } from 'vue'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
]

const items = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' }
]
</script>

<template>
  <VibeDataTable :columns="columns" :items="items" row-key="id" />
</template>
```

> Always pass `row-key` pointing at a unique field (here `id`) so Vue keys rows stably across sorting, filtering, and pagination.

### With Bootstrap Styling

```vue
<template>
  <VibeDataTable
    :columns="columns"
    :items="items"
    striped
    hover
    bordered
  />
</template>
```

### Custom Column Configuration

```vue
<script setup>
const columns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    searchable: false,
    headerClass: 'bg-primary text-white'
  },
  {
    key: 'name',
    label: 'Full Name',
    sortable: true
  },
  {
    key: 'salary',
    label: 'Salary',
    formatter: (value) => `$${value.toLocaleString()}`,
    tdStyle: { textAlign: 'right' }
  },
  {
    key: 'status',
    label: 'Status',
    class: 'text-center'
  }
]
</script>

<template>
  <VibeDataTable :columns="columns" :items="items" />
</template>
```

### With Custom Cell Rendering

```vue
<script setup>
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', sortable: false }
]
</script>

<template>
  <VibeDataTable :columns="columns" :items="items">
    <!-- Custom status column -->
    <template #cell(status)="{ value }">
      <VibeBadge :variant="value === 'Active' ? 'success' : 'danger'">
        {{ value }}
      </VibeBadge>
    </template>

    <!-- Custom actions column -->
    <template #cell(actions)="{ item }">
      <VibeButton size="sm" variant="primary" @click="editItem(item)">
        Edit
      </VibeButton>
      <VibeButton size="sm" variant="danger" @click="deleteItem(item)">
        Delete
      </VibeButton>
    </template>
  </VibeDataTable>
</template>
```

### Controlled State (v-model)

```vue
<script setup>
import { ref } from 'vue'

const currentPage = ref(1)
const perPage = ref(25)
const sortBy = ref('name')
const sortDesc = ref(false)

const handleRowClick = (item, globalIndex) => {
  console.log('Clicked row:', item, globalIndex)
}
</script>

<template>
  <VibeDataTable
    :columns="columns"
    :items="items"
    row-key="id"
    v-model:current-page="currentPage"
    v-model:per-page="perPage"
    v-model:sort-by="sortBy"
    v-model:sort-desc="sortDesc"
    @row-clicked="handleRowClick"
  />
</template>
```

### Disable Features

```vue
<template>
  <!-- No search, no pagination -->
  <VibeDataTable
    :columns="columns"
    :items="items"
    :searchable="false"
    :paginated="false"
  />

  <!-- No sorting -->
  <VibeDataTable
    :columns="columns"
    :items="items"
    :sortable="false"
  />
</template>
```

### Custom Page Sizes

```vue
<template>
  <VibeDataTable
    :columns="columns"
    :items="items"
    :per-page="20"
    :per-page-options="[10, 20, 50, 100, 500]"
  />
</template>
```

### Large Dataset Example

```vue
<script setup>
import { ref } from 'vue'

// Generate large dataset
const items = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: ['Sales', 'Marketing', 'Engineering', 'HR'][i % 4],
    salary: Math.floor(Math.random() * 100000) + 50000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1)
      .toISOString()
      .split('T')[0]
  }))
)

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  {
    key: 'salary',
    label: 'Salary',
    sortable: true,
    formatter: (value) => `$${value.toLocaleString()}`
  },
  { key: 'joinDate', label: 'Join Date', sortable: true }
]
</script>

<template>
  <VibeDataTable
    :columns="columns"
    :items="items"
    :per-page="25"
    striped
    hover
    small
  />
</template>
```

### With Custom Empty State

```vue
<template>
  <VibeDataTable
    :columns="columns"
    :items="[]"
    empty-text="No users found. Try adjusting your search."
  />
</template>
```

## Advanced Features (Tier 2)

Opt-in, engine-powered, composable with each other. Everything below also works
in `serverMode` except where noted (virtualization bypasses pagination;
grouping aggregates local rows).

### Row selection

```vue
<VibeDataTable
  :columns="columns"
  :items="users"
  selectable="multiple"
  v-model:selected-rows="selected"
  @row-selected="(item, on) => console.log(item.id, on)"
/>
```

`selectable` accepts `false` (default), `'single'`, `'multiple'`, or `true`
(equals `'multiple'`). A checkbox column is injected with a select-all header
(indeterminate state included); checkboxes are labelled for screen readers.

### Multi-sort plus column filters

```vue
<VibeDataTable
  :columns="filterCols"
  :items="users"
  multi-sort
  v-model:sort="sort"
  v-model:column-filters="filters"
/>
```

Shift-click appends to the sort (plain click replaces). `sortBy`/`sortDesc`
mirror the first entry, so single-sort consumers keep working. Per-column
`filter: 'text' | 'select' | 'range'` renders a filter row; select options come
from faceted values. Filters compose with global search, which still uses the
`searchValue` > `formatter` > raw precedence.

### Expansion and sub-rows

```vue
<VibeDataTable
  :columns="columns"
  :items="orders"
  expandable
  v-model:expanded-rows="expanded"
>
  <template #expanded="{ item }">
    <OrderDetail :order="item" />
  </template>
</VibeDataTable>
```

Children under `subRowsKey` (default `'children'`) render as nested rows when
the parent expands. `expandableRow` limits which rows get a toggle.

### Grouping, aggregation, footer

```vue
<VibeDataTable
  :columns="[
    { key: 'dept', label: 'Dept' },
    { key: 'salary', label: 'Salary', aggregate: 'sum', footer: 'Total' },
  ]"
  :items="staff"
  group-by="dept"
/>
```

Group headers show value plus leaf count and collapse by default; `aggregate`
accepts `sum`, `mean`, `min`, `max`, `count`, or a function over the leaf
values. The footer row renders `footer` text or the matching `footer(key)`
slot per column.

### Virtualization

```vue
<VibeDataTable
  :columns="columns"
  :items="bigList"
  virtualized
  :virtual-estimate-size="48"
  virtual-height="60vh"
/>
```

Only the visible window renders (plus overscan), with spacer rows preserving
scroll height. Pagination is bypassed while on. Rows measure on render, so
`virtualEstimateSize` only affects the pre-measure estimate; keep it close to
the real height to avoid scroll drift.

## Advanced Features

### Formatters

Use formatters to transform data before display:

```vue
<script setup>
const columns = [
  {
    key: 'price',
    label: 'Price',
    formatter: (value) => `$${value.toFixed(2)}`
  },
  {
    key: 'date',
    label: 'Date',
    formatter: (value) => new Date(value).toLocaleDateString()
  },
  {
    key: 'percentage',
    label: 'Complete',
    formatter: (value) => `${value}%`
  }
]
</script>
```

### Accessing Full Row in Formatter

```vue
<script setup>
const columns = [
  {
    key: 'fullName',
    label: 'Full Name',
    formatter: (value, row) => `${row.firstName} ${row.lastName}`
  },
  {
    key: 'discount',
    label: 'Discount',
    formatter: (value, row) => {
      return row.isPremium ? `${value}% (Premium)` : `${value}%`
    }
  }
]
</script>
```

## Bootstrap CSS Classes

- `.table` - Base table
- `.table-striped` - Striped rows
- `.table-bordered` - Bordered table
- `.table-borderless` - Borderless table
- `.table-hover` - Hover effect
- `.table-sm` - Compact table
- `.table-{variant}` - Color variants
- `.table-responsive` - Responsive wrapper
- `.vibe-table-stack` - Mobile card view transformation
- `.pagination` - Pagination controls
- `.form-control` - Search input
- `.form-select` - Per-page selector

## Tips

1. **Large Datasets**: For datasets with 1000+ rows, consider server-side pagination
2. **Stable keys**: Set the `row-key` prop to a unique field in your data for correct behavior during sorting/filtering and best reactivity
3. **Search Debounce**: Adjust `searchDebounce` prop for performance with large datasets
4. **Custom Styling**: Use column `class`, `headerClass`, `thStyle`, `tdStyle` for styling (style objects are sanitized to a safe property allowlist)
5. **Slots**: Use slots for complex cell rendering (badges, buttons, images, etc.)
