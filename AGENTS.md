# VibeUI — Guidance for AI Coding Agents

You are generating code that uses **`@velkymx/vibeui`** — a Vue 3 component library wrapping Bootstrap 5.3. Follow this and you'll produce correct code on the first try.

## Read the docs before you build — do not guess

These all ship inside the installed package:

- **Start here:** [`llms.txt`](./llms.txt) (package root) — the load → use → leverage workflow, a "common mistakes" cheat sheet, and a link index to every doc page.
- **Full API reference:** [`docs/`](./docs/README.md) — one page per component with its exact props, events, and slots.
- **Working examples:** [`examples/`](./examples/index.html) — full-page templates to copy patterns from.

**Do NOT** infer the API from `dist/`, from the compiled `.d.ts` types alone, or from memory. The documented props, `:items` shapes, and slot names are the source of truth. When unsure about a component, open its doc page first.

## Core rules

1. **Bootstrap CSS yes, Bootstrap JS never.** Import `bootstrap/dist/css/bootstrap.min.css` in your app. Do **not** import Bootstrap's JS — VibeUI loads it internally, on demand. (Non-bundler / UMD / CDN pages need a `bootstrap` import map, e.g. `{ "imports": { "bootstrap": "https://esm.sh/bootstrap@5.3" } }`, or interactive components silently fail.)
2. **Style with props.** `variant`, `size`, `outline` (a boolean — use `variant="secondary" outline`, **not** `variant="outline-secondary"`). For one-offs, pass `class`/`style`; they merge onto the component root.
3. **Visibility is `v-model`.** `<VibeModal v-model="open" />` (also Offcanvas / Toast / Collapse / Alert). Don't call Bootstrap `show`/`hide`.
4. **Data-driven components take arrays — never hand-write the Bootstrap markup:**
   - `:items` → `VibeNav`, `VibeDropdown`, `VibeListGroup`, `VibeBreadcrumb`, `VibeNavbarNav`, `VibeCarousel` (`CarouselItem[]`, each needs `src`)
   - `:options` → `VibeFormSelect`
   - `:bars` → `VibeProgress`
   - `:columns` + `:items` → `VibeDataTable`
5. **Custom content uses slots:** `#item` (Nav/Dropdown/ListGroup), `#header`/`#footer`/`#image` (Card), `cell(<key>)` (DataTable), default slot for body.
6. **These tags do NOT exist** — use the slot / `:items` API instead: `<vibe-card-body>`, `<vibe-card-header>`, `<vibe-list-group-item>`, `<vibe-nav-item>`, `<vibe-dropdown-item>`, `<vibe-progress-bar>`.
7. **`VibeIcon` uses `icon=`**, not `name=`.
8. **Drive components through props / `v-model` / slots / exposed methods** (`modal.value?.show()` / `.hide()` / `.toggle()` / `.refresh()` via a template ref). Never reach around the component to Bootstrap's own instance.
9. **Forms:** wrap controls in `<VibeFormGroup label="…">` (auto-links label + id + accessibility). Validate with `useForm` + `validators`; bind `:validation-state` / `:validation-message` per field.

## Setup

```ts
import { createApp } from 'vue'
import VibeUI from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'
createApp(App).use(VibeUI).mount('#app')   // registers all components + the v-vibe-tooltip directive
```

Or import components by name for tree-shaking and full template type-checking:

```ts
import { VibeButton, VibeModal, VibeCard } from '@velkymx/vibeui'
```
