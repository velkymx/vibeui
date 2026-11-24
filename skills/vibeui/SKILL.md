---
name: vibeui
description: Build or change UI in a project that uses VibeUI (@velkymx/vibeui), a Vue 3 + Bootstrap 5.3 component library. Use whenever a task touches Vue pages, layouts, forms, tables, modals, navigation, dashboards, theming, or when the user asks to "make it look better", "fix the UI", or review generated UI in such a project. Also use it to avoid generic "AI slop" patterns, even if the user does not name VibeUI or Bootstrap.
---

# VibeUI

VibeUI wraps Bootstrap 5.3 in typed Vue 3 components. It does three things:

1. **Applies Bootstrap classes from props** (`variant`, `size`, `outline`, `align`, …).
2. **Owns Bootstrap JS** (init, reconfigure, dispose) for Modal, Offcanvas, Toast, Tooltip, Popover, Accordion, Carousel, Collapse, Dropdown, Scrollspy, and Tabs.
3. **Adds Vue state** through `v-model`, events, and slots.

The practical rule: **compose VibeUI components, don't re-create their Bootstrap markup or JavaScript.**

## First, find the truth

Do not guess props, slot names, or `:items` shapes. Read the installed docs:

- `node_modules/@velkymx/vibeui/llms.txt` — the workflow, rules, and link index.
- `node_modules/@velkymx/vibeui/docs/` — one page per component (`components/`, `forms/`, `composables/`).
- In the VibeUI repo itself, the same files live at `llms.txt` and `docs/`.
- For design direction and anti-slop review, read `docs/unslop.md` if present.

If `@velkymx/vibeui` is not in `package.json`, stop and confirm before installing or assuming the API.

## The nine rules

1. **Bootstrap CSS yes, Bootstrap JS never.** The app imports `bootstrap/dist/css/bootstrap.min.css`; VibeUI imports Bootstrap's JS internally. Never `import 'bootstrap'` or call `new bootstrap.Modal()` in app code.
2. **Style with props.** Use `variant`, `size`, `outline`, `align`, `width`. `outline` is a boolean: `variant="secondary" outline`, not `variant="outline-secondary"`. `class`/`style` merge onto the component root for one-offs.
3. **Visibility is `v-model`.** `<VibeModal v-model="open" />`, `<VibeCollapse v-model="open" />`, `<VibeAlert v-model="open" />`, `<VibeOffcanvas v-model="open" />`.
4. **Data-driven components take arrays.** Never hand-write the Bootstrap list markup:
   - `:items` → `VibeNav`, `VibeNavbarNav`, `VibeDropdown`, `VibeListGroup`, `VibeBreadcrumb`, `VibeAccordion`, `VibeCarousel` (each `CarouselItem` needs `src`)
   - `:options` → `VibeFormSelect`
   - `:bars` → `VibeProgress`
   - `:columns` + `:items` → `VibeDataTable`
5. **Custom content uses slots.** `#item` (Nav, Dropdown, ListGroup), `#header`/`#footer`/`#image`/`#title` (Card), `#footer` (Modal), `cell(<key>)`/`footer(<key>)`/`expanded` (DataTable), default slot for body.
6. **These tags do not exist.** Use the slot or `:items` API instead: `<vibe-card-body>`, `<vibe-card-header>`, `<vibe-list-group-item>`, `<vibe-nav-item>`, `<vibe-dropdown-item>`, `<vibe-progress-bar>`.
7. **`VibeIcon` uses `icon=`**, not `name=`.
8. **Drive components through props, `v-model`, slots, or exposed methods.** `modal.value?.show()` / `.hide()` via a template ref. Never reach around the component to Bootstrap's own instance.
9. **Forms use `VibeFormGroup` + `useForm`.** The group links the label, id, help text, and validation; validators live in the form model. A placeholder is never the label.

## Workflow

1. **Inspect the project.** Read `package.json`, the app's entry, one existing page, and the design tokens if they exist. Match the existing structure before inventing one.
2. **Map the requirement to components.** Use the component map below, then open the doc page for every component you touch. Read `references/component-map.md` for the full table.
3. **Outline the screen in text first.** Headings, blocks, actions, and states. This is the cheapest place to catch a layout that does not fit the content.
4. **Build with props and slots.** Prefer composition over custom CSS. If a primitive is missing, name it and ask before writing CSS.
5. **Design the states.** Empty, loading, error, success, long text, no permission. Tables and lists have these states; so do forms.
6. **Review with the design gate.** Read `references/design-review.md`. Run the deletion pass and the ship checklist.
7. **Verify.** Run the project's typecheck and tests. Check keyboard focus, 320 px reflow, and dark mode.

## Component map

