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
import VibeUI, { useColorMode } from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'

// Restore saved color mode preference before mounting
const { initColorMode } = useColorMode()
initColorMode()

createApp(App).use(VibeUI).mount('#app')
```

### Bootstrap JavaScript

**VibeUI v0.6.0+ fully abstracts Bootstrap's JavaScript.** You do not need to manually import or initialize Bootstrap JS for VibeUI components. 

The library handles:
- **Dynamic Initialization:** Components initialize their own JS logic on mount.
- **Reactive Configuration:** Re-initializes automatically when props like `placement` or `delay` change.
- **Memory Cleanup:** Automatically disposes of Bootstrap instances on unmount.
- **State Integrity:** Synchronizes internal Vue state with native Bootstrap events.

## Components

### [Core Components](./components/core/)
- [VibeAlert](./components/core/alert.md)
- [VibeBadge](./components/core/badge.md)
- [VibeButton](./components/core/button.md)
- [VibeButtonGroup](./components/core/button-group.md)
- [VibeCloseButton](./components/core/close-button.md)
- [VibeSpinner](./components/core/spinner.md)
- [VibePlaceholder](./components/core/placeholder.md)

### [Interactive Components](./components/interactive/)
- [VibeAccordion](./components/interactive/accordion.md)
- [VibeCarousel](./components/interactive/carousel.md)
- [VibeCollapse](./components/interactive/collapse.md)
- [VibeDropdown](./components/interactive/dropdown.md)
- [VibeModal](./components/interactive/modal.md)
- [VibeOffcanvas](./components/interactive/offcanvas.md)
- [VibeToast](./components/interactive/toast.md)

### [Advanced Components](./components/advanced/)
- [VibeTooltip](./components/advanced/tooltip.md)
- [VibePopover](./components/advanced/popover.md)
- [VibeScrollspy](./components/advanced/scrollspy.md)

### [Data Components](./components/data/)
- [VibeDataTable](./components/data/datatable.md)

### [Form Components](./forms/)
- [VibeFormGroup](./forms/form-group.md) - Automated layout & accessibility
- [VibeFormInput](./forms/form-input.md)
- [VibeFormSelect](./forms/form-select.md)
- [VibeFormWysiwyg](./forms/form-wysiwyg.md)

## Composables

Standalone utilities that can be used independently of any component.

- [useColorMode](./composables/color-mode.md) - Manage Bootstrap light/dark/auto color modes
- `useBreakpoints` - Programmatic breakpoint detection (xs, sm, md, lg, xl, xxl)
- `useBackButton` - Handle Android hardware back button in hybrid mobile apps

## Design Philosophy

1. **Full Abstraction** - No "reach-around" required; the library manages the framework engine.
2. **Zero-Boilerplate** - Automatic IDs, Teleportation, and state syncing.
3. **Smart Forms** - Context-aware form groups automate accessibility.
4. **TypeScript First** - Comprehensive type definitions for all props and events.

## Common Patterns

### v-model Support
Most interactive and form components support `v-model` for two-way state synchronization.

```vue
<VibeModal v-model="show" title="Hello" />
```

### Instance Exposure
Advanced users can access the underlying Bootstrap instance via template refs:

```vue
<template>
  <VibeModal ref="myModal" />
</template>

<script setup>
import { useTemplateRef, onMounted } from 'vue'
const modal = useTemplateRef('myModal')

onMounted(() => {
  // Access native Bootstrap methods
  modal.value.bsInstance.handleUpdate()
})
</script>
```

## Mobile & Hybrid App Support

VibeUI is optimized for mobile-first development and hybrid environments like **Capacitor**.

### Programmatic Breakpoints
Use the `useBreakpoints` composable to adapt your UI based on the viewport size.

```javascript
import { useBreakpoints } from '@velkymx/vibeui'
const { isMobile, isTablet, isLg } = useBreakpoints()
```

### Safe Areas
Components like `VibeNavbar`, `VibeOffcanvas`, and `VibeModal` automatically respect device safe areas (notches) when your app is configured with `viewport-fit=cover`.

### Hybrid Navigation
Use `useBackButton` to ensure Android hardware back button events correctly close active UI layers like modals and sidebars.

```javascript
import { useBackButton } from '@velkymx/vibeui'
// Registered automatically inside VibeModal and VibeOffcanvas
```

## Contributing
...
Contributions are welcome! Please visit the [GitHub repository](https://github.com/velkymx/vibeui) to report issues or submit pull requests.

## License

MIT License - See LICENSE file for details.
