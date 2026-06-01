# VibeDropdown

Data-driven toggleable contextual overlay for displaying lists of links.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier |
| `text` | `String` | `'Dropdown'` | Button text |
| `variant` | `Variant` | `'primary'` | Button color variant |
| `size` | `Size` | `undefined` | Button size (`'sm'` or `'lg'`) |
| `split` | `Boolean` | `false` | Split button style |
| `direction` | `Direction` | `'down'` | Direction: `'up'`, `'down'`, `'start'`, `'end'` |
| `menuEnd` | `Boolean` | `false` | Align menu to the right |
| `items` | `DropdownItem[]` | Required | Array of dropdown items |
| `autoClose` | `Boolean\|String` | `true` | Close behavior: `true`, `false`, `'inside'`, `'outside'` |

### DropdownItem Interface

```typescript
interface DropdownItem {
  text?: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  divider?: boolean
  header?: boolean
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when an item is clicked |
| `show` | - | Emitted when dropdown starts showing |
| `shown` | - | Emitted when dropdown is fully shown |
| `hide` | - | Emitted when dropdown starts hiding |
| `hidden` | - | Emitted when dropdown is fully hidden |
| `component-error` | `ComponentError` | Emitted if Bootstrap JS fails to load |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `button` | - | Custom button content |
| `item` | `{ item, index }` | Custom item rendering |
| `header` | `{ item, index }` | Custom header rendering |

## Usage

### Basic Dropdown

```vue
<template>
  <VibeDropdown text="Dropdown Menu" :items="dropdownItems" @item-click="onItemClick" />
</template>

<script setup>
const dropdownItems = [
  { header: true, text: 'Actions' },
  { text: 'Edit', href: '#edit' },
  { text: 'Duplicate', href: '#duplicate' },
  { divider: true },
  { text: 'Delete', href: '#delete', active: false }
]

function onItemClick({ item, index }) {
  console.log('clicked', item.text, 'at', index)
}
</script>
```

### Custom Item Rendering (Slots)

The `item` and `header` slots receive `{ item, index }` so you can render rich markup while still driving the menu from the `items` array:

```vue
<template>
  <VibeDropdown text="Menu" :items="dropdownItems">
    <template #item="{ item }">
      <i :class="item.icon" class="me-2" />{{ item.text }}
    </template>
  </VibeDropdown>
</template>

<script setup>
const dropdownItems = [
  { text: 'Profile', href: '#', icon: 'bi bi-person' },
  { text: 'Settings', href: '#', icon: 'bi bi-gear' }
]
</script>
```

### Programmatic Control

```vue
<template>
  <div>
    <VibeButton @click="myDropdown.toggle()">External Toggle</VibeButton>

    <VibeDropdown ref="myDropdown" text="Dropdown Menu" :items="dropdownItems" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const myDropdown = ref(null)
const dropdownItems = [
  { text: 'Edit', href: '#edit' },
  { text: 'Delete', href: '#delete' }
]
</script>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Dropdown functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Programmatic Methods:** The component exposes `show()`, `hide()`, and `toggle()` via template refs for programmatic control.

## Bootstrap CSS Classes

- `.dropdown`, `.dropup`, `.dropend`, `.dropstart`
- `.dropdown-toggle`
- `.dropdown-menu`
- `.dropdown-item`
