# Navbar Components

Responsive navigation header with support for branding, navigation, and collapsible content.

## VibeNavbar

Main navbar container.

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

### VibeNavbarToggle
Mobile collapse toggle button

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

### Basic Navbar (Shorthand Mode)

```vue
<template>
  <VibeNavbar variant="light">
    <VibeNavbarBrand href="#">Navbar</VibeNavbarBrand>
    <VibeNavbarToggle target="navbarNav" />
    <VibeCollapse id="navbarNav">
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

### Basic Navbar (Composable Mode)

```vue
<template>
  <VibeNavbar variant="light">
    <VibeNavbarBrand href="#">Navbar</VibeNavbarBrand>
    <VibeNavbarToggle target="navbarNav" />
    <VibeCollapse id="navbarNav">
      <VibeNavbarNav>
        <VibeNavItem active href="#">Home</VibeNavItem>
        <VibeNavItem href="#">Features</VibeNavItem>
        <VibeNavItem href="#">Pricing</VibeNavItem>
      </VibeNavbarNav>
    </VibeCollapse>
  </VibeNavbar>
</template>
```

### Colored Navbar

```vue
<template>
  <VibeNavbar variant="dark" class="bg-dark">
    <VibeNavbarBrand href="#">Dark Navbar</VibeNavbarBrand>
    <VibeNavbarNav>
      <VibeNavItem active href="#">Home</VibeNavItem>
      <VibeNavItem href="#">About</VibeNavItem>
    </VibeNavbarNav>
  </VibeNavbar>
</template>
```

### Fixed Position

```vue
<template>
  <VibeNavbar variant="light" position="fixed-top">
    <VibeNavbarBrand href="#">Fixed Top</VibeNavbarBrand>
  </VibeNavbar>
</template>
```

## Bootstrap CSS Classes

- `.navbar`
- `.navbar-expand-{breakpoint}`
- `.navbar-{variant}`
- `.bg-{variant}`
- `.fixed-top`, `.fixed-bottom`, `.sticky-top`
- `.navbar-brand`
- `.navbar-toggler`
- `.navbar-nav`
- `.container`, `.container-fluid`, `.container-{size}`
