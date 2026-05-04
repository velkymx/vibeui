# VibeUI

A modern Vue 3 UI component library built with Bootstrap 5, designed to simplify your development and enhance your application's aesthetic.

## Features

* **Vue 3 Composition API**: Built from the ground up using modern, reactive Vue.js practices.
* **Full Bootstrap 5 Integration**: Automatically manages Bootstrap's JavaScript lifecycle, including dynamic initialization, reactive configuration, and memory cleanup.
* **Data-Driven & Reactive**: Components are fully reactive with `v-model` support and automatic updates when props or data change.
* **Smart Form Intelligence**: Automated ID generation and accessibility linking via `VibeFormGroup` context.
* **Zero-Boilerplate**: Components handle their own IDs, Teleportation, and Bootstrap instances internally.
* **TypeScript Support**: Fully typed components for a great developer experience.
* **Accessibility First**: Automatic ARIA attribute management and focus trapping.

## Installation

Install via npm:

```bash
npm install @velkymx/vibeui bootstrap
```

Optionally, install Bootstrap Icons or Quill for enhanced features:

```bash
npm install bootstrap-icons quill
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

## What's New in v0.9

A big release driven by real-app migration feedback and a jQuery UI parity push.

**New components**
- `VibeFileInput` — file picker with drag-drop, accept enforcement, size limit
- `VibeSkeleton` — text / rect / circle / card loading placeholders with shimmer
- `VibeDatePicker` — calendar popover with single + range mode, keyboard nav
- `VibeAutocomplete` — search-as-you-type, sync or async source, debounced
- `VibeTabs` / `VibeTab` — tab container with content switching, lazy mode
- `VibeStepper` — multi-step wizard with sync/async guards
- `VibeSortable` — drag-to-reorder list
- `VibeDraggable` / `VibeDroppable` — kanban / builder primitives
- `VibeResizable` — corner / edge handle resizing with aspect / grid
- `VibeSlider` — single + range slider with handle swap, track click, keyboard
- `VibeToastHost` — host component for the new toast service

**New composables / directive**
- `useForm` — multi-field forms with reactive `fields`, `errors`, `touched`
- `useToast` — `toast.success() / error() / warn() / info() / dismiss()`
- `usePosition` — floating-ui-backed anchor positioning
- `v-vibe-tooltip` — inline tooltip directive

**API improvements**
- `VibeAlert`: rich slot content; `dismissible` (correctly spelled) alias
- `VibeButton`: `variant="link"`
- `VibeDataTable`: generic columns (`DataTableColumn<MyRow>`)
- `VibeFormSelect`: typed primitive option values (`null`, `undefined`, `boolean`)
- `VibeFormWysiwyg`: toolbar string presets (`'minimal' | 'standard' | 'full'`)

**Dependency**: `@floating-ui/dom` added (used by `usePosition`).

## Advanced Interactivity

VibeUI fully abstracts Bootstrap's JavaScript — you don't manually initialize tooltips, modals, or collapses. Touch devices get sensible defaults out of the box.

```vue
<template>
  <div>
    <!-- Automatic tooltip initialization with touch optimization -->
    <VibeTooltip text="I just work!">
      <VibeButton>Hover or Tap Me</VibeButton>
    </VibeTooltip>

    <!-- Or as a directive (v0.9) -->
    <VibeButton v-vibe-tooltip="'Inline tooltip'">Save</VibeButton>

    <!-- Full v-model support for Modals with Android back button support -->
    <VibeModal v-model="showModal" title="Hello!">
      Fully reactive, automated, and hybrid-ready.
    </VibeModal>
  </div>
</template>
```

## Smart Forms

VibeUI handles accessibility and IDs for you.

```vue
<template>
  <!-- No IDs required! Labels are automatically linked -->
  <VibeFormGroup label="Email Address">
    <VibeFormInput v-model="email" type="email" />
  </VibeFormGroup>

  <VibeInputGroup prepend="@">
    <VibeFormInput v-model="username" noWrapper />
  </VibeInputGroup>

  <!-- New in v0.9: useForm composable for multi-field state -->
  <script setup>
  import { useForm, validators } from '@velkymx/vibeui'
  const { fields, errors, validate, isDirty } = useForm({ name: '', email: '' })
  </script>
</template>
```

## Toasts (v0.9 service form)

```ts
import { useToast } from '@velkymx/vibeui'

