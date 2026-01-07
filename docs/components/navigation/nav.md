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
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when item is clicked (unless disabled) |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item, index }` | Custom item rendering |

## Usage

### Basic Navigation

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

### Tabs

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
  <VibeNav pills :items="pillItems" />
</template>

<script setup>
const pillItems = [
  { text: 'Pill 1', href: '#pill1', active: true },
  { text: 'Pill 2', href: '#pill2' },
  { text: 'Pill 3', href: '#pill3' }
]
</script>
```

### Vertical Navigation

```vue
<template>
  <VibeNav vertical pills :items="navItems" />
</template>
```

### Fill and Justified

```vue
<template>
  <!-- Fill proportionally -->
  <VibeNav fill :items="navItems" />

  <!-- Fill equally -->
  <VibeNav justified :items="navItems" />
</template>
```

### With Router Links

```vue
<template>
  <VibeNav tabs :items="routerItems" />
</template>

<script setup>
const routerItems = [
  { text: 'Home', to: { name: 'home' }, active: true },
  { text: 'About', to: { name: 'about' } },
  { text: 'Contact', to: { name: 'contact' } }
]
</script>
```

### Custom Item Rendering

Use the `item` scoped slot for custom content:

```vue
<template>
  <VibeNav tabs :items="navItems">
    <template #item="{ item }">
      <VibeIcon v-if="item.icon" :icon="item.icon" class="me-2" />
      {{ item.text }}
      <VibeBadge v-if="item.count" variant="danger" class="ms-2">
        {{ item.count }}
      </VibeBadge>
    </template>
  </VibeNav>
</template>

<script setup>
const navItems = [
  { text: 'Home', href: '#', icon: 'house-fill', active: true },
  { text: 'Messages', href: '#', icon: 'envelope', count: 5 },
  { text: 'Settings', href: '#', icon: 'gear' }
]
</script>
```

### With Event Handling

```vue
<template>
  <VibeNav tabs :items="navItems" @item-click="handleClick" />
</template>

<script setup>
const navItems = [
  { text: 'Tab 1', href: '#tab1', active: true },
  { text: 'Tab 2', href: '#tab2' },
  { text: 'Tab 3', href: '#tab3' }
]

const handleClick = ({ item, index }) => {
  console.log(`Clicked: ${item.text} at index ${index}`)
}
</script>
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
