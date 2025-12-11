# VibeListGroup & VibeListGroupItem

Flexible component for displaying lists of content.

## VibeListGroup

List group container.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flush` | `Boolean` | `false` | Remove borders and rounded corners |
| `horizontal` | `Boolean\|String` | `false` | Horizontal layout: `true` or breakpoint (`'sm'`, `'md'`, `'lg'`, `'xl'`) |
| `numbered` | `Boolean` | `false` | Numbered list items |
| `tag` | `String` | `'ul'` | HTML tag: `'ul'`, `'ol'`, or `'div'` |
| `items` | `ListGroupItem[]` | `undefined` | Array of list group items (shorthand mode) |

#### ListGroupItem Interface

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

## VibeListGroupItem

List group item.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Active state |
| `disabled` | `Boolean` | `false` | Disabled state |
| `variant` | `Variant` | `undefined` | Color variant |
| `href` | `String` | `undefined` | Link URL |
| `to` | `String\|Object` | `undefined` | Router link destination |
| `tag` | `String` | `'li'` | HTML tag to render |
| `action` | `Boolean` | `false` | Make item clickable (button) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when item is clicked |

## Usage

### Shorthand Mode (Array-Based)

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

### Composable Mode (Slot-Based)

```vue
<template>
  <VibeListGroup>
    <VibeListGroupItem>An item</VibeListGroupItem>
    <VibeListGroupItem>A second item</VibeListGroupItem>
    <VibeListGroupItem>A third item</VibeListGroupItem>
  </VibeListGroup>
</template>
```

### Active and Disabled Items

```vue
<template>
  <VibeListGroup>
    <VibeListGroupItem active>Active item</VibeListGroupItem>
    <VibeListGroupItem>Second item</VibeListGroupItem>
    <VibeListGroupItem disabled>Disabled item</VibeListGroupItem>
  </VibeListGroup>
</template>
```

### Links

```vue
<template>
  <VibeListGroup>
    <VibeListGroupItem href="#" active>Link 1</VibeListGroupItem>
    <VibeListGroupItem href="#">Link 2</VibeListGroupItem>
    <VibeListGroupItem href="#">Link 3</VibeListGroupItem>
  </VibeListGroup>
</template>
```

### Colored Items

```vue
<template>
  <VibeListGroup>
    <VibeListGroupItem variant="primary">Primary item</VibeListGroupItem>
    <VibeListGroupItem variant="success">Success item</VibeListGroupItem>
    <VibeListGroupItem variant="danger">Danger item</VibeListGroupItem>
    <VibeListGroupItem variant="warning">Warning item</VibeListGroupItem>
  </VibeListGroup>
</template>
```

### Flush List

```vue
<template>
  <VibeListGroup flush>
    <VibeListGroupItem>An item</VibeListGroupItem>
    <VibeListGroupItem>A second item</VibeListGroupItem>
    <VibeListGroupItem>A third item</VibeListGroupItem>
  </VibeListGroup>
</template>
```

### Horizontal List

```vue
<template>
  <VibeListGroup horizontal>
    <VibeListGroupItem>Item 1</VibeListGroupItem>
    <VibeListGroupItem>Item 2</VibeListGroupItem>
    <VibeListGroupItem>Item 3</VibeListGroupItem>
  </VibeListGroup>
</template>
```

### Numbered List

```vue
<template>
  <VibeListGroup numbered tag="ol">
    <VibeListGroupItem>First item</VibeListGroupItem>
    <VibeListGroupItem>Second item</VibeListGroupItem>
    <VibeListGroupItem>Third item</VibeListGroupItem>
  </VibeListGroup>
</template>
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
