# VibePagination

Data-driven pagination component with v-model support.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'lg'` | `undefined` | Pagination size |
| `ariaLabel` | `String` | `'Pagination'` | ARIA label for the nav element |
| `totalPages` | `Number` | Required | Total number of pages |
| `currentPage` | `Number` | `1` | Current active page |
| `showPrevNext` | `Boolean` | `true` | Show previous/next buttons |
| `prevText` | `String` | `'Previous'` | Text for previous button |
| `nextText` | `String` | `'Next'` | Text for next button |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:currentPage` | `page: number` | Emitted when page changes (v-model) |
| `page-click` | `page: number` | Emitted when a page is clicked |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `prev` | `{ disabled }` | Custom previous button |
| `page` | `{ page, active }` | Custom page button |
| `next` | `{ disabled }` | Custom next button |

## Usage

### Basic Example

```vue
<template>
  <VibePagination
    :total-pages="10"
    v-model:current-page="currentPage"
  />
</template>

<script setup>
import { ref } from 'vue'

const currentPage = ref(1)
</script>
```

### Sizes

```vue
<template>
  <!-- Small -->
  <VibePagination :total-pages="5" size="sm" v-model:current-page="page1" />

  <!-- Default -->
  <VibePagination :total-pages="5" v-model:current-page="page2" />

  <!-- Large -->
  <VibePagination :total-pages="5" size="lg" v-model:current-page="page3" />
</template>
```

### Without Prev/Next Buttons

```vue
<template>
  <VibePagination
    :total-pages="10"
    :show-prev-next="false"
    v-model:current-page="currentPage"
  />
</template>
```

### Custom Button Text

```vue
<template>
  <VibePagination
    :total-pages="10"
    prev-text="← Back"
    next-text="Forward →"
    v-model:current-page="currentPage"
  />
</template>
```

### Custom Page Rendering

Use scoped slots for complete customization:

```vue
<template>
  <VibePagination :total-pages="10" v-model:current-page="currentPage">
    <template #prev="{ disabled }">
      <VibeIcon icon="chevron-left" />
    </template>

    <template #page="{ page, active }">
      Page {{ page }}
    </template>

    <template #next="{ disabled }">
      <VibeIcon icon="chevron-right" />
    </template>
  </VibePagination>
</template>
```

### With Event Handling

```vue
<template>
  <VibePagination
    :total-pages="20"
    v-model:current-page="currentPage"
    @page-click="handlePageClick"
  />

  <p>Current page: {{ currentPage }}</p>
</template>

<script setup>
import { ref } from 'vue'

const currentPage = ref(1)

const handlePageClick = (page) => {
  console.log(`Navigated to page ${page}`)
  // Fetch data for the new page
}
</script>
```

## Bootstrap CSS Classes

- `.pagination`
- `.pagination-sm`
- `.pagination-lg`
- `.page-item`
- `.page-link`
- `.active`
- `.disabled`
