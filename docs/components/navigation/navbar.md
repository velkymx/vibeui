# Navbar Components

Responsive navigation header with support for branding, navigation, and collapsible content.

## VibeNavbar

Main navbar container. Provides reactive collapse state to child components via Vue's provide/inject, so `VibeNavbarToggle` and `VibeCollapse` communicate through Vue reactivity rather than Bootstrap JS.

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
Mobile collapse toggle button. Must be used inside a `VibeNavbar` — toggles the target `VibeCollapse` via Vue reactivity (no Bootstrap JS required).

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

#### NavItem Interface

```typescript
interface NavItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  children?: DropdownItem[]  // presence triggers dropdown rendering
}
```

When `children` is provided, the item renders as a `.nav-item.dropdown` with a `.dropdown-toggle` nav-link and a `.dropdown-menu`. Bootstrap JS handles the toggle.

#### DropdownItem Interface

```typescript
interface DropdownItem {
  text?: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  divider?: boolean   // renders <hr class="dropdown-divider">
  header?: boolean    // renders <h6 class="dropdown-header">
}
```

#### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item` | `{ item, index }` | Custom rendering for a nav-link label |
| `dropdown-item` | `{ item, child, index, childIndex }` | Custom rendering for a dropdown item |

## Usage

### Basic Navbar

```vue
<template>
  <VibeNavbar variant="light">
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

### Dark Navbar (Bootstrap 5.3 color scheme)

```vue
<template>
  <!-- data-bs-theme="dark" is set automatically when variant="dark" -->
  <VibeNavbar variant="dark">
    <VibeNavbarBrand href="#">Dark Navbar</VibeNavbarBrand>
    <VibeNavbarNav :items="navItems" />
  </VibeNavbar>

  <!-- Explicit theme override: dark text on a primary background -->
  <VibeNavbar variant="primary" theme="light">
    <VibeNavbarBrand href="#">Light on Primary</VibeNavbarBrand>
  </VibeNavbar>
</template>
```

### Navbar with Dropdown Items

```vue
<template>
  <VibeNavbar variant="dark" expand="lg">
    <VibeNavbarBrand href="#">My App</VibeNavbarBrand>
    <VibeNavbarToggle target="main-nav" />
    <VibeCollapse id="main-nav" is-nav>
      <VibeNavbarNav :items="navItems" @dropdown-item-click="onDropdownClick" />
    </VibeCollapse>
  </VibeNavbar>
</template>

<script setup>
const navItems = [
  { text: 'Home', href: '#', active: true },
  {
    text: 'Products',
    children: [
      { text: 'Category A', href: '#cat-a' },
      { text: 'Category B', href: '#cat-b' },
      { divider: true },
      { text: 'All Products', href: '#all' }
    ]
  },
  { text: 'About', href: '#' }
]

const onDropdownClick = ({ child }) => {
  console.log('selected:', child.text)
}
</script>
```

### Conditional Slot Content

Use `v-if`/`v-else` inside `VibeCollapse` with `is-nav` to conditionally render navbar content based on reactive state (e.g. authentication):

```vue
<template>
  <VibeNavbar variant="dark" expand="lg">
    <VibeNavbarBrand href="#">My App</VibeNavbarBrand>
    <VibeNavbarToggle target="main-nav" />
    <VibeCollapse id="main-nav" is-nav>
      <VibeNavbarNav :items="navItems" />

      <VibeNavbarNav class="ms-auto">
        <template v-if="isAuthenticated">
          <li class="nav-item">
            <span class="nav-link">{{ user.name }}</span>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" @click.prevent="logout">Logout</a>
          </li>
        </template>
        <template v-else>
          <li class="nav-item">
            <router-link to="/login" class="nav-link">Login</router-link>
          </li>
        </template>
      </VibeNavbarNav>
    </VibeCollapse>
  </VibeNavbar>
</template>
```

### Fixed / Sticky Position

```vue
<template>
  <VibeNavbar variant="light" position="sticky-top">
    <VibeNavbarBrand href="#">Sticky Navbar</VibeNavbarBrand>
  </VibeNavbar>
</template>
```

## Important Notes

- Always add `is-nav` to `VibeCollapse` when used inside a navbar. This adds the `navbar-collapse` CSS class needed for Bootstrap's responsive behavior.
- `VibeNavbarToggle` communicates with `VibeCollapse` through Vue's provide/inject — no Bootstrap JS needed for the toggle behavior.
- Dropdown items (`children`) use Bootstrap JS (`data-bs-toggle="dropdown"`) for the open/close behavior — Bootstrap JS must be loaded.
- Bootstrap 5.3 replaced `navbar-dark`/`navbar-light` CSS classes with `data-bs-theme="dark|light"`. `VibeNavbar` sets `data-bs-theme` automatically based on `variant`, or you can override it with the `theme` prop.

## Bootstrap CSS Classes

- `.navbar`
- `.navbar-expand-{breakpoint}`
- `.bg-{variant}`
- `data-bs-theme="dark|light"` (attribute, not class)
- `.fixed-top`, `.fixed-bottom`, `.sticky-top`
- `.navbar-brand`
- `.navbar-toggler`
- `.navbar-nav`
- `.navbar-collapse`
- `.nav-item`, `.nav-item.dropdown`
- `.nav-link`, `.nav-link.dropdown-toggle`
- `.dropdown-menu`, `.dropdown-item`, `.dropdown-divider`, `.dropdown-header`
- `.container`, `.container-fluid`, `.container-{size}`
