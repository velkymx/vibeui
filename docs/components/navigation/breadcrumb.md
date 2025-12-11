# VibeBreadcrumb & VibeBreadcrumbItem

Breadcrumb navigation to indicate the current page's location within a navigational hierarchy.

## VibeBreadcrumb

Container for breadcrumb items.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `String` | `'breadcrumb'` | ARIA label for navigation |
| `items` | `BreadcrumbItem[]` | `undefined` | Array of breadcrumb items (shorthand mode) |

#### BreadcrumbItem Interface

```typescript
interface BreadcrumbItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
}
```

## VibeBreadcrumbItem

Individual breadcrumb item.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Marks item as current page |
| `href` | `String` | `undefined` | Link URL |
| `to` | `String\|Object` | `undefined` | Router link destination |

## Usage

### Shorthand Mode (Array-Based)

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

### Composable Mode (Slot-Based)

```vue
<template>
  <VibeBreadcrumb>
    <VibeBreadcrumbItem href="/">Home</VibeBreadcrumbItem>
    <VibeBreadcrumbItem href="/library">Library</VibeBreadcrumbItem>
    <VibeBreadcrumbItem active>Data</VibeBreadcrumbItem>
  </VibeBreadcrumb>
</template>
```

### With Router Links

```vue
<template>
  <VibeBreadcrumb>
    <VibeBreadcrumbItem :to="{ name: 'home' }">Home</VibeBreadcrumbItem>
    <VibeBreadcrumbItem :to="{ name: 'products' }">Products</VibeBreadcrumbItem>
    <VibeBreadcrumbItem active>Details</VibeBreadcrumbItem>
  </VibeBreadcrumb>
</template>
```

## Bootstrap CSS Classes

- `.breadcrumb`
- `.breadcrumb-item`
- `.active`
