# Navbar Components

Responsive navigation header with support for branding, navigation, and collapsible content.

## VibeNavbar

Main navbar container. Provides reactive collapse state to child components via Vue's provide/inject.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant\|'dark'\|'light'` | `'light'` | Background color: maps to `bg-{variant}` |
| `theme` | `'dark'\|'light'` | auto | Color scheme applied via `data-bs-theme`. Defaults to `'dark'` when `variant='dark'`, `'light'` when `variant='light'`, otherwise unset |
| `expand` | `Boolean\|String` | `'lg'` | Breakpoint for collapse: `'sm'`, `'md'`, `'lg'`, `'xl'`, or `true` for always expanded |
| `container` | `Boolean\|String` | `true` | Container type: `true` for fluid, or `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `position` | `NavbarPosition` | `undefined` | Position: `'fixed-top'`, `'fixed-bottom'`, `'sticky-top'` |
| `tag` | `String` | `'nav'` | HTML tag to render |

## Sub-Components

### VibeNavbarBrand
Branding/logo section

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `String` | `undefined` | Link URL (renders as `<a>`) |
| `to` | `String\|Object` | `undefined` | Router link target (renders as `<router-link>`) |

### VibeNavbarToggle
Mobile collapse toggle button.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `String` | Required | The `id` of the `VibeCollapse` to toggle |
| `ariaLabel` | `String` | `'Toggle navigation'` | Accessible label for the button |

### VibeNavbarNav
Navigation links container. Supports regular links and dropdown items.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `String` | `'ul'` | HTML tag to render |
| `items` | `NavItem[]` | `undefined` | Array of nav items (data-driven mode) |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when a regular nav item is clicked |
| `dropdown-item-click` | `{ item, itemIndex, child, childIndex, event }` | Emitted when a dropdown child item is clicked |

## Usage

### Basic Navbar

```vue
<template>
  <VibeNavbar variant="light" expand="lg">
    <VibeNavbarBrand href="#">Navbar</VibeNavbarBrand>
    <VibeNavbarToggle target="navbarNav" />
    <VibeCollapse id="navbarNav" is-nav>
      <VibeNavbarNav :items="navItems" />
    </VibeCollapse>
  </VibeNavbar>
</template>

<script setup>
const navItems = [
  { text: 'Home', href: '#', active: true },
  { text: 'Features', href: '#' },
  { text: 'Pricing', href: '#' }
]
</script>
```

## Important Notes

**Automatic Synchronization:** `VibeNavbarToggle` is refactored to ensure that clicking it updates both Vue's internal state and the underlying Bootstrap `Collapse` instance simultaneously.

**Smooth Transitions:** `VibeCollapse` now utilizes Bootstrap's JavaScript engine by default, providing smooth sliding animations when toggled via the navbar.

**State Management:** Even when using Bootstrap JS for animations, the navbar remains fully reactive. You can still control the collapse state programmatically via the `VibeCollapse` `v-model`.

## Bootstrap CSS Classes

- `.navbar`
- `.navbar-expand-{breakpoint}`
- `.bg-{variant}`
- `data-bs-theme="dark|light"`
- `.navbar-brand`
- `.navbar-toggler`
- `.navbar-nav`
- `.navbar-collapse`
- `.nav-item`
- `.nav-link`
