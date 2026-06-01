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

### ListGroupItem Interface

```typescript
interface ListGroupItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  variant?: Variant
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when an item is clicked (unless disabled) |

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
