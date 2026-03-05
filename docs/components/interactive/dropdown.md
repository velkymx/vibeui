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

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `button` | - | Custom button content |
| `item` | `{ item, index }` | Custom item rendering |
| `header` | `{ item, index }` | Custom header rendering |

## Usage

### Programmatic Control

```vue
<template>
  <div>
    <VibeButton @click="$refs.myDropdown.toggle()">External Toggle</VibeButton>
    
    <VibeDropdown
      ref="myDropdown"
      text="Dropdown Menu"
      :items="dropdownItems"
    />
  </div>
</template>
```

### Basic Dropdown

```vue
<template>
  <VibeDropdown
    text="Dropdown Menu"
    :items="dropdownItems"
  />
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Dropdown functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Programmatic Methods:** You can call `show()`, `hide()`, and `toggle()` on the component instance via template refs.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

## Bootstrap CSS Classes

- `.dropdown`, `.dropup`, `.dropend`, `.dropstart`
- `.dropdown-toggle`
- `.dropdown-menu`
- `.dropdown-item`
