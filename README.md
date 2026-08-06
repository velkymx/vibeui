<div align="center"><img src="https://github.com/velkymx/vibeui/blob/1.0-main/vibeui.png?raw=true">

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@velkymx/vibeui)](https://www.npmjs.com/package/@velkymx/vibeui)
[![CI](https://github.com/velkymx/vibeui/actions/workflows/ci.yml/badge.svg)](https://github.com/velkymx/vibeui/actions/workflows/ci.yml)

</div>

# About VibeUI

**The Vue 3 component library for people who already love Bootstrap.**

> **🤖 Building with an AI assistant?** Point it at [`llms.txt`](./llms.txt) (quick-start guardrails + a link to every doc) and [`docs/`](https://github.com/velkymx/vibeui/blob/main/docs/README.md). Every component's props, events, and slots are documented — **don't let it guess props or reverse-engineer from `dist/`.** Quick reminders: data-driven components use `:items` / `:bars` / `:options`, visibility uses `v-model`, outline buttons use the `outline` prop, and granular tags like `<vibe-card-body>` / `<vibe-nav-item>` do **not** exist (use slots). Both `llms.txt` and the `docs/` pages ship inside the npm package — the links are absolute so they also resolve from npmjs.com.





Bootstrap components in Vue are painful. Every modal, tooltip, dropdown, and collapse needs manual JS instantiation, event wiring, unique ID generation, ARIA linking, and teardown on unmount. Miss one step and you ship memory leaks, broken focus, duplicate IDs, or detached-DOM crashes.

VibeUI handles all of it. 60+ strictly-typed Vue 3 components that wrap Bootstrap 5.3 - and quietly own every piece of plumbing:
- JS lifecycle (init, reconfigure, dispose) with race-condition and unmount guards
- `v-model` on every interactive component
- Auto-generated IDs, labels, and `aria-describedby` via `VibeFormGroup`
- Focus return to trigger on modal/offcanvas close (WCAG 2.4.3)
- Touch/hybrid detection for tooltips, modals, and Android back button
- Lazy-loaded heavy dependencies (charts, WYSIWYG editor, Bootstrap JS)

Plus an interaction suite - drag/drop, sortable, resizable, slider, stepper, autocomplete, calendar, and canvas charts - filling the gap jQuery UI left behind.

You keep the Bootstrap you know. VibeUI handles the Vue you'd rather not write.

> **Coming from BootstrapVue?** If you built on Bootstrap + Vue 2, VibeUI will feel familiar: component-per-feature, data-driven `items` arrays, `v-model` everywhere, and Bootstrap styling via props. Not a drop-in port, but the mental model carries over.

## Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Components](#components)
  - [Layout](#layout)
  - [Core](#core)
  - [Navigation](#navigation)
  - [Containers](#containers)
  - [Interactive](#interactive)
  - [Tooltips & Popovers](#tooltips--popovers)
  - [Data & Charts](#data--charts)
  - [Forms](#forms)
- [Composables](#composables)
- [Directives](#directives)
- [Examples](#examples)
- [Documentation](#documentation)

## Quick Start

```bash
npm install @velkymx/vibeui bootstrap
```

Optional peers (only if you use the features that need them):

```bash
npm install bootstrap-icons         # VibeIcon
npm install quill dompurify         # VibeFormWysiwyg (quill = the editor, dompurify = HTML sanitizing)
```

In your app entry (`main.ts`):

```ts
import { createApp } from 'vue'
import App from './App.vue'
import VibeUI from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'

createApp(App).use(VibeUI).mount('#app')
```

All components register globally. Prefer explicit imports? Tree-shakeable:

```ts
import { VibeButton, VibeModal, VibeCard } from '@velkymx/vibeui'
```

> Bootstrap **CSS** is imported by you. Bootstrap **JS** is managed internally - do not import it yourself.

### 30-second taste

```vue
<template>
  <!-- Tooltip: auto-inits, taps on touch, hovers on desktop -->
  <VibeTooltip text="I just work!">
    <VibeButton>Hover or Tap Me</VibeButton>
  </VibeTooltip>

  <!-- v-model modal, hybrid-ready, focus-safe -->
  <VibeModal v-model="showModal" title="Hello!">
    Fully reactive, automated, and accessible.
  </VibeModal>
</template>
```

Forms wire their own accessibility:

```vue
<template>
  <!-- No id needed - label, control, and feedback linked automatically -->
  <VibeFormGroup label="Email Address">
    <VibeFormInput v-model="fields.email" type="email" />
  </VibeFormGroup>
</template>
```

Toasts from anywhere:

```ts
import { useToast } from '@velkymx/vibeui'
const toast = useToast()
toast.success('Saved')
toast.error('Network error', { delay: 8000 })
```

Mount `<VibeToastHost />` once at app root, dispatch from any component.

## Features

| Feature | What it means |
|---------|---------------|
| **Bootstrap JS abstracted** | No `new bootstrap.Modal(...)`. Init, reconfigure, and dispose are automatic - with unmount guards. |
| **v-model everywhere** | Modals, offcanvas, toasts, collapses, tabs, accordions, sliders, and every form control. |
| **Self-wiring accessibility** | `VibeFormGroup` generates IDs, links labels, `aria-describedby`, help text, and validation feedback. Modals/offcanvas return focus on close. |
| **Strict TypeScript** | Typed props, emit payloads, and `provide`/`inject` keys. Full editor autocomplete, no `any`. |
| **Touch & hybrid aware** | Tooltips switch to tap on touch. Modals and offcanvas honor Android back button. |
| **Lazy-loaded** | Charts, WYSIWYG editor, and Bootstrap's JS load on demand - ship only what you use. |
| **Interaction suite** | Drag/drop, sortable, resizable, slider, stepper, autocomplete, calendar, and canvas charts. |

## Components

60+ components covering Bootstrap 5.3 plus an interaction and data-viz suite.

### Layout

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeContainer` | Responsive fixed/fluid container | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/layout/container.md) |
| `VibeRow` | Flexbox grid row | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/layout/row.md) |
| `VibeCol` | Flexbox grid column with breakpoints | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/layout/col.md) |

### Core

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeAlert` | Contextual alert with dismiss and fade animation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/alert.md) |
| `VibeBadge` | Inline badge with variant and pill styles | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/badge.md) |
| `VibeButton` | Button with variant, size, and outline styles | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/button.md) |
| `VibeButtonGroup` | Horizontal or vertical button group | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/button-group.md) |
| `VibeCloseButton` | Accessible dismiss button | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/close-button.md) |
| `VibeIcon` | Bootstrap Icons wrapper with sizing and color | - |
| `VibeLink` | Styled anchor with href validation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/link.md) |
| `VibePlaceholder` | Animated loading placeholder | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/placeholder.md) |
| `VibeSkeleton` | Multi-variant skeleton loading component | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/skeleton.md) |
| `VibeSpinner` | Loading spinner with variant and size | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/core/spinner.md) |

### Navigation

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeBreadcrumb` | Breadcrumb trail from items array | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/breadcrumb.md) |
| `VibeNav` | Tab/pill nav with router-link support | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/nav.md) |
| `VibeNavbar` | Responsive navbar with collapse | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/navbar.md) |
| `VibeNavbarBrand` | Navbar brand/logo link | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/navbar.md) |
| `VibeNavbarToggle` | Navbar collapse toggle button | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/navbar.md) |
| `VibeNavbarNav` | Navbar nav list from items array | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/navbar.md) |
| `VibePagination` | Pagination with ellipsis and page window | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/navigation/pagination.md) |
| `VibeScrollspy` | Scroll-aware nav highlighting | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/advanced/scrollspy.md) |

### Containers

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeCard` | Card container with header/body/footer slots, section classes, and an image slot | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/card/card.md) |
| `VibeHero` | Hero / banner section (variant, bordered, bgImage, gradient, overlay) | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/hero/hero.md) |
| `VibeListGroup` | List group with router-link support | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/list/list-group.md) |

### Interactive

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeAccordion` | Accordion with always-open and flush options | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/accordion.md) |
| `VibeCarousel` | Image carousel with indicators and captions | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/carousel.md) |
| `VibeCollapse` | Toggle visibility with Bootstrap animation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/collapse.md) |
| `VibeDatePicker` | Calendar date picker with range and min/max | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/date-picker.md) |
| `VibeDraggable` | Drag source wrapper | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/draggable.md) |
| `VibeDroppable` | Drop target zone | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/draggable.md) |
| `VibeDropdown` | Dropdown menu with items array | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/dropdown.md) |
| `VibeModal` | Modal dialog with v-model, sizes, scrollable | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/modal.md) |
| `VibeOffcanvas` | Offcanvas panel with placement options | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/offcanvas.md) |
| `VibeResizable` | Resizable container with aspect-ratio lock | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/resizable.md) |
| `VibeSlider` | Range slider with single or dual handles | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/slider.md) |
| `VibeSortable` | Sortable list with drag reorder | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/sortable.md) |
| `VibeStepper` | Multi-step wizard with validation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/stepper.md) |
| `VibeTabs` | Tabbed interface from items array | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/tabs.md) |
| `VibeTab` | Individual tab panel | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/tabs.md) |
| `VibeTabContent` | Standalone tab-pane content host | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/tabs.md) |
| `VibeToast` | Toast notification component with v-model | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/interactive/toast.md) |
| `VibeToastHost` | Toast container for `useToast()` service | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/use-toast.md) |

### Tooltips & Popovers

| Component | Description | Docs |
|-----------|-------------|------|
| `VibePopover` | Popover with title and text content | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/advanced/popover.md) |
| `VibeTooltip` | Tooltip with hover/tap detection | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/advanced/tooltip.md) |

### Data & Charts

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeDataTable` | Sortable, searchable, paginated data table | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/data/datatable.md) |
| `VibeProgress` | Progress bar with multi-bar and animated | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/progress/progress.md) |
| `VibeChartBar` | Bar chart (stacked, grouped) | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/charts/chart-bar.md) |
| `VibeChartLine` | Line chart with smooth curves and fill | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/charts/chart-line.md) |
| `VibeChartPie` | Pie chart | [docs](https://github.com/velkymx/vibeui/blob/main/docs/components/charts/chart-pie.md) |

> Charts are dependency-free, canvas-rendered, and lazy-loaded - no Chart.js or D3.

### Forms

| Component | Description | Docs |
|-----------|-------------|------|
| `VibeAutocomplete` | Typeahead with keyboard nav and async search | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/autocomplete.md) |
| `VibeFileInput` | File picker with drag/drop and size validation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/file-input.md) |
| `VibeFormCheckbox` | Checkbox with indeterminate and group support | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-checkbox.md) |
| `VibeFormDatepicker` | Native date input wrapper | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-datepicker.md) |
| `VibeFormGroup` | Auto-wires label, IDs, help text, and validation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-group.md) |
| `VibeFormInput` | Text input with types, sizes, and states | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-input.md) |
| `VibeFormRadio` | Radio button with group and inline layout | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-radio.md) |
| `VibeFormSelect` | Select dropdown with single and multiple selection | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-select.md) |
| `VibeFormSpinbutton` | Numeric stepper with min/max/step | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-spinbutton.md) |
| `VibeFormSwitch` | Toggle switch with label | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-switch.md) |
| `VibeFormTextarea` | Multi-line text input with character count | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-textarea.md) |
| `VibeFormWysiwyg` | Rich-text editor (Quill) with DOMPurify sanitization | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/form-wysiwyg.md) |
| `VibeInputGroup` | Input with prepend/append slots | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/input-group.md) |

