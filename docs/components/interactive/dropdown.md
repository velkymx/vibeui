# VibeDropdown

Data-driven toggleable contextual overlay for displaying lists of links. Requires Bootstrap JS.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
| `text` | `String` | `'Dropdown'` | Button text |
| `variant` | `Variant` | `'primary'` | Button color variant |
| `size` | `Size` | `undefined` | Button size (`'sm'` or `'lg'`) |
| `split` | `Boolean` | `false` | Split button style |
| `direction` | `Direction` | `'down'` | Direction: `'up'`, `'down'`, `'start'`, `'end'` |
| `menuEnd` | `Boolean` | `false` | Align menu to the right |
| `items` | `DropdownItem[]` | Required | Array of dropdown items |

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
| `item-click` | `{ item, index, event }` | Emitted when an item is clicked (unless disabled, divider, or header) |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `button` | - | Custom button content |
| `item` | `{ item, index }` | Custom item rendering (for regular items) |
| `header` | `{ item, index }` | Custom header rendering |

## Usage

### Basic Dropdown

```vue
<template>
  <VibeDropdown
    id="dropdown1"
    text="Dropdown Menu"
    variant="primary"
    :items="dropdownItems"
  />
</template>

<script setup>
const dropdownItems = [
  { text: 'Action', href: '#' },
  { text: 'Another action', href: '#' },
  { divider: true },
  { text: 'Separated link', href: '#' }
]
</script>
```

### With Headers and Dividers

```vue
<template>
  <VibeDropdown id="dropdown2" text="Menu" variant="secondary" :items="items" />
</template>

<script setup>
const items = [
  { text: 'Header 1', header: true },
  { text: 'Action', href: '#' },
  { text: 'Another action', href: '#' },
  { divider: true },
  { text: 'Header 2', header: true },
  { text: 'Something else', href: '#' }
]
</script>
```

### Dropup and Directions

```vue
<template>
  <!-- Dropup -->
  <VibeDropdown id="dropup1" text="Dropup" direction="up" :items="items" />

  <!-- Dropend -->
  <VibeDropdown id="dropend1" text="Dropend" direction="end" :items="items" />

  <!-- Dropstart -->
  <VibeDropdown id="dropstart1" text="Dropstart" direction="start" :items="items" />
</template>
```

### With Router Links

```vue
<template>
  <VibeDropdown id="dropdown-router" text="Navigation" :items="navItems" />
</template>

<script setup>
const navItems = [
  { text: 'Home', to: { name: 'home' } },
  { text: 'About', to: { name: 'about' } },
  { divider: true },
  { text: 'Contact', to: { name: 'contact' } }
]
</script>
```

### Active and Disabled Items

```vue
<template>
  <VibeDropdown id="dropdown-states" text="Menu" :items="items" />
</template>

<script setup>
const items = [
  { text: 'Regular item', href: '#' },
  { text: 'Active item', href: '#', active: true },
  { text: 'Disabled item', href: '#', disabled: true }
]
</script>
```

### Custom Button Content

Use the `button` slot for custom button rendering:

```vue
<template>
  <VibeDropdown id="custom-button" variant="primary" :items="items">
    <template #button>
      <VibeIcon icon="gear" /> Settings
    </template>
  </VibeDropdown>
</template>
```

### Custom Item Rendering

Use scoped slots for rich content:

```vue
<template>
  <VibeDropdown id="custom-items" text="Actions" :items="actions">
    <template #item="{ item }">
      <VibeIcon :icon="item.icon" class="me-2" />
      {{ item.text }}
    </template>
  </VibeDropdown>
</template>

<script setup>
const actions = [
  { text: 'Edit', href: '#', icon: 'pencil' },
  { text: 'Copy', href: '#', icon: 'clipboard' },
  { text: 'Delete', href: '#', icon: 'trash' }
]
</script>
```

### With Event Handling

```vue
<template>
  <VibeDropdown
    id="dropdown-events"
    text="Actions"
    :items="items"
    @item-click="handleAction"
  />
</template>

<script setup>
const items = [
  { text: 'Edit', href: '#' },
  { text: 'Copy', href: '#' },
  { divider: true },
  { text: 'Delete', href: '#' }
]

const handleAction = ({ item, index }) => {
  console.log(`Action: ${item.text}`)
}
</script>
```

### Different Sizes

```vue
<template>
  <VibeDropdown id="dropdown-sm" text="Small" size="sm" :items="items" />
  <VibeDropdown id="dropdown-default" text="Default" :items="items" />
  <VibeDropdown id="dropdown-lg" text="Large" size="lg" :items="items" />
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

## Bootstrap CSS Classes

- `.dropdown`, `.dropup`, `.dropend`, `.dropstart`
- `.dropdown-toggle`
- `.dropdown-menu`
- `.dropdown-menu-end`
- `.dropdown-item`
- `.dropdown-divider`
- `.dropdown-header`
- `.active`
- `.disabled`
