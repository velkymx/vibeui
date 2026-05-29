# VibeUI

**The Vue 3 component library for people who already love Bootstrap.**

Bootstrap powers more of the web than any other design system — your team already knows its classes, its grid, its look. But the moment you bring it into Vue, the friction starts. Every modal, tooltip, dropdown, and collapse means hand-newing a Bootstrap JavaScript instance, wiring its events, generating unique IDs, linking ARIA attributes, and remembering to tear it all down on unmount. Miss a step and you ship memory leaks, broken keyboard focus, duplicate IDs, or detached-DOM crashes on route changes. So most teams either reach for a heavier framework that throws away their Bootstrap knowledge, or they reinvent these wrappers from scratch in every project.

VibeUI is the third option. It's 60+ reactive, strictly-typed Vue 3 components that wrap Bootstrap 5.3 — and quietly own every piece of plumbing Bootstrap leaves to you. The JavaScript lifecycle initializes, reconfigures, and disposes itself, with race-condition and unmount guards baked in. `v-model` works everywhere two-way binding belongs. Forms wire their own accessibility — IDs, labels, `aria-describedby`, help text, and validation feedback link automatically through a `VibeFormGroup` context, and dialogs return focus to their trigger on close. It's touch- and hybrid-aware out of the box, lazy-loads its heaviest parts (charts, the rich-text editor, Bootstrap's own JS) so you only ship what you use, and ships an interaction suite — drag/drop, sortable, resizable, slider, stepper, autocomplete, calendar, and dependency-free canvas charts — that fills the gap jQuery UI left behind.

You keep the Bootstrap you know. VibeUI handles the Vue you'd rather not write.

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@velkymx/vibeui)](https://www.npmjs.com/package/@velkymx/vibeui)

---

## What you get

* **Bootstrap JS, fully abstracted.** No manual `new bootstrap.Modal(...)`. Components initialize, reactively reconfigure, and dispose their own Bootstrap instances — with race-condition and unmount guards built in.
* **`v-model` everywhere it should be.** Modals, offcanvas, toasts, collapses, tabs, accordions, sliders, and every form control bind two-way out of the box.
* **Accessibility that wires itself.** `VibeFormGroup` auto-generates IDs and links `<label>`, `aria-describedby`, help text, and validation feedback. Modals and offcanvas return focus to the trigger on close (WCAG 2.4.3).
* **Strict TypeScript.** Typed props, typed emit payloads, and typed `provide`/`inject` keys — full editor autocomplete, no `any`.
* **Touch- and hybrid-aware.** Tooltips switch to tap on touch devices; modals and offcanvas honor the Android back button.
* **Lightweight by default.** A small core; charts, the WYSIWYG editor, and Bootstrap's JS are loaded on demand via dynamic import, so you only ship what you use.
* **Beyond Bootstrap.** A built-in interaction suite — drag/drop, sortable, resizable, slider, stepper, autocomplete, calendar, and canvas charts — fills the gap jQuery UI used to.

## Installation

```bash
npm install @velkymx/vibeui bootstrap
```

Optional peers, only if you use the features that need them:

```bash
npm install bootstrap-icons   # <VibeIcon>
npm install quill dompurify   # <VibeFormWysiwyg> (dompurify sanitizes editor HTML)
```

## Quick Setup

In your app entry (`main.ts` / `main.js`):

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import VibeUI from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'

createApp(App).use(VibeUI).mount('#app')
```

All components register globally after `app.use(VibeUI)`. Prefer explicit imports? They're tree-shakeable:

```typescript
import { VibeButton, VibeModal, VibeCard } from '@velkymx/vibeui'
```

> Bootstrap **CSS** is imported by you (one line above). Bootstrap **JS** is managed internally — do not import it yourself.

## A Taste

**Interactivity with zero setup:**

```vue
<template>
  <!-- Tooltip initializes itself; taps on touch, hovers on desktop -->
  <VibeTooltip text="I just work!">
    <VibeButton>Hover or Tap Me</VibeButton>
  </VibeTooltip>

  <!-- ...or as a directive -->
  <VibeButton v-vibe-tooltip="'Inline tooltip'">Save</VibeButton>

  <!-- v-model modal, hybrid-ready, focus-safe -->
  <VibeModal v-model="showModal" title="Hello!">
    Fully reactive, automated, and accessible.
  </VibeModal>
</template>
```

**Forms that wire their own accessibility:**

```vue
<script setup>
import { useForm, validators } from '@velkymx/vibeui'
const { fields, errors, validate, isDirty } = useForm({ name: '', email: '' })
</script>

<template>
  <!-- No id needed — label, control, and feedback are linked automatically -->
  <VibeFormGroup label="Email Address">
    <VibeFormInput v-model="fields.email" type="email" />
  </VibeFormGroup>

  <VibeInputGroup prepend="@">
    <VibeFormInput v-model="fields.name" noWrapper />
  </VibeInputGroup>
</template>
```

**Toasts from anywhere:**

```ts
import { useToast } from '@velkymx/vibeui'

const toast = useToast()
toast.success('Saved')
toast.error('Network error', { delay: 8000 })
```

Mount `<VibeToastHost />` once at your app root and dispatch from any component or composable.

## Components

60+ components covering all of Bootstrap 5.3, plus an interaction and data-viz suite.

### Layout

| Component | Description |
|-----------|-------------|
| `VibeContainer` | Responsive container with breakpoints |
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
| `VibeSkeleton` | [docs](./docs/components/core/skeleton.md) |
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
| `VibeDatePicker` | [docs](./docs/components/interactive/date-picker.md) |
| `VibeDraggable` | [docs](./docs/components/interactive/draggable.md) |
| `VibeDroppable` | [docs](./docs/components/interactive/draggable.md) |
| `VibeDropdown` | [docs](./docs/components/interactive/dropdown.md) |
| `VibeModal` | [docs](./docs/components/interactive/modal.md) |
| `VibeOffcanvas` | [docs](./docs/components/interactive/offcanvas.md) |
| `VibeResizable` | [docs](./docs/components/interactive/resizable.md) |
| `VibeSlider` | [docs](./docs/components/interactive/slider.md) |
| `VibeSortable` | [docs](./docs/components/interactive/sortable.md) |
| `VibeStepper` | [docs](./docs/components/interactive/stepper.md) |
| `VibeTabs` / `VibeTab` | [docs](./docs/components/interactive/tabs.md) |
| `VibeToast` / `VibeToastHost` | [component](./docs/components/interactive/toast.md), [service](./docs/composables/use-toast.md) |

### Tooltips & Popovers

| Component | Doc |
|-----------|-----|
| `VibePopover` | [docs](./docs/components/advanced/popover.md) |
| `VibeTooltip` | [docs](./docs/components/advanced/tooltip.md) |

### Data & Charts

| Component | Doc |
|-----------|-----|
| `VibeDataTable` | [docs](./docs/components/data/datatable.md) |
| `VibeProgress` | [docs](./docs/components/progress/progress.md) |
| `VibeChartBar` | [docs](./docs/components/charts/chart-bar.md) |
| `VibeChartLine` | [docs](./docs/components/charts/chart-line.md) |
| `VibeChartPie` | [docs](./docs/components/charts/chart-pie.md) |

> Charts are dependency-free, canvas-rendered, and loaded on demand — no Chart.js, no D3.

### Forms

| Component | Doc |
|-----------|-----|
| `VibeAutocomplete` | [docs](./docs/forms/autocomplete.md) |
| `VibeFileInput` | [docs](./docs/forms/file-input.md) |
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
| `useForm` | [docs](./docs/composables/use-form.md) |
| `useFormValidation` | [docs](./docs/forms/validation.md) |
| `usePosition` | [docs](./docs/composables/use-position.md) |
| `useToast` | [docs](./docs/composables/use-toast.md) |

### Directives

| Directive | Doc |
|-----------|-----|
| `v-vibe-tooltip` | [docs](./docs/directives/v-tooltip.md) |

### Utilities

| Topic | Doc |
|-------|-----|
| Position utility classes | [docs](./docs/utilities/position.md) |

## Documentation

Full API reference and examples live in the [`docs/`](./docs/README.md) directory. An LLM-optimized reference is available in [`llms.txt`](./llms.txt).

## License

[MIT](LICENSE)

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
