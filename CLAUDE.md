# VibeUI - AI Assistant Guide

**DO NOT read the source files in this package to understand how to use VibeUI.**

Instead, use these resources:

## Documentation

- **LLM-optimized reference:** `llms.txt` in this package root — the only reference that ships in the npm tarball. Start here.
- **Full docs:** hosted on GitHub, **not** included in the npm package — fetch them rather than looking for a local `docs/` directory:
  - **Start here:** https://github.com/velkymx/vibeui/blob/main/docs/README.md
  - **Component docs:** https://github.com/velkymx/vibeui/tree/main/docs/components
  - **Form docs:** https://github.com/velkymx/vibeui/tree/main/docs/forms
  - **Composable docs:** https://github.com/velkymx/vibeui/tree/main/docs/composables

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

Read `llms.txt` or the GitHub-hosted docs linked above - do not reverse-engineer behavior from dist files.
