# VibeUI Best Practices

Practical guidance for building well with `@velkymx/vibeui`. Each section pairs an
established web/Vue best practice (with a link to the authoritative source) with the
VibeUI way of applying it. For the exact API of any component, read its page in the
[Documentation Index](./README.md) — this guide is about *how to use them well*, not
their full reference.

---

## 1. Set up once, correctly

**Principle.** Import framework CSS yourself and initialize app-wide concerns in `main.ts`. Bootstrap ships its JS separately from its CSS ([Bootstrap: Getting started](https://getbootstrap.com/docs/5.3/getting-started/introduction/)), and Vue plugins are the place for global wiring ([Vue: Plugins](https://vuejs.org/guide/reusability/plugins.html)).

**VibeUI.**

```ts
// main.ts
import { createApp } from 'vue'
import VibeUI, { useColorMode } from '@velkymx/vibeui'
import 'bootstrap/dist/css/bootstrap.min.css'   // Bootstrap's CSS — you import it
import '@velkymx/vibeui/style.css'               // VibeUI's own component styles (canonical path)
import App from './App.vue'

useColorMode().initColorMode()                   // restore saved light/dark/auto before first paint
createApp(App).use(VibeUI).mount('#app')
```

- **Never import Bootstrap's JS.** VibeUI owns the Bootstrap JS lifecycle (init/config/destroy) for every interactive component; importing it yourself causes duplicate instances and event conflicts.
- **Use the canonical stylesheet path** `@velkymx/vibeui/style.css`. `@velkymx/vibeui/dist/vibeui.css` also works; the legacy `dist/style.css` is kept for back-compat.
- On UMD/CDN pages (no bundler), add an import map so VibeUI's internal `import('bootstrap')` resolves:
  ```html
  <script type="importmap">{ "imports": { "bootstrap": "https://esm.sh/bootstrap@5.3" } }</script>
  ```

---

## 2. The VibeUI Way — props *and* slots, data down / events up

**Principle.** Prefer props for input and events for output — "props down, events up" ([Vue Style Guide, Priority D](https://vuejs.org/style-guide/rules-use-with-caution)). Don't reach around a component to mutate the framework it wraps.

**VibeUI.** Every component supports a **shorthand-prop** mode and a **composable-slot** mode. Use props for the common case; drop to slots for custom content.

```vue
<!-- Shorthand: data-driven -->
<VibeListGroup :items="items" />

<!-- Composable: custom rows via the #item slot -->
<VibeListGroup :items="items">
  <template #item="{ item }">
    <strong>{{ item.text }}</strong> — {{ item.meta }}
  </template>
</VibeListGroup>
```

- **Drive interactive components with `v-model` + exposed methods, never Bootstrap directly.** `<VibeModal v-model="open" />`, or `modalRef.value?.show()`. Calling Bootstrap's `show()`/`hide()` yourself desyncs VibeUI's state.
- **Feed data-driven components arrays**, don't hand-write Bootstrap markup: `:items` (Nav, Dropdown, ListGroup, Breadcrumb, NavbarNav, Carousel), `:options` (FormSelect), `:columns`+`:items` (DataTable), `:bars` (Progress).
- **`class` / `style` merge onto the component root** for one-off tweaks — no wrapper needed.

---

## 3. Keys and lists

**Principle.** Always give `v-for` a stable, unique `key`; it is Priority A / Essential ([Vue Style Guide: Essential](https://vuejs.org/style-guide/rules-essential)).

**VibeUI.** When you pass `:items`, use a stable identifier in your data (an `id`), not the array index, so reorders and edits don't corrupt component state. VibeUI's data-driven components key off your item data — give each item a durable identity.

```ts
const items = rows.map(r => ({ id: r.id, text: r.name, to: { name: 'row', params: { id: r.id } } }))
```

For object-form `to` (named routes), give each item a distinct `id` — that's the key VibeUI uses.

---

## 4. Forms and accessibility come from the group

**Principle.** Labels must be programmatically associated with controls, and errors must be announced. Associating a name with a control and using live regions are standard techniques ([WAI-ARIA: aria-label](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA6)).

**VibeUI.** Wrap controls in `VibeFormGroup` — it auto-links `label`, `id`, and `aria-describedby`, and the shared feedback block carries `role="alert"` so screen readers announce validation errors.

```vue
<VibeFormGroup label="Email">
  <VibeFormInput v-model="email" type="email" :validation-state="state" :validation-message="msg" />
</VibeFormGroup>
```

- Validate with `useForm` + the built-in `validators` (`required`, `email`, `minLength`, …) and bind `:validation-state` / `:validation-message` per field.
- Consumer attributes (`name`, `aria-label`, `data-*`, `class`) land on the **native control**, not the wrapper — so native form submission and label targeting work.

---

## 5. Accessible by default — icons, contrast, focus

**Principle.** Text needs a contrast ratio of at least 4.5:1 ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)); UI icons that convey meaning need 3:1 ([WCAG G207](https://www.w3.org/WAI/WCAG21/Techniques/general/G207)); purely decorative images should be hidden from assistive tech ([WAI: Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/)).

**VibeUI.**

```vue
<!-- Decorative icon (default): hidden from screen readers -->
<VibeButton><VibeIcon icon="download" /> Download</VibeButton>

<!-- Meaningful icon: give it an accessible name -->
<VibeIcon icon="check-circle-fill" color="success" aria-label="Verified" />
```

- `VibeIcon` is `aria-hidden` by default; add `aria-label` when the icon carries meaning (then it renders `role="img"`).
- Prefer VibeUI's `variant` colors and `text-bg-*`-backed components (e.g. `VibeBadge`) — they pair a contrast-correct foreground with each background.
- Let VibeUI manage focus: `VibeModal` moves focus to the first control on open and restores it on close.

---

## 6. Optional heavy peers are injected, never assumed

**Principle.** A library should not hard-fail a consumer's build for an optional dependency the consumer never uses. The accepted patterns are try/catch dynamic import and — most robustly — dependency injection ([webpack: optional dynamic imports](https://github.com/webpack/webpack/discussions/18027)).

**VibeUI.** `VibeFormWysiwyg` needs Quill (and, ideally, DOMPurify), but the library imports **neither** — so a project that never uses the editor has zero `quill`/`dompurify` references in its bundle (no "Can't resolve" warnings, even under warnings-as-errors). You inject them:

```ts
import VibeUI, { makeDomPurifySanitizer } from '@velkymx/vibeui'
import DOMPurify from 'dompurify'
import 'quill/dist/quill.snow.css'

app.use(VibeUI, {
  wysiwyg: {
    quillLoader: () => import('quill'),            // your bundler resolves quill here
    sanitizer: makeDomPurifySanitizer(DOMPurify),
  },
})
```

Or per instance: `<VibeFormWysiwyg :quill-loader="() => import('quill')" :sanitizer="s" />`. Bootstrap Icons work the same way for `VibeIcon` — install `bootstrap-icons` and `import 'bootstrap-icons/font/bootstrap-icons.css'` in your app.

---

## 7. Ship less — imports, tree-shaking, immutability

**Principle.** Vue 3's APIs are tree-shakeable via ES-module named imports ([Vue: Performance](https://vuejs.org/guide/best-practices/performance.html)), and bundlers only prune what your imports let them ([Vite: features](https://vite.dev/guide/features)).

**VibeUI.**

```ts
// Tree-shakeable AND fully template-type-checked
import { VibeButton, VibeModal } from '@velkymx/vibeui'
```

- Import components by name when you don't need the global `app.use(VibeUI)` registration — the bundler drops what you don't reference.
- **Update chart data immutably.** `VibeChartLine`/`Bar`/`Pie` watch data by reference (not deep) — replace the array/object to trigger a repaint rather than mutating in place; this avoids a full repaint on every nested change.
- Mount `<VibeToastHost />` **once** at the app root; drive it with the `useToast()` service.

---

## 8. TypeScript

**Principle.** Use the Composition API with typed props/emits for first-class inference ([Vue: TypeScript with Composition API](https://vuejs.org/guide/typescript/composition-api.html)).

**VibeUI.**

- Named imports (`import { VibeButton } from '@velkymx/vibeui'`) give you **template type-checking** of props with `vue-tsc`.
- Public types are exported from the package: `Variant`, `Size`, `FormSelectOption`, `DataTableColumn<T>`, `ComponentError`, and the WYSIWYG `QuillLoader` / `Sanitizer` / `VibeUIOptions`.
- `VibeFormSelect` preserves typed primitive option values (`number`, `boolean`, `null`) through `v-model` — you don't stringify.

---

## Anti-patterns — do NOT do these

| ❌ Don't | ✅ Do |
|---------|------|
| `variant="outline-secondary"` | `variant="secondary" outline` (outline is a boolean prop) |
| `<VibeIcon name="house" />` | `<VibeIcon icon="house" />` |
| `<VibeCarousel :slides="…" />` | `<VibeCarousel :items="…" />` (each `CarouselItem` needs `src`) |
| `<vibe-card-body>`, `<vibe-list-group-item>`, … | the default / `#item` slot and `:items` / `:bars` (those tags don't exist) |
| `import 'bootstrap/dist/js/…'` or `new bootstrap.Modal()` | props, `v-model`, exposed methods — VibeUI owns Bootstrap JS |
| hand-written `<ul class="nav">` / `<div class="card">` | `<VibeNav :items>` / `<VibeCard>` |
| reverse-engineering props from `dist/` | read the component's doc page |
| mutating chart data in place | replace the data reference immutably |

---

## Further reading

- Vue — [Style Guide](https://vuejs.org/style-guide/) · [Plugins](https://vuejs.org/guide/reusability/plugins.html) · [Provide / Inject](https://vuejs.org/guide/components/provide-inject.html) · [Performance](https://vuejs.org/guide/best-practices/performance.html) · [TypeScript](https://vuejs.org/guide/typescript/composition-api.html)
- Bootstrap 5.3 — [Getting started](https://getbootstrap.com/docs/5.3/getting-started/introduction/) · [Color modes](https://getbootstrap.com/docs/5.3/customize/color-modes/)
- Accessibility — [WCAG 1.4.3 Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) · [WCAG G207 (icon contrast)](https://www.w3.org/WAI/WCAG21/Techniques/general/G207) · [WAI Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/) · [ARIA6 aria-label](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA6)
- Bundlers — [webpack optional dynamic imports](https://github.com/webpack/webpack/discussions/18027) · [Vite dependency pre-bundling](https://vite.dev/guide/dep-pre-bundling)