Form validation rules and `useForm()` API: [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/validation.md)

## Composables

| Composable | Description | Docs |
|------------|-------------|------|
| `useBackButton` | Android back button handler | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/back-button.md) |
| `useBreakpoints` | Reactive Bootstrap breakpoint detection | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/breakpoints.md) |
| `useColorMode` | Light/dark/auto mode with system detection | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/color-mode.md) |
| `useForm` | Form state, dirty detection, and validation | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/use-form.md) |
| `useFormValidation` | Standalone validator runner with concurrency guard | [docs](https://github.com/velkymx/vibeui/blob/main/docs/forms/validation.md) |
| `usePosition` | Popper-style positioning utility | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/use-position.md) |
| `useToast` | Programmatic toast dispatch (success, error, etc.) | [docs](https://github.com/velkymx/vibeui/blob/main/docs/composables/use-toast.md) |

## Directives

| Directive | Description | Docs |
|-----------|-------------|------|
| `v-vibe-tooltip` | Directive-based tooltip on any element | [docs](https://github.com/velkymx/vibeui/blob/main/docs/directives/v-tooltip.md) |

## Examples

Full-page templates built entirely with VibeUI components — open [`examples/index.html`](./examples/index.html) (see [`examples/README.md`](./examples/README.md) for how to run them):

| Example | Shows |
|---------|-------|
| [Starter](./examples/starter.html) | Navbar, hero, features, interactive components, footer |
| [Album](./examples/album.html) | Photo grid with cards, badges, and an icon nav |
| [Pricing](./examples/pricing.html) | Pricing cards with variant-colored headers |
| [Checkout](./examples/checkout.html) | Full billing form, order summary, and validation |
| [Sign-in](./examples/sign-in.html) | Centered form with `useForm` validation |
| [Dashboard](./examples/dashboard.html) | Admin shell with sidebar and `VibeDataTable` |
| [Sidebars](./examples/sidebars.html) | Desktop sidebar + mobile offcanvas nav |
| [Product](./examples/product.html) | Marketing page with hero, feature grid, product cards |
| [Carousel](./examples/carousel.html) | Full-width `VibeCarousel` + featurettes |
| [Cover](./examples/cover.html) | Full-viewport one-page `VibeHero` |
| [Blog](./examples/blog.html) | Magazine layout with pagination and sidebar |
| [Jumbotron](./examples/jumbotron.html) | Modern jumbotron via the bordered `VibeHero` |

## Documentation

Full API reference: [`docs/`](https://github.com/velkymx/vibeui/blob/main/docs/README.md)
LLM-optimized reference: [`llms.txt`](./llms.txt)
