# Changelog

> Aggregated from Code Review findings (CR5 + CR6) and the 2026-05-29 performance audit. Completed fixes with commit references.

---

## Performance Audit (2026-05-29)

### Bundle Size

- **package.json** — Added `"sideEffects": ["**/*.css"]` so consumer bundlers can tree-shake unused components (Vue SFC scoped CSS is the only side effect). Verified with esbuild against `dist`: `import { VibeButton }` → ~106 KB vs ~939 KB full import (~89% reduction). (d05b129)

---

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
