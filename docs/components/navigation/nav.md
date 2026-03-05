# VibeNav

Data-driven navigation tabs and pills for organizing content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Boolean` | `false` | Use tabs style |
| `pills` | `Boolean` | `false` | Use pills style |
| `fill` | `Boolean` | `false` | Fill available width proportionally |
| `justified` | `Boolean` | `false` | Fill available width equally |
| `vertical` | `Boolean` | `false` | Stack navigation vertically |
| `tag` | `String` | `'ul'` | HTML tag to render |
| `items` | `NavItem[]` | Required | Array of nav items |

### NavItem Interface

```typescript
interface NavItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  children?: NavItem[] // Support for dropdowns
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when item is clicked |
| `show` | `event` | Emitted when a tab starts showing |
| `shown` | `event` | Emitted when a tab is fully shown |
| `hide` | `event` | Emitted when a tab starts hiding |
| `hidden` | `event` | Emitted when a tab is fully hidden |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item, index }` | Custom item rendering |

## Usage

### Interactive Tabs

When using the `tabs` or `pills` props, nav links with an `href` starting with `#` will automatically act as Bootstrap tab triggers.

```vue
<template>
  <div>
    <VibeNav tabs :items="navItems" />
    
    <VibeTabContent :panes="tabPanes" class="mt-3" />
  </div>
</template>

<script setup>
const navItems = [
  { text: 'Home', href: '#home', active: true },
  { text: 'Profile', href: '#profile' }
]

const tabPanes = [
  { id: 'home', content: 'Home content...', active: true },
  { id: 'profile', content: 'Profile content...' }
]
</script>
```

## Important Notes

**Automatic Initialization:** When using `tabs` or `pills`, this component automatically initializes Bootstrap's Tab functionality for any items that target a local ID (e.g., `href="#my-tab"`).

**State Management:** For complex tab state, combine `VibeNav` with `VibeTabContent` and manage the `active` state through your data.

## Bootstrap CSS Classes

- `.nav`
- `.nav-tabs`
- `.nav-pills`
- `.nav-item`
- `.nav-link`
