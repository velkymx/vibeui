# VibeNav & VibeNavItem

Navigation tabs and pills for organizing content.

## VibeNav

Navigation container component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Boolean` | `false` | Use tabs style |
| `pills` | `Boolean` | `false` | Use pills style |
| `fill` | `Boolean` | `false` | Fill available width proportionally |
| `justified` | `Boolean` | `false` | Fill available width equally |
| `vertical` | `Boolean` | `false` | Stack navigation vertically |
| `tag` | `String` | `'ul'` | HTML tag to render |
| `items` | `NavItem[]` | `undefined` | Array of nav items (shorthand mode) |

#### NavItem Interface

```typescript
interface NavItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
}
```

## VibeNavItem

Navigation item component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Active state |
| `disabled` | `Boolean` | `false` | Disabled state |
| `href` | `String` | `undefined` | Link URL |
| `to` | `String\|Object` | `undefined` | Router link destination |

## Usage

### Shorthand Mode (Array-Based)

```vue
<template>
  <VibeNav :items="navItems" />
</template>

<script setup>
const navItems = [
  { text: 'Active', href: '#', active: true },
  { text: 'Link', href: '#' },
  { text: 'Link', href: '#' },
  { text: 'Disabled', disabled: true }
]
</script>
```

### Composable Mode (Slot-Based)

```vue
<template>
  <VibeNav>
    <VibeNavItem active href="#">Active</VibeNavItem>
    <VibeNavItem href="#">Link</VibeNavItem>
    <VibeNavItem href="#">Link</VibeNavItem>
    <VibeNavItem disabled>Disabled</VibeNavItem>
  </VibeNav>
</template>
```

### Tabs (Shorthand)

```vue
<template>
  <VibeNav tabs :items="tabItems" />
</template>

<script setup>
const tabItems = [
  { text: 'Tab 1', href: '#tab1', active: true },
  { text: 'Tab 2', href: '#tab2' },
  { text: 'Tab 3', href: '#tab3' }
]
</script>
```

### Pills

```vue
<template>
  <VibeNav pills>
    <VibeNavItem active href="#pill1">Pill 1</VibeNavItem>
    <VibeNavItem href="#pill2">Pill 2</VibeNavItem>
    <VibeNavItem href="#pill3">Pill 3</VibeNavItem>
  </VibeNav>
</template>
```

### Vertical Nav

```vue
<template>
  <VibeNav vertical pills>
    <VibeNavItem active href="#">Active</VibeNavItem>
    <VibeNavItem href="#">Link</VibeNavItem>
    <VibeNavItem href="#">Link</VibeNavItem>
  </VibeNav>
</template>
```

## Bootstrap CSS Classes

- `.nav`
- `.nav-tabs`
- `.nav-pills`
- `.nav-fill`
- `.nav-justified`
- `.flex-column`
- `.nav-item`
- `.nav-link`
- `.active`
- `.disabled`
