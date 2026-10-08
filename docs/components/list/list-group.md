# VibeListGroup

Data-driven component for displaying flexible lists of content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flush` | `Boolean` | `false` | Remove borders and rounded corners |
| `horizontal` | `Boolean\|String` | `false` | Horizontal layout: `true` or breakpoint (`'sm'`, `'md'`, `'lg'`, `'xl'`) |
| `numbered` | `Boolean` | `false` | Numbered list items |
| `tag` | `String` | `'ul'` | HTML tag: `'ul'`, `'ol'`, or `'div'` |
| `items` | `ListGroupItem[]` | Required | Array of list group items |
| `showEmpty` | `Boolean` | `true` | Show `emptyText` row when `items` is empty |
| `emptyText` | `String` | `'No items'` | Empty state message |

### ListGroupItem Interface

```typescript
interface ListGroupItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  variant?: Variant
  tag?: string      // Override the wrapper element (e.g. 'button'); default a/router-link/li
  class?: string    // Extra classes merged onto the item element
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when an item is clicked (unless disabled) |
| `component-error` | `ComponentError` | Emitted on an internal error. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item, index }` | Custom item rendering |

## Usage

### Basic List

```vue
<template>
  <VibeListGroup :items="listItems" />
</template>

<script setup>
const listItems = [
  { text: 'An item' },
  { text: 'A second item' },
  { text: 'A third item' }
]
</script>
```

### Active and Disabled Items

```vue
<template>
  <VibeListGroup :items="listItems" />
</template>

<script setup>
const listItems = [
  { text: 'An item' },
  { text: 'A second item', active: true },
  { text: 'A third item' },
  { text: 'A disabled item', disabled: true }
]
</script>
```

### With Links

```vue
<template>
  <VibeListGroup :items="listItems" />
</template>

<script setup>
const listItems = [
  { text: 'Link 1', href: '#', active: true },
  { text: 'Link 2', href: '#' },
  { text: 'Link 3', href: '#' }
]
</script>
```

### With Router Links

```vue
<template>
  <VibeListGroup :items="listItems" />
</template>

<script setup>
const listItems = [
  { text: 'Home', to: { name: 'home' } },
  { text: 'About', to: { name: 'about' } },
  { text: 'Contact', to: { name: 'contact' } }
]
</script>
```

### Colored Items

```vue
<template>
  <VibeListGroup :items="listItems" />
</template>

<script setup>
const listItems = [
  { text: 'Primary item', variant: 'primary' },
  { text: 'Success item', variant: 'success' },
  { text: 'Danger item', variant: 'danger' },
  { text: 'Warning item', variant: 'warning' },
  { text: 'Info item', variant: 'info' }
]
</script>
```

### Flush List

Remove borders and rounded corners:

```vue
<template>
  <VibeListGroup flush :items="listItems" />
</template>
```

### Horizontal List

```vue
<template>
  <!-- Always horizontal -->
  <VibeListGroup horizontal :items="listItems" />

  <!-- Horizontal on md and up -->
  <VibeListGroup horizontal="md" :items="listItems" />
</template>
```

### Numbered List

```vue
<template>
  <VibeListGroup numbered tag="ol" :items="listItems" />
</template>

<script setup>
const listItems = [
  { text: 'First item' },
  { text: 'Second item' },
  { text: 'Third item' }
]
</script>
```

### Custom Item Rendering

Use the `item` scoped slot for complex content:

```vue
<template>
  <VibeListGroup :items="listItems">
    <template #item="{ item }">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-1">{{ item.text }}</h5>
          <p class="mb-1">{{ item.description }}</p>
        </div>
        <VibeBadge variant="primary">{{ item.count }}</VibeBadge>
      </div>
    </template>
  </VibeListGroup>
</template>

<script setup>
const listItems = [
  { text: 'Inbox', description: 'Unread messages', count: 14 },
  { text: 'Starred', description: 'Important items', count: 3 },
  { text: 'Sent', description: 'Outgoing mail', count: 25 }
]
</script>
```

### Rich Rows with Multiple Actions

For rows with several actions, render action buttons in the `#item` slot and call `event.stopPropagation()` so a button click does not also trigger the row-level `item-click`. Use `class` for layout and `tag` to override the wrapper element (for example a single-action `button` row).

```vue
<template>
  <VibeListGroup :items="rows">
    <template #item="{ item }">
      <div class="d-flex justify-content-between align-items-center w-100">
        <span>{{ item.text }}</span>
        <div class="btn-group btn-group-sm">
          <VibeButton variant="outline-primary" @click="edit(item, $event)">Edit</VibeButton>
          <VibeButton variant="outline-danger" @click="remove(item, $event)">Delete</VibeButton>
        </div>
      </div>
    </template>
  </VibeListGroup>
</template>

<script setup>
const rows = [
  { text: 'Project Alpha', class: 'd-flex' },
  { text: 'Project Beta', class: 'd-flex' }
]
function edit(item, e) { e.stopPropagation(); /* ... */ }
function remove(item, e) { e.stopPropagation(); /* ... */ }
</script>
```

To make a whole row a single actionable control, set `tag: 'button'` on the item:

```js
const items = [{ text: 'Run task', tag: 'button' }]
```

### With Event Handling

```vue
<template>
  <VibeListGroup :items="listItems" @item-click="handleClick" />
</template>

<script setup>
const listItems = [
  { text: 'Item 1' },
  { text: 'Item 2' },
  { text: 'Item 3' }
]

const handleClick = ({ item, index }) => {
  console.log(`Clicked: ${item.text} at index ${index}`)
}
</script>
```

## Important Notes

**`href` sanitization:** Each item's `href` is sanitized. Only `https://`/`http://` URLs, absolute paths (`/path`), relative paths (`./`, `../`), and anchors (`#section`) are allowed. Dangerous values such as `javascript:`, `data:`, `vbscript:`, and protocol-relative `//host` URLs are stripped — the item renders without an `href` (falling back to a non-link element). Use `to` for in-app navigation via Vue Router.

## Bootstrap CSS Classes

- `.list-group`
- `.list-group-flush`
- `.list-group-horizontal`, `.list-group-horizontal-{breakpoint}`
- `.list-group-numbered`
- `.list-group-item`
- `.list-group-item-{variant}`
- `.list-group-item-action`
- `.active`
- `.disabled`
