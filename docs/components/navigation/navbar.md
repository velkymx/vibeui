# Navbar Components

Responsive navigation header with support for branding, navigation, and collapsible content.

## VibeNavbar

Main navbar container. Provides reactive collapse state to child components via Vue's provide/inject, so `VibeNavbarToggle` and `VibeCollapse` communicate through Vue reactivity rather than Bootstrap JS.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant\|'dark'\|'light'` | `'light'` | Color scheme |
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
Navigation links container

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
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

### Colored Navbar

```vue
<template>
  <VibeNavbar variant="dark">
    <VibeNavbarBrand href="#">Dark Navbar</VibeNavbarBrand>
    <VibeNavbarNav :items="navItems" />
  </VibeNavbar>
</template>

<script setup>
const navItems = [
  { text: 'Home', href: '#', active: true },
  { text: 'About', href: '#' }
]
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

- Always add `is-nav` to `VibeCollapse` when used inside a navbar. This adds the `navbar-collapse` CSS class needed for Bootstrap's responsive behavior (e.g. `display: flex` above the expand breakpoint).
- `VibeNavbarToggle` communicates with `VibeCollapse` through Vue's provide/inject — no Bootstrap JS is needed for the toggle behavior.
- Slot content inside `VibeCollapse is-nav` is fully reactive. `v-if`, `v-for`, computed properties, and other reactive patterns work as expected.

## Bootstrap CSS Classes

- `.navbar`
- `.navbar-expand-{breakpoint}`
- `.navbar-{variant}`
- `.bg-{variant}`
- `.fixed-top`, `.fixed-bottom`, `.sticky-top`
- `.navbar-brand`
- `.navbar-toggler`
- `.navbar-nav`
- `.navbar-collapse`
- `.container`, `.container-fluid`, `.container-{size}`
