# VibeUI Documentation

Complete documentation for VibeUI - A modern Vue 3 UI component library built with Bootstrap 5.3.

## Getting Started

VibeUI is designed to be simple and lightweight, providing Vue 3 components that wrap Bootstrap 5.3 functionality with a clean, intuitive API.

### Installation

```bash
npm install @velkymx/vibeui bootstrap
```

### Setup

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import VibeUI from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'

createApp(App).use(VibeUI).mount('#app')
```

### Bootstrap JavaScript

Some components require Bootstrap's JavaScript. Include it in your project:

```bash
npm install bootstrap
```

Then import and initialize where needed:

```javascript
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Or import specific components
import { Modal, Tooltip, Popover } from 'bootstrap'
```

## Components

### [Core Components](./components/core/)

Basic, essential components with no JavaScript dependencies:

- [VibeAlert](./components/core/alert.md) - Alert messages with variants
- [VibeBadge](./components/core/badge.md) - Badges and labels
- [VibeButton](./components/core/button.md) - Buttons with variants and sizes
- [VibeButtonGroup](./components/core/button-group.md) - Button groups
- [VibeCloseButton](./components/core/close-button.md) - Close button
- [VibeSpinner](./components/core/spinner.md) - Loading spinners
- [VibePlaceholder](./components/core/placeholder.md) - Placeholder loading states

### [Card Components](./components/card/)

Flexible content containers:

- [Card Components](./components/card/card.md) - VibeCard, VibeCardHeader, VibeCardBody, VibeCardFooter, VibeCardImg, VibeCardTitle, VibeCardText

### [Navigation Components](./components/navigation/)

Navigation and pagination components:

- [VibeBreadcrumb](./components/navigation/breadcrumb.md) - Breadcrumb navigation
- [VibeNav](./components/navigation/nav.md) - Navigation tabs and pills
- [VibeNavbar](./components/navigation/navbar.md) - Responsive navigation bar
- [VibePagination](./components/navigation/pagination.md) - Pagination controls

### [List Components](./components/list/)

Display lists of content:

- [VibeListGroup](./components/list/list-group.md) - Flexible list component

### [Progress Components](./components/progress/)

Progress indicators:

- [VibeProgress](./components/progress/progress.md) - Progress bars

### [Interactive Components](./components/interactive/)

Components requiring Bootstrap JavaScript:

- [VibeAccordion](./components/interactive/accordion.md) - Collapsible accordion
- [VibeCarousel](./components/interactive/carousel.md) - Image carousel
- [VibeCollapse](./components/interactive/collapse.md) - Collapsible content
- [VibeDropdown](./components/interactive/dropdown.md) - Dropdown menus
- [VibeModal](./components/interactive/modal.md) - Modal dialogs
- [VibeOffcanvas](./components/interactive/offcanvas.md) - Offcanvas sidebar
- [VibeToast](./components/interactive/toast.md) - Toast notifications

### [Advanced Components](./components/advanced/)

Advanced components requiring initialization:

- [VibeTooltip](./components/advanced/tooltip.md) - Contextual tooltips
- [VibePopover](./components/advanced/popover.md) - Rich popovers
- [VibeScrollspy](./components/advanced/scrollspy.md) - Scroll-based navigation

### [Data Components](./components/data/)

Components for displaying and managing data:

- [VibeDataTable](./components/data/datatable.md) - Powerful data table with search, sorting, and pagination

## Design Philosophy

VibeUI follows these key principles:

1. **Simplicity First** - Clean, intuitive API with minimal complexity
2. **Lightweight** - No Bootstrap JS bundled; uses CDN via data-bs-* attributes
3. **Consistent** - Same prop patterns across all components
4. **Flexible** - Class passthrough and slots for customization
5. **TypeScript** - Full type safety with comprehensive types

## Common Patterns

### Variants

Most components support color variants:

```vue
<VibeButton variant="primary">Primary</VibeButton>
<VibeButton variant="success">Success</VibeButton>
<VibeButton variant="danger">Danger</VibeButton>
```

Available variants: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`

### Sizes

Components that support sizing use a simple size prop:

```vue
<VibeButton size="sm">Small</VibeButton>
<VibeButton>Normal</VibeButton>
<VibeButton size="lg">Large</VibeButton>
```

### v-model Support

Components with visibility state support v-model:

```vue
<script setup>
import { ref } from 'vue'
const showAlert = ref(true)
</script>

<template>
  <VibeAlert v-model="showAlert" dismissable>
    This alert can be dismissed
  </VibeAlert>
</template>
```

### Class Passthrough

All components support native class attribute merging:

```vue
<VibeButton variant="primary" class="my-custom-class">
  Button with custom classes
</VibeButton>
```

### Slots

Components use slots for flexible content:

```vue
<VibeCard>
  <template #header>
    Custom Header
  </template>

  <VibeCardBody>
    Main content
  </VibeCardBody>

  <template #footer>
    Custom Footer
  </template>
</VibeCard>
```

## TypeScript Support

VibeUI is fully typed. Import types as needed:

```typescript
import type { Variant, Size, Placement } from '@velkymx/vibeui'
```

Available types:
- `Variant` - Color variants
- `Size` - Component sizes
- `Placement` - Tooltip/popover placement
- `ButtonType` - Button types
- `Direction` - Dropdown directions
- And more...

## Contributing

Contributions are welcome! Please visit the [GitHub repository](https://github.com/velkymx/vibeui) to report issues or submit pull requests.

## License

MIT License - See LICENSE file for details.
