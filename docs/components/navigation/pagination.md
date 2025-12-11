# VibePagination & VibePaginationItem

Pagination for indicating a series of related content across multiple pages.

## VibePagination

Pagination container.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `Size` | `undefined` | Size: `'sm'` or `'lg'` |
| `ariaLabel` | `String` | `'Pagination'` | ARIA label for navigation |
| `totalPages` | `Number` | `undefined` | Total number of pages (shorthand mode) |
| `currentPage` | `Number` | `1` | Current active page (shorthand mode) |
| `showPrevNext` | `Boolean` | `true` | Show previous/next buttons (shorthand mode) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `page-click` | `Number` | Emitted when a page is clicked (shorthand mode) |

## VibePaginationItem

Individual pagination item.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Active page state |
| `disabled` | `Boolean` | `false` | Disabled state |
| `href` | `String` | `undefined` | Link URL |
| `to` | `String\|Object` | `undefined` | Router link destination |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when item is clicked |

## Usage

### Shorthand Mode (Auto-Generated)

```vue
<template>
  <VibePagination
    :total-pages="10"
    :current-page="currentPage"
    @page-click="handlePageClick"
  />
</template>

<script setup>
import { ref } from 'vue'

const currentPage = ref(1)

const handlePageClick = (page) => {
  currentPage.value = page
  // Fetch data for the new page
}
</script>
```

### Composable Mode (Slot-Based)

```vue
<template>
  <VibePagination>
    <VibePaginationItem disabled>Previous</VibePaginationItem>
    <VibePaginationItem href="#">1</VibePaginationItem>
    <VibePaginationItem active href="#">2</VibePaginationItem>
    <VibePaginationItem href="#">3</VibePaginationItem>
    <VibePaginationItem href="#">Next</VibePaginationItem>
  </VibePagination>
</template>
```

### Sized Pagination

```vue
<template>
  <div>
    <VibePagination size="sm">
      <VibePaginationItem href="#">1</VibePaginationItem>
      <VibePaginationItem href="#">2</VibePaginationItem>
      <VibePaginationItem href="#">3</VibePaginationItem>
    </VibePagination>

    <VibePagination size="lg">
      <VibePaginationItem href="#">1</VibePaginationItem>
      <VibePaginationItem href="#">2</VibePaginationItem>
      <VibePaginationItem href="#">3</VibePaginationItem>
    </VibePagination>
  </div>
</template>
```

### With Click Handlers

```vue
<script setup>
import { ref } from 'vue'

const currentPage = ref(1)

const goToPage = (page) => {
  currentPage.value = page
}
</script>

<template>
  <VibePagination>
    <VibePaginationItem
      v-for="page in 5"
      :key="page"
      :active="page === currentPage"
      @click="goToPage(page)"
    >
      {{ page }}
    </VibePaginationItem>
  </VibePagination>
</template>
```

## Bootstrap CSS Classes

- `.pagination`
- `.pagination-{size}`
- `.page-item`
- `.page-link`
- `.active`
- `.disabled`
