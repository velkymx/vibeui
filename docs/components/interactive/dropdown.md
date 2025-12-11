# VibeDropdown & VibeDropdownItem

Toggleable contextual overlays for displaying lists of links. Requires Bootstrap JS.

## VibeDropdown

Dropdown container.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
| `text` | `String` | `'Dropdown'` | Button text |
| `variant` | `Variant` | `'primary'` | Button color variant |
| `size` | `Size` | `undefined` | Button size |
| `split` | `Boolean` | `false` | Split button style |
| `direction` | `Direction` | `'down'` | Direction: `'up'`, `'down'`, `'start'`, `'end'` |
| `menuEnd` | `Boolean` | `false` | Align menu to the right |
| `items` | `DropdownItem[]` | `undefined` | Array of dropdown items (shorthand mode) |

#### DropdownItem Interface

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

## VibeDropdownItem

Dropdown menu item.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Active state |
| `disabled` | `Boolean` | `false` | Disabled state |
| `href` | `String` | `undefined` | Link URL |
| `to` | `String\|Object` | `undefined` | Router link |
| `divider` | `Boolean` | `false` | Render as divider |
| `header` | `Boolean` | `false` | Render as header |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when item is clicked |

## Usage

### Shorthand Mode (Array-Based)

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

### Composable Mode (Slot-Based)

```vue
<template>
  <VibeDropdown id="dropdown1" text="Dropdown Menu" variant="primary">
    <VibeDropdownItem href="#">Action</VibeDropdownItem>
    <VibeDropdownItem href="#">Another action</VibeDropdownItem>
    <VibeDropdownItem divider />
    <VibeDropdownItem href="#">Separated link</VibeDropdownItem>
  </VibeDropdown>
</template>
```

### With Headers

```vue
<template>
  <VibeDropdown id="dropdown2" text="Menu" variant="secondary">
    <VibeDropdownItem header>Header 1</VibeDropdownItem>
    <VibeDropdownItem href="#">Action</VibeDropdownItem>
    <VibeDropdownItem href="#">Another action</VibeDropdownItem>
    <VibeDropdownItem divider />
    <VibeDropdownItem header>Header 2</VibeDropdownItem>
    <VibeDropdownItem href="#">Something else</VibeDropdownItem>
  </VibeDropdown>
</template>
```

### Dropup

```vue
<template>
  <VibeDropdown id="dropup1" text="Dropup" direction="up">
    <VibeDropdownItem href="#">Action</VibeDropdownItem>
    <VibeDropdownItem href="#">Another action</VibeDropdownItem>
  </VibeDropdown>
</template>
```

### With Click Handlers

```vue
<script setup>
const handleAction = (action) => {
  console.log('Action:', action)
}
</script>

<template>
  <VibeDropdown id="dropdown3" text="Actions">
    <VibeDropdownItem @click="handleAction('edit')">Edit</VibeDropdownItem>
    <VibeDropdownItem @click="handleAction('copy')">Copy</VibeDropdownItem>
    <VibeDropdownItem @click="handleAction('delete')">Delete</VibeDropdownItem>
  </VibeDropdown>
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
