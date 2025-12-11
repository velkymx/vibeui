# VibeUI

A modern Vue 3 UI component library built with Bootstrap 5, designed to simplify your development and enhance your application's aesthetic.

## Features

* **Vue 3 Composition API**: Built from the ground up using modern, reactive Vue.js practices.
* **Bootstrap 5 Integration**: Directly utilizes Bootstrap 5 CSS for consistency, without additional styling overhead.
* **Dual-Mode Components**: Use shorthand props for quick setup or composable slots for full control.
* **Lightweight & Modular**: Import only what you need, keeping your bundle small.
* **TypeScript Support**: Fully typed components for a great developer experience.
* **Accessibility First**: Components crafted with accessibility and usability in mind.

## Installation

Install via npm:

```bash
npm install @velkymx/vibeui
```

Make sure you also install Bootstrap:

```bash
npm install bootstrap
```

## Quick Setup

In your Vue app's entry file (`main.ts` or `main.js`):

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import VibeUI from '@velkymx/vibeui';
import 'bootstrap/dist/css/bootstrap.min.css';

createApp(App).use(VibeUI).mount('#app');
```

## Basic Usage

Here's a quick example of the `VibeAlert` component:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const showAlert = ref(true);
</script>

<template>
  <VibeAlert variant="success" dismissable v-model="showAlert">
    Welcome to VibeUI!
  </VibeAlert>
</template>
```

## Dual-Mode Components

Many VibeUI components support two usage modes:

### Shorthand Mode (Array-Based Props)

Perfect for quickly building UIs with data arrays:

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems" />
  <VibeNav tabs :items="navItems" />
  <VibeDropdown id="menu" text="Menu" :items="dropdownItems" />
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', href: '/' },
  { text: 'Products', href: '/products' },
  { text: 'Details', active: true }
]

const navItems = [
  { text: 'Home', href: '#', active: true },
  { text: 'Features', href: '#' },
  { text: 'Pricing', href: '#' }
]

const dropdownItems = [
  { text: 'Action', href: '#' },
  { text: 'Another action', href: '#' },
  { divider: true },
  { text: 'Separated link', href: '#' }
]
</script>
```

### Composable Mode (Slot-Based)

For maximum flexibility and custom content:

```vue
<template>
  <VibeBreadcrumb>
    <VibeBreadcrumbItem href="/">Home</VibeBreadcrumbItem>
    <VibeBreadcrumbItem href="/products">Products</VibeBreadcrumbItem>
    <VibeBreadcrumbItem active>Details</VibeBreadcrumbItem>
  </VibeBreadcrumb>

  <VibeNav tabs>
    <VibeNavItem active href="#">Home</VibeNavItem>
    <VibeNavItem href="#">Features</VibeNavItem>
    <VibeNavItem href="#">Pricing</VibeNavItem>
  </VibeNav>

  <VibeDropdown id="menu" text="Menu">
    <VibeDropdownItem href="#">Action</VibeDropdownItem>
    <VibeDropdownItem href="#">Another action</VibeDropdownItem>
    <VibeDropdownItem divider />
    <VibeDropdownItem href="#">Separated link</VibeDropdownItem>
  </VibeDropdown>
</template>
```

Components with dual-mode support include: `VibeBreadcrumb`, `VibeNav`, `VibeNavbarNav`, `VibePagination`, `VibeListGroup`, `VibeAccordion`, `VibeDropdown`, and `VibeCarousel`.

## Components

VibeUI includes all major Bootstrap 5.3 components:

### Core Components
* **VibeAlert** - Alert messages with variants and dismissible option
* **VibeBadge** - Badges and labels with pill option
* **VibeButton** - Buttons with variants, sizes, and outline style
* **VibeButtonGroup** - Button groups with sizing and vertical layout
* **VibeCloseButton** - Close button with white variant
* **VibeSpinner** - Loading spinners (border and grow types)
* **VibePlaceholder** - Placeholder loading states with animations

### Card Components
* **VibeCard** - Card container with variant styling
* **VibeCardHeader** - Card header section
* **VibeCardBody** - Card body section
* **VibeCardFooter** - Card footer section
* **VibeCardImg** - Card images (top, bottom, or overlay)
* **VibeCardTitle** - Card title heading
* **VibeCardText** - Card text paragraph

### Navigation Components
* **VibeBreadcrumb** - Breadcrumb navigation container
* **VibeBreadcrumbItem** - Individual breadcrumb items
* **VibeNav** - Navigation tabs and pills
* **VibeNavItem** - Navigation items with active state
* **VibeNavbar** - Responsive navbar with variants
* **VibeNavbarBrand** - Navbar branding section
* **VibeNavbarToggle** - Navbar mobile toggle button
* **VibeNavbarNav** - Navbar navigation links container
* **VibePagination** - Pagination container
* **VibePaginationItem** - Individual pagination items

### List Components
* **VibeListGroup** - List group container with flush and horizontal options
* **VibeListGroupItem** - List items with variants and active state

### Progress Components
* **VibeProgress** - Progress bar container
* **VibeProgressBar** - Progress bar with variants, striped, and animated styles

### Interactive Components
* **VibeAccordion** - Accordion container with flush option
* **VibeAccordionItem** - Collapsible accordion items
* **VibeCollapse** - Collapse component for showing/hiding content
* **VibeDropdown** - Dropdown menus with variants and directions
* **VibeDropdownItem** - Dropdown menu items, dividers, and headers
* **VibeModal** - Modal dialogs with sizes and positions
* **VibeOffcanvas** - Offcanvas sidebars with placement options
* **VibeToast** - Toast notifications with autohide
* **VibeCarousel** - Image carousels with controls and indicators
* **VibeCarouselSlide** - Individual carousel slides

### Advanced Components
* **VibeTooltip** - Tooltips with placement options (requires Bootstrap JS)
* **VibePopover** - Popovers with title and content (requires Bootstrap JS)
* **VibeScrollspy** - Scrollspy for navigation highlighting

### Data Components
* **VibeDataTable** - Powerful data table with search, sorting, and pagination

## Contributing

Pull requests and contributions are very welcome! Please fork the repo, create a branch for your feature, and submit a PR.

## License

[MIT License](LICENSE) 

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
