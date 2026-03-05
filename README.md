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

## Advanced Interactivity

VibeUI v0.6.0+ fully abstracts Bootstrap's JavaScript. You no longer need to manually initialize tooltips, modals, or collapses.

```vue
<template>
  <div>
    <!-- Automatic tooltip initialization -->
    <VibeTooltip text="I just work!">
      <VibeButton>Hover Me</VibeButton>
    </VibeTooltip>

    <!-- Full v-model support for Modals -->
    <VibeModal v-model="showModal" title="Hello!">
      Fully reactive and automated.
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
</template>
```

## Components

VibeUI includes all major Bootstrap 5.3 components, fully wrapped for Vue 3:

* **Layout**: Container, Row, Col
* **Core**: Alert, Badge, Button, ButtonGroup, CloseButton, Spinner, Placeholder, Icon
* **Navigation**: Breadcrumb, Nav, Navbar, Pagination, Scrollspy
* **Interactive**: Accordion, Collapse, Dropdown, Modal, Offcanvas, Toast, Carousel
* **Data**: DataTable
* **Forms**: Input, Select, Textarea, Spinbutton, Datepicker, Checkbox, Radio, Switch, Wysiwyg, FormGroup

## Full Documentation

For detailed documentation and examples, visit our [Docs](./docs/README.md).

## License

[MIT License](LICENSE) 

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
