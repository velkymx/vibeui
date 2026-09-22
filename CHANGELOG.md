# Changelog

All notable changes to `@velkymx/vibeui` are documented here. This project adheres to [Semantic Versioning](https://semver.org) and the [Keep a Changelog](https://keepachangelog.com) format.

The **Detailed History** section below the releases preserves the per-commit Code Review (CR5–CR9) and audit notes for contributors.

---

## [Unreleased]

### Changed (BREAKING)

- **`VibeFormWysiwyg` no longer imports `quill` or `dompurify` itself — the consumer injects them.** The library's build now contains **zero** references to these optional peers, so a project that never uses the editor gets no `Can't resolve 'quill'/'dompurify'` bundler warnings (which warnings-as-errors builds turn fatal). To use the editor: `import 'quill/dist/quill.snow.css'` in your app and provide a loader (and optional sanitizer) via `app.use(VibeUI, { wysiwyg: { quillLoader: () => import('quill'), sanitizer: makeDomPurifySanitizer(DOMPurify) } })` or the new `:quill-loader` / `:sanitizer` props. New exports: `makeDomPurifySanitizer`, `WYSIWYG_PURIFY_CONFIG`, `VIBE_WYSIWYG_KEY`. Removed: the internal `loadDOMPurify` / `sanitizeHtml` from `src/utils/sanitizeHtml.ts`. See the [VibeFormWysiwyg migration note](docs/forms/form-wysiwyg.md#migration-from-1x).

---

## [1.1.2] — 2026-08-06

A patch release driven by a consumer bug report. Two defects turned out to be wider than reported — the `to` prop was broken on every component that accepts it, and the same class of fault appeared in a second place — plus a security gap found while fixing them, a smaller published package, and the removal of duplication across the form and chart components.

### Fixed

- **`to` never rendered an `href` — on all 8 components that accept it (VibeButton, VibeLink, VibeNav, VibeNavbarNav, VibeNavbarBrand, VibeListGroup, VibeDropdown, VibeBreadcrumb).** Each bound `:href` *and* `:to` on `<component :is="'router-link'">`. When routing, `href` evaluates to `undefined`, but Vue keeps the key in RouterLink's fallthrough attrs and `mergeProps` copies `undefined` over the anchor RouterLink had already resolved — so `to` produced `<a>` with no href and clicks navigated nowhere. Bindings are now built by a `linkBindings()` helper that omits the unused key entirely. Confirmed against vue-router 4 and 5. Two side effects of the same fix: a native `<a>` no longer carries a stray `to` attribute, and a disabled `VibeButton to="…"` no longer puts one on its `<span>`.
- **VibeFormSelect wrote synthetic `vi:N` values into the DOM.** Option values were index-encoded so typed primitives could survive a `<select>`'s string-only value. `v-model` round-tripped correctly, but native form submission posted `vi:1`, and E2E selectors, browser autofill and non-Vue consumers all read the marker instead of the value. Options now follow Vue's own `<option :value>` semantics — the attribute carries `String(value)` (absent for `null`/`undefined`) while the untouched value rides on the element's `_value` property. Selection is applied imperatively once the options are in the DOM, mirroring Vue's own `v-model` on `<select>`, because a select's value cannot address `0`, `false` or `null`. Matching uses `Object.is`, so those stay distinct; first match wins on duplicates.
- **VibeButton and VibeNavbarNav did not sanitize `href` (security).** The other six link-bearing components ran it through `safeHref()`; these two passed `javascript:`, `data:`, `vbscript:` and protocol-relative URLs straight to the DOM — and VibeNavbarNav's own documentation already claimed otherwise. Both now sanitize, including VibeNavbarNav's dropdown children, and an unsafe value falls through to `to` or to a plain button rather than leaving a dead anchor. VibeButton's `type` binding keyed off the raw `href`, which would have left such a button with no `type` — defaulting it to `submit` inside a form; it now keys off the resolved tag.
- **Form controls inside a VibeFormGroup ignored the group's help text (WCAG 1.3.1).** Only `VibeFormInput` pointed `aria-describedby` at the group's help and feedback elements; the other nine controls referenced only their own ids, despite the group contract exposing `helpId`/`feedbackId` for exactly this. `aria-describedby` is now derived from what actually renders, so a control can no longer reference an id whose element the group suppressed.
- **VibeFormWysiwyg — the Quill editor now follows `data-bs-theme`.** Quill's snow theme hardcodes a light palette (`#444` icon strokes, `#fff` picker and tooltip surfaces), so in dark mode the editor stayed light and the toolbar icons rendered dark-on-dark. Those are remapped onto Bootstrap's own custom properties, which covers both modes and any custom theme without a dark-specific selector and without JS.
- **VibeFormWysiwyg — a missing Quill no longer logs `console.error`.** Quill is an optional peer, so a consumer who never installs it hits that path by design; it was reported as an error on every mount, reading as a library fault in production logs. The visible alert and the `component-error` emit still carry the signal, and DEV keeps a `console.warn`.

### Changed

- **`dompurify` is no longer bundled.** It is declared an optional peer and the install instructions ask consumers to add it, but it was the one peer missing from the build's external list, so a 31.8 kB copy shipped alongside the one the consumer installs.
- **`.npmignore` removed; `files` in package.json is now the only rule for what publishes.** The two disagreed — `.npmignore` listed `docs/`, which shipped anyway because the allowlist wins.
- **Internal design documents no longer ship.** `docs/superpowers/` held four dated specs and plans for features that shipped long ago; nothing linked to them.
- **Dependencies refreshed within their existing ranges**, including `@floating-ui/dom` 1.7.6 → 1.8.0, the one runtime dependency. Bootstrap (5.3.8) and Quill (2.0.3) were already current. TypeScript stays on 6.x — 7.0 is a major and belongs in its own release. ⚠️ Contributors: Playwright 1.62 needs a matching browser binary — run `npx playwright install chromium` if the browser suite reports "no tests".

### Internal

No public API change from any of the following.

- **`useFormField`** replaces the id, description and self-rendering block that all ten form controls repeated. The duplication had already drifted: `VibeFormSwitch` and `VibeFormSpinbutton` never defined `helpId`/`feedbackId`, and `VibeFormTextarea` carried a fourth spelling of `aria-describedby`. That drift is what hid the WCAG gap above.
- **`VibeFieldFeedback`** replaces the help and valid/invalid markup duplicated verbatim in ten control templates, including the `display: block` override and the `role="alert"` carrying WCAG 4.1.3.
- **`VibeChartLegend`** replaces the legend markup and CSS copied across the three chart components — the stylesheet had been shipping three copies of every legend rule.
- **Regression coverage for the `to` prop now mounts a real vue-router.** The previous tests stubbed `router-link`, and a stub renders whatever props it is handed, so it could never have caught the defect above.

### Package size

| | 1.1.1 | 1.1.2 |
|---|---|---|
| ESM | 278.9 kB | 243.6 kB |
| UMD | 245.7 kB | 212.4 kB |
| CSS | 13.7 kB | 15.1 kB |
| tarball | 257.1 kB | 236.4 kB |

CSS grows because of the Quill dark-mode rules; every other number falls.

---

## [1.1.1] — 2026-07-05

A patch release driven by a consumer accessibility audit: screen-reader announcement fixes across every form control, native form-submission repairs, and modal/toast a11y refinements.

### Fixed

- **VibeFileInput — now implements the shared validation contract.** It was the only form control with no validation surface: new `validationState`/`validationMessage` props render `is-valid`/`is-invalid` plus a feedback block with `role="alert"`, wire `aria-invalid`/`aria-describedby`, and defer to a surrounding `VibeFormGroup` like the other controls. In `dragDrop` mode the drop-zone border turns invalid-red, since the native input is hidden there.
- **All form controls — standalone `invalid-feedback` is now a live region (WCAG 4.1.3).** `VibeFormGroup` already announced errors via `role="alert"`; the standalone feedback path in the 9 form controls (Input, Textarea, Select, Checkbox, Radio, Switch, Datepicker, Spinbutton, Wysiwyg) did not, leaving errors silent for screen-reader users after a failed submit.
- **VibeFormInput / VibeFormTextarea / VibeFormSelect / VibeFileInput — consumer HTML attributes now reach the native control.** `name`, `min`, `max`, `maxlength`, `pattern`, `capture`, etc. previously landed on the wrapper `<div>`, so native form submission lost the field name and constraint-validation attributes never applied. The components now set `inheritAttrs: false` and bind `$attrs` on the control (bound first, so prop-driven bindings win conflicts). ⚠️ **Behavior note:** consumer `class`/`style` previously applied to the wrapper `<div>`; they now apply to the control itself and merge with the Bootstrap classes.
- **VibeModal — `autoFocus` now works in button-only modals (WCAG 2.4.3).** Confirm-style modals with no form controls received no focus on open, and a disabled input could swallow the focus call. The first enabled form control is still preferred (the header close button must not steal focus from forms); modals without one fall back to their first focusable element.
- **VibeToast — success/info toasts no longer interrupt screen readers (WCAG 4.1.3).** `danger`/`warning` variants keep `role="alert"`/`aria-live="assertive"`; every other variant (and variant-less toasts) is now a polite `role="status"` live region.

### Internal / Tests

- **Placeholder contrast regression suite** — real-Chromium tests assert computed `::placeholder` contrast ≥ 4.5:1 on VibeFormInput, VibeFormTextarea, VibeAutocomplete, and VibeDatePicker. (No component CSS was needed: Bootstrap 5.3's own `.form-control::placeholder` rule already provides ~6.8:1 in both color modes.)

---

## [1.1.0] — 2026-06-26

A large stabilization release: the full Code Review 8 & 9 audits, the P0 cursor fix, the Code Review 7 accessibility sprint, and a clean type-checking build.

### Added

- **VibeModal focus management (WCAG 2.4.3 / 2.1.2 / 2.1.1)** — opening a modal auto-focuses its first form control (`autoFocus` prop, default `true`); the page behind the modal is made `inert` with a Tab/Shift+Tab focus trap, and focus returns to the trigger on close; `Cmd/Ctrl+Enter` submits the first `<form>` inside the modal (`submitOnMetaEnter` prop, default `true`).
- **VibeFormErrorSummary (new component)** — top-of-form `role="alert"` error summary (WCAG 3.3.1) listing all non-empty errors with anchor links; clicking a link emits `focus(key)` so the consumer can focus the offending field.
- **VibeFormGroup label wiring (WCAG 1.3.1 / 3.3.2 / 4.1.3)** — auto-generated `id`/`for` linkage via `provide`/`inject`, `aria-describedby` pointing at help text and validation feedback, a red `*` / gray "(optional)" required indicator, and `role="alert"` on the error region.
- **VibeFormInput password UX** — `showToggle` prop renders an eye-icon show/hide-password button (`aria-pressed`, `aria-label`); `showPasswordStrength` prop renders a 4-segment strength meter with an `aria-live` announcement.
- **VibeFormInput typed `autocomplete` + `inputmode` (WCAG 1.3.5 / 2.1.1)** — new `AutocompleteType` and `InputMode` union types with type-based auto-detection (`type="number"` → `inputmode="decimal"`, `type="email"` → `autocomplete="email"`, …); explicit props override.
- **Contrast fixes (WCAG 1.4.3)** — disabled `VibeButton` labels and `VibeFormInput` placeholders render at ≥ 4.5:1 in light and dark mode (replacing Bootstrap's 0.65 disabled fade and the browser-default placeholder alpha).
- **VibeHero `overlayOpacity` prop** — control the darkness of the default overlay scrim (`Number`, default `0.5`, clamped to `[0, 1]`).
- **VibeDataTable `clickable` prop** — show a pointer cursor on rows to signal interactivity (pair with a `@row-clicked` listener).
- **VibeButton icon-only a11y check** — DEV-only warning when an icon-only button lacks `aria-label`/`aria-labelledby` (WCAG 4.1.2).
- **VibeAutocomplete DEV warning** — warns once when object items are used without an `itemText` prop (avoids silent `[object Object]` labels).
- **VibeAccordion DEV warning** — warns on duplicate `item.id` values, which previously failed silently.

### Changed

- ⚠️ **Charts (Bar / Line / Pie) now require immutable data updates.** The `data` watch is shallow — it fires only when the `data` prop **reference** changes. In-place mutation (e.g. `data.datasets[0].data.push(x)`) no longer triggers a repaint. Update immutably instead: `data = { ...data, datasets: [...] }`. This removes N full canvas repaints for N nested mutations.
- **VibeDataTable `columns` is now optional**, defaulting to `[]` (previously `required`). An unset/loading state renders an empty table instead of emitting a Vue prop warning.
- **VibeAlert `variant`** is now typed as the `Variant` union (was plain `String`), matching the documented API.
- **VibeAutocomplete** — `ArrowUp` at the first option is now a no-op instead of wrapping to the last (WAI-ARIA combobox behavior).
- **VibeFormInput** — the standalone label now shows an `(optional)` indicator for non-required fields, matching `VibeFormGroup` (WCAG 3.3.2).
- **VibeDataTable** — sort indicators are now CSS-based with an `aria-sort` attribute on sortable headers (replaces Unicode glyphs that rendered as tofu on some platforms).

### Fixed

- **Pointer cursor (P0)** — Bootstrap Icon glyphs no longer flip the cursor to a text caret inside links/buttons; non-link breadcrumb items render as `<button>`; list-group items get `list-group-item-action` + pointer affordance.
- **Type-check regressions** — `aria-sort` (VibeDataTable) and `aria-atomic`/`aria-live` (VibeToast) no longer fail `vue-tsc`; the build emits zero TS errors.
- **VibeButton** — the icon-only a11y check now inspects the mounted DOM instead of invoking the slot in `setup`, eliminating a "Slot invoked outside of the render function" Vue warning.
- **Library no longer crashes when `quill` is not installed** — the optional peer dependency is imported lazily (CR8-1).
- **VibeDropdown / VibeNav** — object-form `to` values no longer collapse to a duplicate `[object Object]` Vue key (uses a `routeKey()` helper).
- **VibeAutocomplete** — async `source` rejections are caught; stale results are cleared and the listbox closes.
- **VibeFormWysiwyg** — async init failures emit `component-error` instead of being silently swallowed; `loadError` resets so retries start clean.
- **VibeAccordion / VibeNav** — added a `reinitGuard` to prop watchers to prevent concurrent dispose/init races.
- **VibeFormCheckbox** — array uncheck now removes all occurrences of a value, not just the first.
- **VibeTabs** — the `visited` set is cleared on tab unmount, so a remounted `lazy` tab renders lazily again.
- **VibeAlert** — disposes a stale Bootstrap instance before re-init on rapid toggles.
- **VibeCollapse / VibeAccordion** — added `isUnmounted` guards so Bootstrap constructors don't run on detached elements after async import.

### Performance

- **VibeTooltip / VibePopover** — touch detection is cached once at setup instead of re-running on every computed evaluation.
- **VibeDropdown** — replaced the per-change `itemClassMap` computed Map with a plain `getItemClass()` function.

### Internal / Types

- **VibeScrollspy** — replaced an `as any` cast with an explicit `ScrollSpyOptions` interface.
- **VibeToast / VibeToastHost** — consolidated to a single `Teleport` with a `toastAttrs` spread; removed an unnecessary class cache.
- **VibeSkeleton** — `$attrs` now propagate to every text line, not just the first.

---

# Detailed History

> Per-commit Code Review (CR5–CR9) and audit notes, grouped by review batch rather than release. The user-facing summary for the current release is under [1.1.0] above.

---

## CR7 Follow-Up (2026-06-26)

- **VibeFormInput: `(optional)` indicator on standalone label** — VibeFormGroup already showed both `*` for required and `(optional)` for non-required (WCAG 3.3.2). VibeFormInput's standalone label (used outside VibeFormGroup) only showed `*`. Aligned: required gets `aria-hidden="true"` on `*` plus a `visually-hidden` "required" span for screen readers; non-required gets an `aria-hidden` `(optional)` span for sighted users. (ea0b555)

---

## P0 Bug Fixes (2026-06-26)

### Mouse Pointer Issue — VibeIcon / VibeBreadcrumb / VibeListGroup (593858b)

Hovering over Bootstrap Icon glyphs inside nav-links and breadcrumbs switched the cursor from pointer (hand) to the text cursor (I-beam), because `<i class="bi">` renders via a CSS font whose glyph characters are treated as selectable text by the browser.

- **VibeIcon**: Added `cursor: inherit` and `user-select: none` to the element's computed style. `cursor: inherit` defers to the parent element's cursor (pointer inside `<a>`/`<button>`); `user-select: none` prevents the glyph character from being treated as selectable text.

- **VibeBreadcrumb**: Items without `href` or `to` (non-active) previously rendered as `<span>`, which has no pointer cursor. Now renders as `<button type="button">`, which receives pointer cursor from the UA stylesheet and is keyboard-accessible.

- **VibeListGroup**: Items without `href` or `to` rendered as `<li>` and missed Bootstrap's `list-group-item-action` class (hover background, focus styles). Now all interactive (non-disabled) items receive `list-group-item-action`; plain `<li>` items also receive `cursor: pointer` via inline style, since Bootstrap's class alone does not set it on non-anchor/non-button elements. Disabled items receive neither.

---

## Code Review 9 — Comprehensive Vue 3 / TypeScript Audit (2026-06-25)

22 issues audited. CR9-7 (chart deep-watch) deferred per CR5; CR9-21 (FormSelect vi: prefix) deferred; CR9-23 confirmed not a bug.

### HIGH

- **CR9-7 — VibeChartBar / VibeChartLine / VibeChartPie: remove `{ deep: true }` from data watch** — With `{ deep: true }`, every nested mutation to a reactive dataset (e.g. `push()`) triggered a full canvas repaint synchronously. N sequential mutations produced N full repaints. Replaced with a shallow watch: `redraw()` fires only when the `data` prop reference is replaced. Consumers must use immutable updates (`data = { ...data, datasets: [...updated] }`). (45b6d21)

### MEDIUM

- **CR9-13 — VibeNavbarToggle: remove `getOrCreateInstance` when navbar context present** — Calling `Bootstrap.Collapse.getOrCreateInstance()` alongside `navbar.toggleCollapse()` created a parallel uncontrolled Bootstrap instance outside VibeCollapse's lifecycle. When navbar context is injected, delegate exclusively to `navbar.toggleCollapse()`; keep direct Bootstrap call only for standalone use. (c44dc61)

- **CR9-14 — VibeDropdown: replace `itemClassMap` computed Map with `getItemClass` fn** — The computed Map allocated a new Map and re-evaluated all item class strings on every `props.items` change. An inline function lets Vue's per-item reactivity handle dirty-checking naturally. (08f2442)

- **CR9-15 — VibeAutocomplete: ArrowUp at first item no longer wraps to last** — WAI-ARIA combobox requires ArrowUp at first option to be a no-op. The `<= 0` condition wrapped index 0 back to `results.length - 1`. Fixed: `Math.max(0, index - 1)`. (00dc514)

- **CR9-16 — VibeTooltip / VibePopover: cache `isTouchDevice` once at setup** — `computedTrigger` called touch-detection DOM APIs on every re-evaluation. Touch capability doesn't change mid-session; replaced function with a setup-time `const`. (a8369f1)

- **CR9-17 — VibeToast: consolidate to single Teleport with `toastAttrs` spread** — Replaced separate `v-if noContainer` / `Teleport v-else` branches with a single Teleport (disabled when appropriate). Extracted `.toast` div attributes into `toastAttrs` computed via `v-bind`. (e2dc92a)

- **CR9-18 — VibeToastHost: remove `containerClassCache` Map** — The Map was unnecessary for 6 fixed placement values; replaced with a plain inline function. (e2861dd)

- **CR9-19 — VibeSkeleton: apply `$attrs` to all text lines** — `v-bind` was conditional on `i === 1`; consumer `class`/`data-*`/listeners silently dropped from lines 2+. (f142d33)

- **CR9-20 — VibeDataTable: `isUnmounted` guard in search debounce callback** — `clearTimeout` already prevents the callback from firing after unmount, but added `isUnmounted` flag as defense-in-depth against Vue DEV warnings. (a55eeaa)

### LOW

- **CR9-22 — VibeHero: `overlayOpacity` prop for customizable overlay** — `overlay: true` hardcoded `rgba(0,0,0,0.5)`. New `overlayOpacity: Number` prop (default 0.5, clamped to [0,1]) exposes control. (816e53c)

### Docs Audit Fixes

- **VibeAlert variant prop typed as `Variant` union** — Source used plain `String`; aligned with documented API. (6e3f02f)

### CRITICAL

- **CR9-1 — VibeDropdown / VibeNav: `routeKey()` for object `to` values** — `String(item.to)` produced `'[object Object]'` for every object-typed route, collapsing all into the same Vue key. Extracted `routeKey()` utility using `JSON.stringify` for objects. Regression tests added to both components. (commits via routeKey.ts + component patches)

- **CR9-2 — VibeAutocomplete: try/catch around async source** — Unhandled rejection left `results` stale with the dropdown open. Catch clears results and closes the listbox; stale-token check applies on the catch path too.

- **CR9-3 — VibeFormWysiwyg: try/catch in isMobile setTimeout callback** — Async setTimeout bodies swallow exceptions silently. Wrapped entire cleanup/reinit body in try/catch; failures emit `component-error`. (e502165)

- **CR9-4 — VibeAccordion: `seenIds` Set guard for duplicate `item.id`** — `Map.set(id, ...)` silently overwrote the first entry on duplicate ids. Added per-`initItems` `seenIds` Set with `console.warn` naming the duplicate. (d3d3f2a)

- **CR9-5 — VibeAccordion / VibeNav: `reinitGuard` in prop watchers** — Rapid prop changes fired concurrent async watcher bodies; both ran disposal then reinit, creating a window where the second disposal could clear instances the first init just created. Added `reinitGuard` with try/finally, mirroring VibeDropdown's existing pattern. (0b38653)

### HIGH

- **CR9-6 — VibeAutocomplete: DEV warning when object items used without `itemText`** — `labelOf` fell through to `String(item)` → `'[object Object]'` for object types without `itemText`. Added one-time `console.warn` per instance. (be99658)

- **CR9-8 — VibeFormWysiwyg: reset `loadError` at start of `initQuill`** — `loadError` was set on failure but never cleared before the next attempt. Reset at the top of `initQuill` so any subsequent successful call removes the error banner. (fd5f9f3)

- **CR9-9 — VibeScrollspy: `ScrollSpyOptions` interface replaces `as any`** — `smoothScroll` was not in Bootstrap's bundled `ScrollSpy.Options`. Defined explicit `ScrollSpyOptions` interface and cast the constructor cleanly. (a8debca)

- **CR9-10 — VibeDataTable: CSS class sort icons + `aria-sort` on `<th>`** — Unicode `⇅`/`↑`/`↓` can render as tofu on some OS/font combinations and convey no information to screen readers. Replaced with CSS `::before` content on `.vibe-sort-icon` spans; added `aria-sort` attribute (`none`/`ascending`/`descending`) to sortable `<th>` elements. (9cca67e)

- **CR9-11 — VibeTabs: `visited.delete(name)` in `unregister`** — The `visited` Set tracked tabs that had ever been active but was never cleaned. Remounted tabs with `lazy:true` rendered immediately because `hasBeenActive` returned true from stale state. (89f029b)

- **CR9-12 — VibeFormCheckbox: `filter` instead of `indexOf+splice` for array uncheck** — `splice` only removed the first occurrence of `props.value`. Replaced with `.filter(v => v !== props.value)` to remove ALL occurrences. (c015a8a)

---

## Code Review 8 — Vue 3 / TypeScript Audit (2026-06-25)

10 issues audited across VibeFormWysiwyg, VibeCollapse, VibeAccordion, VibeDataTable, VibeAlert, VibeCarousel, VibeSortable. CR8-9 (VibeToastHost private import) intentional coupling, no fix.

### HIGH

- **CR8-1 — VibeFormWysiwyg: remove static quill import** — Top-level `import Quill from 'quill'` caused build failures when quill is not installed. Deleted; all usage is via `await import('quill')` inside `initQuill`. (d54a7e7)

- **CR8-2 — VibeCollapse: add `isUnmounted` guard after async import** — Bootstrap.Collapse was constructable on detached DOM if the component unmounted during the async import. Added `isUnmounted` flag + guard; consistent with every other Bootstrap component. (f4735d8)

- **CR8-3 — VibeAccordion: add `isUnmounted` flag and post-import guard** — Same pattern as CR8-2; `initItems` had no unmount guard at all. (2ee048c)

### MEDIUM

- **CR8-4 — VibeDataTable: replace `getCurrentInstance()` with `clickable` prop** — `getCurrentInstance()` is an internal Vue API, SSR-incompatible, and captures at setup time. Replaced with an explicit `:clickable="true"` prop; rows still emit `row-clicked` unconditionally. (d95cddf)

- **CR8-5 — VibeAlert: dispose stale instance before reinit on rapid toggle** — On rapid `modelValue` false→true, the old Bootstrap.Alert (close animation in flight) blocked new init. Dispose before guarding. (5f76235)

- **CR8-6 — VibeAccordion: wrap async watcher body in try/catch** — Vue ignores the Promise returned by async watchers; any throw became an unhandled rejection. Wrapped in try/catch with `emit('component-error', ...)`. (8038cbf)

### LOW

- **CR8-7 — VibeCarousel: `CarouselEvent` interface for Bootstrap slide events** — Replaced `event: any` parameters on `onSlide`/`onSlid` with `CarouselEvent { from, to, direction }`. (0ccd863)

- **CR8-8 — VibeSortable: add `Record<string,unknown>` constraint to generic** — Unconstrained `T` made `item[itemKey]` unresolvable without `as any`. Constraining T removes the cast. (bffca44)

- **CR8-9 — VibeToastHost: imports private `__toastStore`** — Intentional coupling; `__toastStore` cannot be made public without breaking the module boundary. No fix.

- **CR8-10 — VibeFormWysiwyg: remove empty selection-change handler** — Dead no-op registered on `quill.on('selection-change')`. Removed declaration, registration, and both cleanup blocks. (11a426b)

---

## Code Review 7 — a11y Sprint (2026-06-25)

15 WCAG accessibility issues across `VibeModal`, `VibeFormGroup`, `VibeButton`, and `VibeFormInput`. All shipped with Vitest coverage; two acceptance criteria (Playwright screenshot + axe-core manual) remain as follow-ups.

### VibeModal

- **Auto-focus first focusable field on open (WCAG 2.4.3)** — `shown.bs.modal` now queries the first focusable descendant and calls `.focus()`. `autoFocus` prop (default `true`) allows opt-out. Re-opening after close re-focuses. (d253a83)

- **Focus trap + `inert` background (WCAG 2.1.2)** — On `shown.bs.modal`, sibling elements of the modal container are marked `inert`; Tab/Shift+Tab cycle is intercepted to wrap within modal focusables. `inert` is cleared on `hidden.bs.modal` and `onBeforeUnmount`. (7f43312)

- **`Cmd/Ctrl+Enter` submits form (WCAG 2.1.1)** — `keydown` handler inside the modal calls `form.requestSubmit()` on the first `<form>` descendant when `metaKey`/`ctrlKey` + `Enter` is detected. `submitOnMetaEnter` prop (default `true`) allows opt-out. (d6113ef)

### VibeFormGroup

- **`id`/`for` linkage between label and input (WCAG 1.3.1, 4.1.2)** — `VibeFormGroup` generates a unique ID via `useId()`, passes it to `<label for>`, and injects it for child `VibeFormInput` to consume via `provide`/`inject`. Multiple instances on the same page get unique IDs. (d31e350)

- **`aria-describedby` wires help text and error to input (WCAG 1.3.1, 3.3.1)** — `VibeFormGroup` provides `helpId` and `feedbackId` computeds; `VibeFormInput` builds a deduplicated `aria-describedby` attribute pointing at both. Works standalone (own `helpText`/`validationMessage`) and inside a group (group-level IDs). (64bd32e)

- **Required / optional label indicator (WCAG 3.3.2)** — `required: true` on `VibeFormGroup` renders a red `*` (`aria-hidden`) plus a visually-hidden "required" span. `required: false` (default) renders gray "(optional)" (`aria-hidden`). Both label branches (standard and floating) updated. (11e1beb)

- **`role="alert"` on invalid-feedback (WCAG 4.1.3)** — The `.invalid-feedback` div gains `role="alert"` when `validationState === 'invalid'`, so new errors are announced by screen readers without requiring focus. (f0ecea9)

### VibeFormErrorSummary (new component)

- **Top-of-form error summary (WCAG 3.3.1)** — New `VibeFormErrorSummary` component renders a `role="alert" aria-live="polite"` block listing all non-empty errors with anchor links. Clicking a link emits `focus(key)` for the consumer to focus the field. Auto-appears on first error, disappears when all errors clear. Registered globally via the plugin. (ef16be6)

### VibeButton

- **Disabled state contrast ≥ 4.5:1 (WCAG 1.4.3)** — Scoped CSS override targets `.btn:disabled, .btn.disabled` with `--bs-body-color` / `--bs-tertiary-bg` / `--bs-border-color` at `opacity: 1`, replacing Bootstrap's 0.65 fade that drops contrast to ~2.8:1. Tokens flip automatically in dark mode. (852e514)

- **DEV warning for icon-only buttons missing `aria-label` (WCAG 4.1.2)** — In `import.meta.env.DEV`, slot VNodes are inspected; if the slot contains content but no text string and neither `aria-label` nor `aria-labelledby` is present on `$attrs`, `console.warn('[VibeButton] …')` fires. (ecfd8eb)

### VibeFormInput

- **Placeholder contrast ≥ 4.5:1 (WCAG 1.4.3)** — Scoped `input::placeholder` rule forces `color: var(--bs-secondary-color); opacity: 1`, replacing browser-default ~0.6 alpha (~2.6:1). Bootstrap's `--bs-secondary-color` token resolves to `#6c757d` (light) / `#adb5bd` (dark) — both ≥ 4.5:1 on their respective body backgrounds. (70438ee)

- **Show-password toggle (UX / a11y-adjacent)** — `showToggle` prop (default `false`) wraps the password input in `.input-group` and appends a `<button>` that toggles `type` between `password` and `text`. Button carries `aria-label` ("Show/Hide password") and `aria-pressed` state. (2e3b9bd)

- **Password-strength meter (UX)** — `showPasswordStrength` prop (default `false`) renders a 4-segment Bootstrap-styled bar and an `aria-live="polite"` region announcing "Password strength: Weak/Fair/Good/Strong". Strength is computed from length tiers, case diversity, digits, and special characters. Updates reactively on every input event. (84af6e1)

- **Typed `autocomplete` enum + auto-detect (WCAG 1.3.5)** — New `AutocompleteType` union type covers all WHATWG autocomplete tokens. `autocomplete` prop defaults to auto-detection: `type="email"` → `"email"`. Consumers override with any token or opt out with `"off"`. All three input render paths bind `:autocomplete`. (2e8dca7)

- **`inputmode` prop with auto-detect (WCAG 2.1.1 / mobile UX)** — New `InputMode` union type. `inputmode` prop defaults to type-based auto-detection: `number` → `decimal`, `email` → `email`, `tel` → `tel`, `url` → `url`, `search` → `search`. Consumers override explicitly. (2e8dca7)

---

## VibeNav item slot (2026-05-30)

### Added

- **`VibeNav` — `#item` scoped slot** (`{ item, index }`) for custom nav-link content, e.g. an icon beside the label. `nav.md` already documented this slot but the component didn't implement it; it now matches the doc and is consistent with the `#item` slots on `VibeListGroup` and `VibeDropdown`. The album example's category nav uses it to restore per-item icons. Found via a full docs-vs-components audit.

---

## VibeHero component (2026-05-30)

### Added

- **`VibeHero`** — a new hero/banner section component covering the Bootstrap 5.3 hero patterns (centered, two-column, dark, bordered) plus full-bleed background-image and gradient heroes. Reuses the existing prop vocabulary for consistency: `variant`/`textVariant`/`border` (as `VibeCard`), `fluid` (as `VibeContainer`), and `safeHref`/`safeLength`/`safeColor` sanitization for `bgImage`/`minHeight`/`overlay`. Gradients are validated to `*-gradient(...)` only. Used to replace the hand-rolled hero sections in the album and starter examples.

---

## VibeCard section classes (2026-05-30)

### Added

- **`VibeCard` — `headerClass` / `bodyClass` / `footerClass` props.** The header/body/footer wrapper divs previously had a fixed class, so a variant-colored header (e.g. `bg-primary text-white`) or extra body padding couldn't be expressed and consumers had to drop to a raw `.card`. These props add per-section class hooks. Used to convert the pricing example's highlighted-plan card from raw markup back to `VibeCard`.
- **`VibeCard` — `image` slot.** A direct card child rendered outside `.card-body` (before the header), for a card image with custom composition (e.g. a `card-img-top` with an absolutely-positioned overlay/badge). Used to convert the album example's photo cards from raw markup back to `VibeCard`.

---

## Packaging (2026-05-29)

### Fixes

- **Dependency declarations corrected for consumers.**
  - `vue` removed from `dependencies` (it was listed in both `dependencies` and `peerDependencies`). A Vue component library must declare vue peer-only; a hard `dependencies` entry risks a duplicate Vue runtime in consumer apps. It remains a `peerDependency` (`^3.5.0`) and is pinned in `devDependencies` for local dev/test.
  - `bootstrap` added as a **required** `peerDependency` (`^5.3.0`). The library dynamically imports `bootstrap` at runtime but previously declared it nowhere, so consumers got no install signal. npm now resolves it automatically.
  - Optional peers `quill` / `dompurify` / `bootstrap-icons` added to `peerDependencies` with version ranges. They were marked optional in `peerDependenciesMeta` but absent from `peerDependencies`, so npm did not treat them as peers at all; the optional flag now applies. Verified via `npm pack` + a clean-consumer install: required peers (vue, bootstrap) auto-resolve, optional peers are skipped.

---

## E2E Browser Testing (2026-05-29)

### Testing

- **Vitest browser mode (Playwright / Chromium)** — Added a second Vitest project (`browser`) that runs real headless Chromium via `@vitest/browser-playwright`, sharing the same Vite 8 pipeline. It exercises the real Bootstrap JS + Quill integration paths the happy-dom unit suite mocks or cannot run: Modal/Offcanvas/Toast lifecycle + focus return, Tooltip/Popover/Dropdown Popper positioning, Collapse/Accordion/Carousel/Scrollspy, and VibeFormWysiwyg Quill init + DOMPurify sanitize. The `bootstrap` mock alias is scoped to the `unit` project only. New `test:browser` / `test:all` scripts and a required CI `e2e` job; `test` / `test:run` / `test:coverage` are pinned to `--project unit` so the inner loop carries no browser cost. (2f91961, 7649f05, a2147bd, b2b91f6, ea343d6, 6ebeb88, 7c54a8e)

### Fixes

- **VibeFormWysiwyg teardown race** — On unmount (and the mobile-toolbar rebuild), Quill's scroll `MutationObserver` fired against DOM Vue was removing and read `selection.lastRange` after `selection` was nulled, throwing `Cannot read properties of null`. Timing-dependent; it intermittently failed both the unit and browser runs. Fixed by disconnecting `quill.scroll.observer` before teardown in both paths. Surfaced and regression-guarded by the new browser suite. (1805cbb)

---

## Code Review 7 (2026-05-29)

### Tooling

- **tsconfig** — Enabled `verbatimModuleSyntax` (TS6 library best practice; codebase already used `import type` consistently — zero changes needed). (f6cebcd)

### Architecture

- **Form controls → `defineModel()`** — VibeFormInput/Textarea/Switch/Select/Checkbox/Radio/Spinbutton/Datepicker migrated from the manual `modelValue` prop + `update:modelValue` emit to the Vue 3.4+ `defineModel()` idiom (validators forwarded via options). Bootstrap-visibility components keep manual modelValue (internal isVisible decoupling). No consumer-facing change. (c822886)

### Reactivity

- **Bootstrap/Quill instances → `shallowRef`** — VibeModal/Offcanvas/Toast/Carousel/Tooltip/Popover/Dropdown/Scrollspy/Collapse/Alert (`bs*`) and VibeFormWysiwyg (`quillInstance`) held their third-party instance in `ref()`, deep-proxying DOM/Popper internals (overhead + broken element identity for Popper-based components). Switched to `shallowRef`. (077e65b)

---

## Performance Audit (2026-05-29)

### Bundle Size

- **package.json** — Added `"sideEffects": ["**/*.css"]` so consumer bundlers can tree-shake unused components (Vue SFC scoped CSS is the only side effect). Verified with esbuild against `dist`: `import { VibeButton }` → ~106 KB vs ~939 KB full import (~89% reduction). (d05b129)

### Runtime

- **VibeNavbarNav** — Changed the `items` watcher from `{ deep: true }` to `{ deep: false }`. Dropdown presence depends on array identity, not leaf values; replacing the array still rebuilds, while leaf mutations no longer trigger a full deep traversal + dropdown teardown/reinit. (e82b570)
- **VibeFormWysiwyg** — `loadDOMPurify()` now starts synchronously at `initQuill` entry (parallel with Quill, independent of its resolution) so the sanitizer is ready sooner and init is deterministic. (8243675)

### Tooling

- **CI** — Run on Node 24; bumped `actions/checkout` and `actions/setup-node` to v5 (Node 20 actions deprecated). (8fde2b4)
- **TypeScript** — Migrated to TS 6.0.3: `moduleResolution` Node→Bundler (node10 is a hard error in TS6 / removed in TS7), `process` SSR guard read off `globalThis`, and types entry repointed to `dist/src/index.d.ts` (dts@4 emit layout under TS6+Bundler). vue-tsc 3.2.5 + vite-plugin-dts 4 verified compatible. (bf2ce7d)

---

## Code Review 6 — follow-ups (2026-05-29)

### Low (sweep)

- **VibeAlert** — Removed redundant `isDismissible` computed; reference `props.dismissible`/`dismissible` directly. (6a985f6)
- **VibeFormWysiwyg** — Event-handler refs (`blur`/`focus`/`text-change`/`selection-change`) switched from `ref()` to plain `let` (imperative use only; no reactivity needed). (9832ae9)
- **VibeDatePicker** — `validateIsoString` DEV-guarded and no longer logs the raw `min`/`max` value (PII-leak avoidance). (648f76f)
- **chartTooltip** — Cap label length (60 chars + ellipsis) so a long user label can't overflow the tooltip. (be39e12)
- **useToast** — DEV-SSR warning that the module-singleton store needs `resetToastStoreForSSR()` per request. (5526a45)
- **VibeStepper / VibePagination** — Stable `v-for` keys (step label / page number) instead of array index. (dff0f99)
- **VibeToastHost** — Memoized `containerClassFor` over the finite placement set. (49ca4ae)
- **VibeDropdown** — Memoized item classes into a computed Map (tracks active/disabled). (ec9bf49)
- **VibeDatePicker** — Hoisted `todayIso` out of the `monthGrid` computed (no per-navigation `new Date()`). (eb53c41)
- **VibePagination** — Dropped redundant `aria-disabled` on native disabled buttons. (dee38f2)

### Performance

- **VibeAutocomplete, VibeChartBar/Line/Pie** — Replaced positional `v-for` index keys with stable keys (autocomplete: `labelOf(item)` + idx; chart legends: `ds.label ?? i` / `label ?? i`) so filtered/reordered lists patch the correct DOM nodes. (2c95d23)
- **VibeCarousel** — Stable `v-for` keys (`item.src ?? index`) for indicators and slides so Bootstrap carousel state stays in sync with the DOM on reorder. (e490502)
- **VibeListGroup** — Stable `v-for` key (`item.href ?? item.text ?? index`) so `v-memo` is not negated by index-key mis-diffing on reorder. (990d869)
- **VibeResizable** — Pre-bound a per-handle pointerdown handler map (over the fixed handle set) instead of an inline arrow per handle per render. (3646d06)
- **VibeSlider** — Pre-bound the two handles' keydown/pointerdown handlers in setup instead of four inline arrows per render. (d1c3621)
- **VibeSortable** — Row index via `data-sortable-index` + unified `onDragStartEvt`/`onDropEvt` reading `currentTarget.dataset`, replacing 2N inline arrows per render. (c61f19c)
- **VibeDataTable** — Memoized column `thStyle`/`tdStyle` into `computed` Maps keyed by column (rebuilt only on columns/sortable change), so reference-compared `:style` no longer re-patches unchanged cells every render. (0b479cb)
- **VibeDataTable** — Memoized sort icons into a `sortIconMap` computed keyed by column (rebuilt only on sort-state/columns change) instead of a per-header-cell function call each render. (8cad34c)
- **chartTooltip** — Reuse the per-move `getBoundingClientRect` in `drawTooltip` instead of measuring twice per mousemove (not cached across moves — `left/top` shift on scroll). (69a8833)
- **VibeChartBar / VibeChartLine** — Precompute hit-test scalars (`getMaxVal` / `getLineExtent`) once per data change in `redraw()` and pass them into the hit-test closures, instead of an O(datasets×points) scan on every mousemove. (de2539b)

### Architecture

- **VibeSkeleton** — Added `inheritAttrs: false` + explicit `v-bind="$attrs"` on each variant root. The multi-root `text` fragment previously dropped consumer attrs (class, data-*, listeners) with a dev warning; all variants now forward them consistently. (82fef87)

## Code Review 6 (2026-05-28)

### CRITICAL

- **VibeFormCheckbox, VibeFormSelect, VibeFormTextarea** — Removed `.value` from template expressions (`helpId.value` / `feedbackId.value`). Vue auto-unwraps computed refs in templates; `.value` double-dereferenced to `undefined`. (94d8a3d)

### HIGH

#### Reactivity / Lifecycle

- **VibeTooltip, VibePopover** — Added `isUnmounted` flag to guard against Bootstrap constructor on detached elements. (ec26b3c)
- **VibeCarousel** — Added `isUnmounted` guard post-await in `initCarousel`. (58d833c)
- **VibeModal, VibeOffcanvas** — Added `isUnmounted` guard after `await import('bootstrap')`. (ed9d4af)
- **VibeFormWysiwyg** — Added `isUnmounted` guard after `await import('quill')`. (ce005c4)
- **VibeNav, VibeScrollspy, VibeDropdown** — Added `isUnmounted` guard + `finally { initInFlight = false }` to prevent permanent re-init block. (c95457a)
- **VibeAccordion** — Snapshot `bsCollapses` keys before loop iteration to avoid mutation-during-iteration; added `await nextTick()` before `initItems()`. (019bf25)

#### Security

- **VibeLink, VibeBreadcrumb, VibeListGroup, VibeNav, VibeDropdown, VibeNavbarBrand** — Added `safeHref()` utility with protocol allowlist (`https?://`, `/`, `./`, `../`, `#`) to prevent `javascript:` injection. (9944403)
- **VibeFormWysiwyg** — Added DOMPurify sanitization before Quill convert and before `update:modelValue` emit from `getSemanticHTML()`. Added DOMPurify as peer dependency. (4bde8ac)

#### Architecture

- **All form components + VibeNavbar, VibeTabs** — Replaced string-keyed `provide`/`inject` with typed `InjectionKey<T>` symbols in `src/injectionKeys.ts`. (d2638d5)
- **All ~35 components** — Migrated `defineEmits` from runtime string-array to typed tuple syntax; extracted `ComponentError` interface to `types.ts`. (e215ee9)
- **VibeFormCheckbox, VibeFormSelect** — Replaced `PropType<any>` on `modelValue` with typed interface syntax. (612bba1)

#### Edge Cases

- **VibeModal, VibeOffcanvas** — Capture `document.activeElement` on show, restore on hidden (WCAG 2.1 SC 2.4.3 focus return). (7db9861)
- **VibePopover, VibeTooltip** — Added SSR guard for `navigator.maxTouchPoints` (`typeof navigator !== 'undefined'`). (ec26b3c)
- **VibeSlider** — Gated all `window.addEventListener`/`removeEventListener` calls with `typeof window !== 'undefined'`. (7104598)
- **chartResize.ts** — Added `typeof ResizeObserver !== 'undefined'` guard before `new ResizeObserver()`. (7104598)
- **VibeCarousel** — Skip Bootstrap init when `items` is empty (avoids handing Bootstrap an empty `.carousel-inner`); added `v-if="item.src"` so a src-less slide does not render an `<img>` resolving to the page URL. (d2ffc26)
- **VibeFormSpinbutton** — Added `safeStep` coercion (non-finite or non-positive `step` → 1, with DEV warn) so `step=NaN` no longer propagates NaN into the model and `step=0` no longer makes the buttons inert. (4368d94)

### MEDIUM

#### Reactivity / Lifecycle

- **VibeCollapse** — Removed dead `watch(bsInitialized, ...)` block (always fires with `pendingState = null`). (a7e8523)
- **VibeSortable** — Removed dead `document.removeEventListener('dragend', clearDrag)` before `addEventListener` (own closure, never removes anything). (22eb03f)
- **useColorMode.ts** — Fixed `clearColorMode()`: re-attach system theme listener after detaching. (8ba77fc)
- **VibeToast** — Added `&& isVisible.value` guard to `hide()` watcher branch to prevent event storm from `bsToast.hide()` on already-hidden toast. (a59f417)
- **VibeFormWysiwyg** — Set `quillInstance.value = null` before clearing `innerHTML` in mobile reinit to prevent Quill observers firing against removed DOM nodes. (ce005c4)
- **VibeAutocomplete** — Added `if (!isOpen.value) return` guard at top of ArrowUp handler branch. (f73d48a)
- **VibeSortable** — Clear `draggingIndex` on `onActivated()` for KeepAlive reactivation. (8dd81ba)
- **VibeProgress** — `Math.max(0, Number.isFinite(bar.value) ? bar.value : 0)` to prevent `width: NaN%`. (8dd81ba)
- **VibePagination** — Added validator for `currentPage` range and integer check with DEV warn. (8dd81ba)
- **VibeDatePicker** — Fixed `fromIso("")` producing nonsense date; fall back to today with DEV warn. (8dd81ba)

#### Security

- **VibeIcon** — Validated freeform `color` and `fontSize` style props against allowlist regex (hex, rgb, hsl, var(--*), named colors; numeric length units). (4889cb6)
- **VibeScrollspy, VibeFormWysiwyg** — Validated freeform `height` style prop with pattern `/^(auto|[\d.]+(%|px|rem|em|vh|vw))$/`. (4889cb6)
- **VibeDataTable** — Added `sanitizeCssObject()` to filter `thStyle`/`tdStyle` column configs to safe property allowlist. (4889cb6)
- **VibeProgress** — Validated freeform `height` style prop via `safeLength()` (CSS-injection defense; missed from the initial CSS-prop sweep). (fccae67)
- **VibeModal, VibeToast, VibeOffcanvas, VibeTooltip, VibePopover, VibeCarousel, VibeAccordion, VibeNav** — Renamed exposed `bsInstance` to `_unsafe_bsInstance` (preserves power-user access with clear naming). (d50da44)

#### Architecture

- **VibeFormWysiwyg** — Fixed `consumeId` bypass: added `consumeId` to inject shape to prevent duplicate `id` attributes when multiple form components share a group. (d2638d5)
- **VibeBadge, VibeCard, VibeRow, VibeCol, VibeSpinner, VibePlaceholder, VibeButtonGroup, VibeNavbar, VibeNavbarBrand, VibeProgress, VibeContainer** — Removed dead `component-error` emits from pure display components with no async code paths. (4b48dbe)
- **VibeAccordion** — Added per-item DEV warn for CSS-special chars (`.`, `:`, `[`) in `item.id` values used as `data-bs-target` selectors. (4241ca4)
- **VibeCarousel, VibeCollapse, VibeDropdown, VibeModal, VibeOffcanvas** — Hoisted `useId()` out of the `defineProps` default factory into setup body (`computed(() => props.id || _generatedId)`); matches the rest of the library and avoids Vue-version-fragile prop-default evaluation. (5017cee)
- **VibeButton, VibeCloseButton, VibeIcon, VibeFormSelect, VibeFormSpinbutton, VibeFormWysiwyg** — Resolved 10 latent `vue-tsc` type errors (handler `MouseEvent` typing, `FormSelectOptionValue` union, increment/decrement `(value: number)` payloads, optional `destroy` on the Quill interface). `vue-tsc --noEmit` now reports zero errors. (054fe1b)

#### Performance

- **VibeChartBar, VibeChartLine, VibeChartPie** — Moved `getComputedStyle()` color resolution out of a reactive `computed` into a `ref` refreshed in `onMounted`/`redraw()` (RAF context), eliminating per-dependency-change forced layout reads. (8473d7d)
- **useForm** — Replaced whole-object `JSON.stringify(fields)` dirty detection with precomputed per-field initial JSON + `.some()` short-circuit, so a single changed field no longer serializes the entire form on every keystroke. (9e568e5)
- **VibeFormWysiwyg** — Debounced the breakpoint-driven Quill rebuild (250ms trailing edge) so a resize burst across the mobile breakpoint coalesces into one rebuild; timer cleared on unmount. (982d022)

### Tooling & Docs

- **Build** — Upgraded Vite 7 → 8 (Rolldown bundler); build + 914 tests verified. TypeScript 6 and vite-plugin-dts 5 held back (require a dedicated migration). (8dc5122)
- **CI** — Added `.github/workflows/ci.yml` (build + `vitest run` on Node 20, push/PR); replaced the hand-typed static test badge with the live Actions status badge. (e784a3c)
- **Docs** — 1.0 best-practices sweep across all 66 docs verified against source; new `docs/getting-started/starter-template.md`. README rewritten as a 1.0 product pitch with accurate per-component descriptions. (847ee91, ec8f816)

---

## Code Review 5 (2026-05-18)

### Pre-1.0 Release Checklist

- **chartTooltip.ts** — Fixed HIGH perf bug via overlay canvas. (4c9a923)
- **docs/ + llms.txt** — Refreshed for `uncheckedValue` prop (VibeFormCheckbox), `isValid=false` before validation (useForm), `disabled` HTML attr on VibeNav button items.
- **CHANGELOG.md** — Created with full v1.0.0 entry including breaking changes.
- **package.json** — Bumped to `1.0.0`.
- **VibeSortable** — Added inline `<!-- NOTE -->` documenting dndStore incompatibility.

### CRITICAL

- **useFormValidation.ts** — Fixed `if (!value)` skipping validators for `0` and `false`; changed to explicit `null/undefined/''` check. (7cdfa69)
- **VibeDatePicker** — Hoisted `useId()` from computed getter to setup level to prevent new ID on each re-eval. (dad8388)
- **VibeFormGroup** — Added missing `:id="feedbackId"` to valid-feedback divs. (47ce1b6)
- **VibeSortable** — splice index: investigated, confirmed correct (drop on item inserts after it). FALSE POSITIVE — no change.
- **VibePopover** — Added missing `initInFlight` guard. (745157c)
- **VibeTooltip** — Added missing `initInFlight` guard. (745157c)
- **VibeAutocomplete** — Changed `@mousedown.prevent` to `@click` to prevent blocking blur. (e3058e5)
- **VibeAutocomplete** — Added `isUnmounted` guard to prevent post-unmount state writes. (e3058e5)
- **VibeToast** — Fixed double-dispose crash: null `bsToast` before await gap. (1c0fe58)
- **VibeNavbarToggle** — Removed `data-bs-toggle` attribute that caused double Bootstrap toggle. (2be42b2)
- **VibeNavbarToggle** — Vue state flip: investigated, catch block already reverts state. FALSE POSITIVE — no change.
- **VibeDataTable** — Fixed duplicate fallback row keys across pages; globally unique key now. (9bd5cf1)
- **useColorMode.ts** — Listener leak: investigated, `detachSystemListener()` removes listener before nulling. FALSE POSITIVE — no change.
- **VibeFormCheckbox** — Fixed `indeterminate` IDL-only property: added watch + JS property setter. (20fcc68)
- **VibeFormSpinbutton** — Removed duplicate `@blur`/`@focusout` that double-fired validate. (a7b079f)
- **VibeAlert** — Added `initInFlight` + `isUnmounted` guard for `close()` before await resolves. (c2a498b)

### HIGH

- **chartResize.ts** — Fixed RAF reading stale `contentRect` via `pendingEntry` ref inside RAF. (ac59b12)
- **drawLine.ts** — Fixed smooth bezier excluding 2-point datasets; changed condition to `>= 2`. (6a6aa62)
- **drawBar.ts** — Fixed `getMaxVal` seed `1` breaking negative-only data; changed to `0 || 1`. (bbf14a4)
- **drawBar.ts** — Fixed `hitTestBar` negative-value hit region with `Math.max(0, v)`. (bbf14a4)
- **VibeFormSelect** — Missing `:id="feedbackId"`: investigated, already present. FALSE POSITIVE — no change.
- **VibeFormCheckbox** — Missing `:id="feedbackId"`: investigated, already present. FALSE POSITIVE — no change.
- **VibeFormCheckbox** — Added `uncheckedValue` prop to replace hardcoded `false` on uncheck. (664a872)
- **VibeFormGroup** — Fixed `helpText` hidden when `validationMessage` present causing orphaned `aria-describedby`; now always renders helpText div. (e4f72ad)
- **VibeFormInput** — Fixed `noWrapper` mode orphaned `aria-describedby` IDs via conditional omission. (011c53c)
- **VibeFileInput** — Disabled click: investigated, `openFileBrowser()` guards `disabled`; CSS sets `cursor: not-allowed`. FALSE POSITIVE — no change.
- **VibeFormWysiwyg** — Fixed `useId()` in prop default (shared ID), missing aria, no `initInFlight`. (0d52f26)
- **VibeAutocomplete** — Fixed `onFocus` querying when disabled. (e3058e5)
- **VibeScrollspy** — Added missing `initInFlight`; fixed `smoothScroll` prop not watched. (28edb7d)
- **VibeDropdown** — Added missing `initInFlight`. (5aa9757)
- **VibeAlert** — Added missing `initInFlight`. (c2a498b)
- **VibeSlider** — Removed stale `props.modelValue` read on pointerup. (98ae6b9)
- **VibeCarousel** — Fixed `activeIndex` not reset on items change. (49e7c50)
- **VibeResizable** — Fixed aspect ratio clamping invariant break; added `activePointerId`; replaced `process.env.NODE_ENV` with `import.meta.env.DEV`. (12e68c0)
- **VibeNavbarToggle** — Missing target DOM guard: SKIPPED (JSDOM tests use detached DOM; adding guard breaks tests without benefit in provide/inject architecture). Documented.
- **VibeDataTable** — Fixed `row-clicked` emitting page-local index; now emits global index. (929dee4)
- **VibeAutocomplete** — Fixed ArrowUp from no-selection no-oping; now wraps to last item. (e3058e5)
- **VibeListGroup** — Fixed `getItemTag` called 3× per render; added `v-memo` + inline tag logic. (2bc0bb3)
- **VibeIcon** — Fixed `aria-hidden` + `aria-label` mutually exclusive; now correct per usage. (20c5fcf)
- **useId.ts** — Removed `_resetIdCounter` from public API (was incorrectly exported). (e9cb997)

### MEDIUM

- **Charts hitTest stale closure** — Investigated: `props` is Vue reactive proxy, reads current value at call time. FALSE POSITIVE — no change.
- **VibeChartLine, VibeChartBar, VibeChartPie** — Fixed layout props (`showAxes`, `showGrid`, `smooth`, `fill`, `stacked`) not watched. (3853658)
- **VibeFormSpinbutton** — Fixed stale `props.modelValue` in increment/decrement, float drift, and validate not firing. (47ec01a, 19b1e3b)
- **VibeFormSelect** — Fixed options keyed by index → now key by value/text. (2cb5d7d)
- **useFormValidation.ts** — Added sequence counter concurrency guard for async validators. (be9585e)
- **useForm.ts** — Fixed `isValid` returning `true` before any validation; added `hasValidated` flag. ⚠️ BREAKING: `isValid` now returns `false` until first `validate()` call. (be9585e)
- **VibeDataTable** — Fixed `perPage=0` → `Infinity` totalPages; `Math.max(1, perPage)`. (c4a2ead)
- **VibeDataTable** — Fixed `onRowClicked` vnode detection failing for object-syntax listeners; also checks `onRow-clicked`. (3de34ed)
- **VibeAccordion** — Fixed `useId` per-instance, `alwaysOpen` watch, element refs in Map for safe dispose, DEV warning for CSS-special chars in id. (ac87dc1, 3de34ed)
- **VibeToast** — Moved `isVisible` set from animation start to `shown.bs.toast` completion. (80214bf)
- **VibeNav** — Fixed `getTabTarget` missing path+hash `to`; fixed deep watch full teardown; added missing `disabled` HTML attr. (80214bf)
- **VibeModal** — Fixed `aria-hidden="false"` → `undefined` when visible. (80214bf)
- **VibeTabContent** — Missing `tabindex`/`aria-labelledby`: investigated, already present. FALSE POSITIVE. Dead emits removed. (80214bf)
- **VibeStepper** — Added empty `steps[]` guard. (6953537)
- **VibeListGroup** — Fixed `aria-disabled="false"` on non-disabled items → absent when not disabled. (80214bf)
- **VibeScrollspy** — Fixed `smoothScroll=false` rendered as truthy string. (5605ed8)
- **VibeProgress** — Added accessible name; fixed multi-bar index key. (80214bf)
- **VibeDatePicker** — Fixed `min`/`max` change not re-validating; `watch(..., { immediate: true })`. (80214bf)
- **VibeBreadcrumb** — Replaced inline arrow fn per render with always-attached handler with internal guard. (80214bf)
- **index.ts** — Removed `_resetIdCounter` from public API. (e9cb997)
- **VibeTabContent** — Removed dead emits. (80214bf)

### LOW

- **Charts canvas** — Added `role="img" aria-label="Chart"` for accessible name. (f12048f)
- **VibeStepper** — Set `isUnmounted` in `onDeactivated`. (f12048f)
- **VibeIcon** — Added click guard for decorative icons in `handleClick`. (f12048f)
- **VibeLink** — Replaced `v-bind` ternary (new object per render) with separate `:to`/`:href`. (f12048f)
- **VibeTooltip, VibePopover** — Removed `data-bs-toggle` on wrapper causing double-init with Bootstrap data-api. (f12048f)
- **VibeSlider** — Reset `activePointerId`/`activeHandle` on unmount. (f12048f)