const toast = useToast()
toast.success('Saved')
toast.error('Network error', { delay: 8000 })
```

Mount `<VibeToastHost />` once at the root and dispatch from anywhere.

## Components

VibeUI ships every major Bootstrap 5.3 component plus an interaction suite (drag/drop, sortable, resizable, slider, calendar) that fills the gap left by jQuery UI.

### Layout

| Component | Description |
|-----------|-------------|
| `VibeContainer` | Bootstrap container w/ breakpoints |
| `VibeRow` | Grid row |
| `VibeCol` | Grid column |

### Core

| Component | Doc |
|-----------|-----|
| `VibeAlert` | [docs](./docs/components/core/alert.md) |
| `VibeBadge` | [docs](./docs/components/core/badge.md) |
| `VibeButton` | [docs](./docs/components/core/button.md) |
| `VibeButtonGroup` | [docs](./docs/components/core/button-group.md) |
| `VibeCloseButton` | [docs](./docs/components/core/close-button.md) |
| `VibeIcon` | Bootstrap-icons wrapper |
| `VibeLink` | [docs](./docs/components/core/link.md) |
| `VibePlaceholder` | [docs](./docs/components/core/placeholder.md) |
| `VibeSkeleton` *(v0.9)* | [docs](./docs/components/core/skeleton.md) |
| `VibeSpinner` | [docs](./docs/components/core/spinner.md) |

### Navigation

| Component | Doc |
|-----------|-----|
| `VibeBreadcrumb` | [docs](./docs/components/navigation/breadcrumb.md) |
| `VibeNav` | [docs](./docs/components/navigation/nav.md) |
| `VibeNavbar` (+ `Brand`, `Toggle`, `Nav`) | [docs](./docs/components/navigation/navbar.md) |
| `VibePagination` | [docs](./docs/components/navigation/pagination.md) |
| `VibeScrollspy` | [docs](./docs/components/advanced/scrollspy.md) |

### Layout containers

| Component | Doc |
|-----------|-----|
| `VibeCard` | [docs](./docs/components/card/card.md) |
| `VibeListGroup` | [docs](./docs/components/list/list-group.md) |

### Interactive

| Component | Doc |
|-----------|-----|
| `VibeAccordion` | [docs](./docs/components/interactive/accordion.md) |
| `VibeCarousel` | [docs](./docs/components/interactive/carousel.md) |
| `VibeCollapse` | [docs](./docs/components/interactive/collapse.md) |
| `VibeDatePicker` *(v0.9)* | [docs](./docs/components/interactive/date-picker.md) |
| `VibeDraggable` *(v0.9)* | [docs](./docs/components/interactive/draggable.md) |
| `VibeDroppable` *(v0.9)* | [docs](./docs/components/interactive/draggable.md) |
| `VibeDropdown` | [docs](./docs/components/interactive/dropdown.md) |
| `VibeModal` | [docs](./docs/components/interactive/modal.md) |
| `VibeOffcanvas` | [docs](./docs/components/interactive/offcanvas.md) |
| `VibeResizable` *(v0.9)* | [docs](./docs/components/interactive/resizable.md) |
| `VibeSlider` *(v0.9)* | [docs](./docs/components/interactive/slider.md) |
| `VibeSortable` *(v0.9)* | [docs](./docs/components/interactive/sortable.md) |
| `VibeStepper` *(v0.9)* | [docs](./docs/components/interactive/stepper.md) |
| `VibeTabs` / `VibeTab` *(v0.9)* | [docs](./docs/components/interactive/tabs.md) |
| `VibeToast` / `VibeToastHost` *(v0.9)* | [component](./docs/components/interactive/toast.md), [service](./docs/composables/use-toast.md) |

### Tooltips & Popovers

| Component | Doc |
|-----------|-----|
| `VibePopover` | [docs](./docs/components/advanced/popover.md) |
| `VibeTooltip` | [docs](./docs/components/advanced/tooltip.md) |

### Data

| Component | Doc |
|-----------|-----|
| `VibeDataTable` | [docs](./docs/components/data/datatable.md) |
| `VibeProgress` | [docs](./docs/components/progress/progress.md) |

### Forms

| Component | Doc |
|-----------|-----|
| `VibeAutocomplete` *(v0.9)* | [docs](./docs/forms/autocomplete.md) |
| `VibeFileInput` *(v0.9)* | [docs](./docs/forms/file-input.md) |
| `VibeFormCheckbox` | [docs](./docs/forms/form-checkbox.md) |
| `VibeFormDatepicker` (native) | [docs](./docs/forms/form-datepicker.md) |
| `VibeFormGroup` | [docs](./docs/forms/form-group.md) |
| `VibeFormInput` | [docs](./docs/forms/form-input.md) |
| `VibeFormRadio` | [docs](./docs/forms/form-radio.md) |
| `VibeFormSelect` | [docs](./docs/forms/form-select.md) |
| `VibeFormSpinbutton` | [docs](./docs/forms/form-spinbutton.md) |
| `VibeFormSwitch` | [docs](./docs/forms/form-switch.md) |
| `VibeFormTextarea` | [docs](./docs/forms/form-textarea.md) |
| `VibeFormWysiwyg` | [docs](./docs/forms/form-wysiwyg.md) |
| `VibeInputGroup` | [docs](./docs/forms/input-group.md) |
| Validation rules | [docs](./docs/forms/validation.md) |

### Composables

| Composable | Doc |
|------------|-----|
| `useBackButton` | [docs](./docs/composables/back-button.md) |
| `useBreakpoints` | [docs](./docs/composables/breakpoints.md) |
| `useColorMode` | [docs](./docs/composables/color-mode.md) |
| `useForm` *(v0.9)* | [docs](./docs/composables/use-form.md) |
| `useFormValidation` | [docs](./docs/forms/validation.md) |
| `usePosition` *(v0.9)* | [docs](./docs/composables/use-position.md) |
| `useToast` *(v0.9)* | [docs](./docs/composables/use-toast.md) |

### Directives

| Directive | Doc |
|-----------|-----|
| `v-vibe-tooltip` *(v0.9)* | [docs](./docs/directives/v-tooltip.md) |

### Utilities

| Topic | Doc |
|-------|-----|
| Position utility classes | [docs](./docs/utilities/position.md) |

## Full Documentation

For detailed documentation and examples, visit our [Docs](./docs/README.md).

## License

[MIT License](LICENSE) 

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