| Need | Components | Notes |
| --- | --- | --- |
| Page shell | `VibeContainer`, `VibeRow`, `VibeCol`, `VibeNavbar*` | 12-column grid; `:cols`, `:md`, `:lg`. |
| Surfaces and content | `VibeCard`, `VibeHero`, `VibeListGroup` | One card level. Use Card slots for header/footer/image. |
| Actions | `VibeButton`, `VibeButtonGroup`, `VibeLink`, `VibeCloseButton` | One primary action per view. |
| Feedback | `VibeAlert`, `VibeToast`/`useToast`, `VibeSpinner`, `VibeSkeleton`, `VibePlaceholder`, `VibeProgress` | Prefer `useToast()` for app-wide feedback. |
| Overlays | `VibeModal`, `VibeOffcanvas`, `VibeTooltip`, `VibePopover` | `v-model` controls visibility. |
| Navigation | `VibeNav`, `VibeNavbar`, `VibeBreadcrumb`, `VibePagination`, `VibeTabs`/`VibeTab`, `VibeStepper`, `VibeScrollspy` | `:items` where supported; pagination is `v-model:current-page`. |
| Disclosure and media | `VibeAccordion`, `VibeCollapse`, `VibeCarousel` | Arrays for accordion items and carousel items. |
| Data | `VibeDataTable`, `VibeChartLine`, `VibeChartBar`, `VibeChartPie` | DataTable owns sorting, filtering, paging, selection, expansion, grouping, virtualization. |
| Forms | `VibeFormGroup`, `VibeFormInput`, `VibeFormSelect`, `VibeFormTextarea`, `VibeFormCheckbox`, `VibeFormRadio`, `VibeFormSwitch`, `VibeFormSpinbutton`, `VibeFormDatepicker`, `VibeFileInput`, `VibeInputGroup`, `VibeAutocomplete`, `VibeFormWysiwyg`, `VibeFormErrorSummary` | `useForm` + `validators` for validation. |
| Composables | `useColorMode`, `useToast`, `useEventBus`, `useBreakpoints`, `useId`, `useDebouncedRef`, `usePosition`, `useBackButton`, `useForm` | Read the composable page before use. |
| Directive | `v-vibe-tooltip` | For tooltips on arbitrary elements. |

Exact props, events, and slots are in `docs/`. Read the page; do not infer from this table.

## Two canonical snippets

### Page shell

```vue
<template>
  <VibeNavbar variant="light" expand="lg">
    <VibeNavbarBrand href="/">Acme</VibeNavbarBrand>
    <VibeNavbarToggle target="main-nav" />
    <VibeCollapse id="main-nav" is-nav>
      <VibeNavbarNav :items="navItems" />
    </VibeCollapse>
  </VibeNavbar>

  <VibeContainer class="py-4">
    <VibeRow>
      <VibeCol :cols="12" :lg="8">
        <VibeCard title="Recent activity">
          <VibeDataTable :columns="columns" :items="rows" row-key="id" />
        </VibeCard>
      </VibeCol>
      <VibeCol :cols="12" :lg="4">
        <VibeCard title="Account">
          <p class="text-body-secondary mb-0">…</p>
        </VibeCard>
      </VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

### Form with validation

```vue
<script setup lang="ts">
import { useForm, validators } from '@velkymx/vibeui'

const form = useForm({ email: '' })
const rules = { email: [validators.required(), validators.email()] }

const submit = async () => {
  const { valid } = await form.validate(rules)
  if (!valid) return
  // submit form.values.value
}
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <VibeFormGroup
      label="Work email"
      help-text="We use this for receipts."
      :validation-state="form.errors.email ? 'invalid' : null"
      :validation-message="form.errors.email"
    >
      <VibeFormInput
        v-model="form.fields.email"
        type="email"
        autocomplete="email"
        @validate="form.validateField('email', rules.email)"
      />
    </VibeFormGroup>

    <VibeButton type="submit" variant="primary">Continue</VibeButton>
  </form>
</template>
```

More recipes: `references/patterns.md`.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| `variant="outline-secondary"` | `variant="secondary" outline` |
| `<VibeIcon name="house" />` | `<VibeIcon icon="house" />` |
| `<VibeCarousel :slides="…" />` | `<VibeCarousel :items="…" />` with `src` |
| Hand-written `<ul class="dropdown-menu">` | `<VibeDropdown :items="…" />` |
| A manual `<label>` and input | `VibeFormGroup` around the control |
| `data-bs-toggle="modal"` plus `v-model` | Pick one path: `v-model` or the exposed methods |
| `new bootstrap.Modal(el)` | Use the component and its exposed `show()` / `hide()` |
| Custom table sorting/filtering | `VibeDataTable` (`:columns`, `:items`, `sortable`, `searchable`) |
| `!important` to beat Bootstrap | Use props or a component variant; fix the structure |
| `--bs-primary` overrides | Theme through props and `useColorMode`; use tokens only if the system allows it |
| Importing `bootstrap` JS | VibeUI owns the lifecycle; remove the import |
| `v-html` for structured content | Slots, components, or `VibeFormWysiwyg` for rich text |

## Verify before finishing

- [ ] Every component used has a doc page I read in this session
- [ ] Props, slot names, and `:items` shapes match the docs
- [ ] Empty, loading, error, and success states exist where the component supports them
- [ ] Labels persist; no placeholder-only fields
- [ ] Keyboard path works; focus is visible; targets are large enough
- [ ] 320 px reflow checked; no horizontal scroll
- [ ] One primary action per view; no nested cards; no decorative badges or icons
- [ ] No unexplained custom CSS, no Bootstrap JS import, no direct instance access
- [ ] Project typecheck and tests run

## References

Read only what the task needs:

- `references/component-map.md` — component inventory with doc paths and key props.
- `references/patterns.md` — app shell, auth, form, table, dialog, dashboard, theme.
- `references/design-review.md` — budgets, AI-slop tells, before/after, ship gate.
- `references/troubleshooting.md` — common runtime and TypeScript errors.

For the full library reference, read `docs/README.md` and the per-component pages. For design direction, read `docs/unslop.md`.
