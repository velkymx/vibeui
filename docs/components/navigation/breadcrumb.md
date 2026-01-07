# VibeBreadcrumb

Data-driven breadcrumb navigation to indicate the current page's location within a navigational hierarchy.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `String` | `'breadcrumb'` | ARIA label for navigation |
| `items` | `BreadcrumbItem[]` | Required | Array of breadcrumb items |

### BreadcrumbItem Interface

```typescript
interface BreadcrumbItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when an item is clicked (unless active) |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item, index }` | Custom item rendering |

## Usage

### Basic Example

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems" />
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', href: '/' },
  { text: 'Library', href: '/library' },
  { text: 'Data', active: true }
]
</script>
```

### With Router Links

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems" />
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', to: { name: 'home' } },
  { text: 'Products', to: { name: 'products' } },
  { text: 'Details', active: true }
]
</script>
```

### Custom Item Rendering

Use the `item` scoped slot for custom rendering:

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems">
    <template #item="{ item, index }">
      <VibeIcon v-if="item.icon" :icon="item.icon" class="me-1" />
      {{ item.text }}
    </template>
  </VibeBreadcrumb>
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', href: '/', icon: 'house-fill' },
  { text: 'Library', href: '/library', icon: 'book' },
  { text: 'Data', active: true, icon: 'file-earmark' }
]
</script>
```

### With Event Handling

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems" @item-click="handleClick" />
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', href: '/' },
  { text: 'Products', href: '/products' },
  { text: 'Details', active: true }
]

const handleClick = ({ item, index }) => {
  console.log(`Clicked: ${item.text} at index ${index}`)
}
</script>
```

## Bootstrap CSS Classes

- `.breadcrumb`
- `.breadcrumb-item`
- `.active`
