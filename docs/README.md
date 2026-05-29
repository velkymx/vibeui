# VibeUI Documentation

Complete documentation for VibeUI - A modern Vue 3 UI component library built with Bootstrap 5.3.

## Getting Started

VibeUI is designed to be simple and lightweight, providing Vue 3 components that wrap Bootstrap 5.3 functionality with a clean, intuitive API.

> **New here?** See the [Starter Template](./getting-started/starter-template.md) for a complete, copy-pasteable minimal app.

### Installation

```bash
npm install @velkymx/vibeui bootstrap
```

#### Optional peer dependencies

Install these only if you use the components that need them:

- `bootstrap-icons` — required by `VibeIcon`.
- `quill` + `dompurify` — required by `VibeFormWysiwyg`.

```bash
npm install bootstrap-icons         # for VibeIcon
npm install quill dompurify         # for VibeFormWysiwyg
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

**Do NOT import Bootstrap JS — VibeUI manages it.** VibeUI is mobile-optimized and fully abstracts Bootstrap's JavaScript. You do not need to manually import or initialize Bootstrap JS for VibeUI components; importing it yourself can cause duplicate instances and event conflicts.

The library handles:
- **Dynamic Initialization:** Components initialize their own JS logic on mount.
- **Reactive Configuration:** Re-initializes automatically when props like `placement` or `delay` change.
- **Memory Cleanup:** Automatically disposes of Bootstrap instances on unmount.
- **State Integrity:** Synchronizes internal Vue state with native Bootstrap events.

## Components

### [Layout Components](./components/layout/)
- [VibeContainer](./components/layout/container.md)
- [VibeRow](./components/layout/row.md)
- [VibeCol](./components/layout/col.md)

### [Core Components](./components/core/)
- [VibeAlert](./components/core/alert.md)
- [VibeBadge](./components/core/badge.md)
- [VibeButton](./components/core/button.md)
- [VibeButtonGroup](./components/core/button-group.md)
- [VibeCloseButton](./components/core/close-button.md)
- [VibeLink](./components/core/link.md)
- [VibePlaceholder](./components/core/placeholder.md)
- [VibeSkeleton](./components/core/skeleton.md)
- [VibeSpinner](./components/core/spinner.md)

### [Interactive Components](./components/interactive/)
- [VibeAccordion](./components/interactive/accordion.md)
- [VibeCarousel](./components/interactive/carousel.md)
- [VibeCollapse](./components/interactive/collapse.md)
- [VibeDatePicker](./components/interactive/date-picker.md)
- [VibeDraggable / VibeDroppable](./components/interactive/draggable.md)
- [VibeDropdown](./components/interactive/dropdown.md)
- [VibeModal](./components/interactive/modal.md)
- [VibeOffcanvas](./components/interactive/offcanvas.md)
- [VibeResizable](./components/interactive/resizable.md)
- [VibeSlider](./components/interactive/slider.md)
- [VibeSortable](./components/interactive/sortable.md)
- [VibeStepper](./components/interactive/stepper.md)
- [VibeTabs / VibeTab](./components/interactive/tabs.md)
- [VibeToast](./components/interactive/toast.md)

### [Advanced Components](./components/advanced/)
- [VibePopover](./components/advanced/popover.md)
- [VibeScrollspy](./components/advanced/scrollspy.md)
- [VibeTooltip](./components/advanced/tooltip.md)

### [Card](./components/card/)
- [VibeCard](./components/card/card.md)

### [List](./components/list/)
- [VibeListGroup](./components/list/list-group.md)

### [Navigation](./components/navigation/)
- [VibeBreadcrumb](./components/navigation/breadcrumb.md)
- [VibeNav](./components/navigation/nav.md)
- [VibeNavbar](./components/navigation/navbar.md)
- [VibePagination](./components/navigation/pagination.md)

### [Data Components](./components/data/)
- [VibeDataTable](./components/data/datatable.md)

### [Charts](./components/charts/)
- [VibeChartBar](./components/charts/chart-bar.md)
- [VibeChartLine](./components/charts/chart-line.md)
- [VibeChartPie](./components/charts/chart-pie.md)

### [Progress](./components/progress/)
- [VibeProgress](./components/progress/progress.md)

### [Form Components](./forms/)
- [VibeAutocomplete](./forms/autocomplete.md)
- [VibeFileInput](./forms/file-input.md)
- [VibeFormCheckbox](./forms/form-checkbox.md)
- [VibeFormDatepicker](./forms/form-datepicker.md) (native input)
- [VibeFormGroup](./forms/form-group.md) - Automated layout & accessibility
- [VibeFormInput](./forms/form-input.md)
- [VibeFormRadio](./forms/form-radio.md)
- [VibeFormSelect](./forms/form-select.md)
- [VibeFormSpinbutton](./forms/form-spinbutton.md)
- [VibeFormSwitch](./forms/form-switch.md)
- [VibeFormTextarea](./forms/form-textarea.md)
- [VibeFormWysiwyg](./forms/form-wysiwyg.md)
- [VibeInputGroup](./forms/input-group.md)
- [Validation rules](./forms/validation.md)

## Composables

Standalone utilities that can be used independently of any component.

- [useBackButton](./composables/back-button.md) - Android hardware back button handling
- [useBreakpoints](./composables/breakpoints.md) - Programmatic breakpoint detection
- [useColorMode](./composables/color-mode.md) - Bootstrap light/dark/auto color modes
- [useForm](./composables/use-form.md) - Multi-field form state with validation
- [usePosition](./composables/use-position.md) - Floating-UI based anchor positioning
- [useToast](./composables/use-toast.md) - Global toast service

## Directives

- [v-vibe-tooltip](./directives/v-tooltip.md) - Inline tooltip directive

## Utilities

- [Position utility classes](./utilities/position.md) - Bootstrap position-* / top-* / translate-middle reference

## Versioning & Stability

- [Versioning & Stability Policy](./versioning.md) - SemVer commitment, what's covered by the public API, deprecation and peer-dependency policy

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

### Instance Exposure (escape hatch)

The underlying Bootstrap instance is exposed as `_unsafe_bsInstance` for rare cases the props/`v-model` API doesn't cover.

> **This is an escape hatch, not part of the stable API.** Calling Bootstrap lifecycle methods directly will desync VibeUI's internal state and can break the component. The `_unsafe_` prefix is intentional — prefer props and `v-model` whenever possible.

```vue
<template>
  <VibeModal ref="myModal" />
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
const modal = useTemplateRef('myModal')

onMounted(() => {
  // Escape hatch — only when no prop/v-model covers your case
  modal.value?._unsafe_bsInstance?.handleUpdate()
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
