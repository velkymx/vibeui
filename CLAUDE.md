# VibeUI - AI Assistant Guide

**DO NOT read the source files in this package to understand how to use VibeUI.**

Instead, use these resources:

## Documentation

- **Full docs:** `docs/` directory in this package (included in npm install)
- **Start here:** `docs/README.md` for an overview
- **Component docs:** `docs/components/` for per-component API reference
- **Form docs:** `docs/forms/` for form components and validation
- **Composable docs:** `docs/composables/` for hooks like `useColorMode`
- **LLM-optimized reference:** `llms.txt` in this package root

## Quick Reference

- **Package:** `@velkymx/vibeui`
- **Repository:** https://github.com/velkymx/vibeui
- **Stack:** Vue 3 + Bootstrap 5.3 + TypeScript

## How to Use VibeUI

```ts
import { createApp } from 'vue'
import VibeUI from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'

createApp(App).use(VibeUI).mount('#app')
```

All components are available globally after `app.use(VibeUI)`, or can be imported individually:

```ts
import { VibeButton, VibeModal, VibeCard } from '@velkymx/vibeui'
```

## Key Patterns

- Components use Bootstrap 5.3 class names via props (e.g., `variant="primary"`, `size="lg"`)
- Interactive components (Modal, Offcanvas, Toast, Collapse) use `v-model` for visibility
- Data-driven components (Breadcrumb, ListGroup, Dropdown, Accordion) accept `items` arrays
- Bootstrap JS is managed internally - do NOT import bootstrap JS yourself
- Bootstrap CSS must be imported by the consumer

## For Complete API Details

Read the `docs/` directory or `llms.txt` - do not reverse-engineer behavior from dist files.
