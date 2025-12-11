# VibeDataTable

Powerful data table component with search, sorting, and pagination - similar to DataTables.net but built for Vue 3 and Bootstrap 5.3.

## Features

- **Search/Filter** - Real-time search across all searchable columns
- **Column Sorting** - Click column headers to sort (asc/desc)
- **Pagination** - Built-in pagination with customizable page sizes
- **Responsive** - Mobile-friendly with responsive table wrapper
- **Bootstrap Styling** - All Bootstrap table variants (striped, bordered, hover, etc.)
- **Custom Cell Rendering** - Slots for custom cell content
- **Formatters** - Custom data formatters per column
- **TypeScript** - Fully typed with comprehensive interfaces

## Props

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<any>` | `[]` | Array of data objects to display |
| `columns` | `DataTableColumn[]` | Required | Column definitions |

### Table Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `striped` | `Boolean` | `false` | Striped table rows |
| `bordered` | `Boolean` | `false` | Bordered table |
| `borderless` | `Boolean` | `false` | Remove all borders |
| `hover` | `Boolean` | `false` | Hover effect on rows |
| `small` | `Boolean` | `false` | Compact table |
| `responsive` | `Boolean` | `true` | Responsive table wrapper |
| `variant` | `String` | `undefined` | Table color variant |

### Feature Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchable` | `Boolean` | `true` | Enable search functionality |
| `sortable` | `Boolean` | `true` | Enable column sorting |
| `paginated` | `Boolean` | `true` | Enable pagination |

### Search Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | `String` | `'Search...'` | Search input placeholder |
| `searchDebounce` | `Number` | `300` | Search debounce delay (ms) |

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
  class?: string                // CSS class for td
  headerClass?: string          // CSS class for th
  thStyle?: Record<string, string>  // Inline styles for th
  tdStyle?: Record<string, string>  // Inline styles for td
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:currentPage` | `Number` | Emitted when page changes |
| `update:perPage` | `Number` | Emitted when per-page changes |
| `update:sortBy` | `String` | Emitted when sort column changes |
| `update:sortDesc` | `Boolean` | Emitted when sort direction changes |
| `row-clicked` | `(item, index)` | Emitted when row is clicked |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `cell({columnKey})` | `{ item, value, index }` | Custom cell rendering for specific column |

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
  <VibeDataTable :columns="columns" :items="items" />
</template>
```

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

const handleRowClick = (item, index) => {
  console.log('Clicked row:', item, index)
}
</script>

<template>
  <VibeDataTable
    :columns="columns"
    :items="items"
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
- `.pagination` - Pagination controls
- `.form-control` - Search input
- `.form-select` - Per-page selector

## Tips

1. **Large Datasets**: For datasets with 1000+ rows, consider server-side pagination
2. **Performance**: Use `:key` on items for better Vue reactivity
3. **Search Debounce**: Adjust `searchDebounce` prop for performance with large datasets
4. **Custom Styling**: Use column `class`, `headerClass`, `thStyle`, `tdStyle` for styling
5. **Slots**: Use slots for complex cell rendering (badges, buttons, images, etc.)
