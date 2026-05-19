# Changelog

## [1.0.0] — 2026-05-19

### Breaking Changes

- **`useForm.isValid`** now returns `false` until the first `validate()` or `validateField()` call (previously returned `true` on a fresh, unvalidated form). Update any code that reads `isValid` before calling `validate()` — use `isDirty` or an explicit `hasSubmitted` flag to gate submit-button state instead.

- **`_resetIdCounter`** removed from the public package export. It was an internal test helper and was never part of the public API contract. Any import of `_resetIdCounter` from `@velkymx/vibeui` will now fail at build time.

### New

- **`VibeFormCheckbox`** — `uncheckedValue` prop: controls the value emitted when the checkbox is unchecked (default `false`). Useful for string-valued checkboxes or three-state models.

- **`VibeChartLine`**, **`VibeChartBar`**, **`VibeChartPie`** — canvas-based chart components with Bootstrap color cycling, HiDPI rendering, hover tooltips, and `ResizeObserver`-driven responsiveness.

### Fixed

- `useFormValidation` — validators that receive `0` or `false` as a value no longer incorrectly skip validation (was checking `!value` instead of `value == null || value === ''`).
- `useFormValidation` — async validators now use a sequence counter to discard stale results from concurrent invocations.
- `useForm.isValid` — see breaking change above.
- `VibeFormCheckbox` — `indeterminate` state is now set via the DOM IDL property (not the HTML attribute, which has no effect).
- `VibeFormCheckbox` — unchecked value is configurable via the new `uncheckedValue` prop; was always emitting `false`.
- `VibeFormSpinbutton` — duplicate `@focusout`/`@blur` handlers no longer double-fire validation; float drift from repeated increment/decrement is fixed by `snapToStep`; `validate` is now fired on increment and decrement.
- `VibeFormGroup` — valid/invalid feedback divs now include `:id="feedbackId"` for correct `aria-describedby` linkage.
- `VibeFormGroup` — `helpText` is no longer hidden when `validationMessage` is present; its container always renders so `aria-describedby` is never orphaned.
- `VibeFormInput` — in `noWrapper` mode, orphaned `aria-describedby` IDs are conditionally omitted.
- `VibeFormWysiwyg` — `useId()` was called inside a prop default (ran at module load time, shared across all instances). Now called at setup time.
- `VibeDatePicker` — `useId()` was called inside a `computed()` getter (generated a new ID on every re-evaluation). Now called at setup level. Also: `min`/`max` prop changes now re-validate immediately.
- `VibeAccordion` — `useId` now called per-instance; `alwaysOpen` changes trigger re-init; element refs stored in a `Map` for safe disposal (no `getElementById` required); DEV-mode warning for CSS-special chars in `id` prop.
- `VibeAlert` — `initInFlight` guard prevents overlapping async Bootstrap inits; `isUnmounted` guard prevents post-unmount state writes.
- `VibeAutocomplete` — `@mousedown.prevent` was blocking blur; changed to `@click`. Added `isUnmounted` guard. `onFocus` no longer queries when disabled. ArrowUp from no-selection now wraps to last item.
- `VibeCarousel` — `activeIndex` is now reset to 0 when the `items` array changes.
- `VibeDataTable` — fallback row keys are now globally unique across pages. `perPage=0` no longer produces `Infinity` totalPages. `row-clicked` event now emits the global row index. Listener detection supports both camelCase and kebab-case `v-on` object syntax.
- `VibeDropdown` — `initInFlight` guard added.
- `VibeIcon` — `aria-hidden` and `aria-label` were mutually exclusive but could both be set; fixed. Click events are now suppressed on decorative icons.
- `VibeListGroup` — `getItemTag` computed 3× per render; fixed with `v-memo`. `aria-disabled="false"` is now omitted (attribute absent) on non-disabled items.
- `VibeModal` — `aria-hidden="false"` replaced with `undefined` (attribute absent) when modal is visible.
- `VibeNav` — `getTabTarget` now extracts fragment from `to` paths. Deep watch replaced with shallow watch. Button-only items (no `href`, no `to`) now receive the HTML `disabled` attribute.
- `VibeNavbarToggle` — `data-bs-toggle` was causing Bootstrap to fire the toggle twice; removed.
- `VibePopover` — `initInFlight` guard added; `data-bs-toggle="popover"` removed from wrapper span (prevented double-init with Bootstrap data-api).
- `VibeProgress` — accessible name added (`aria-label`); multi-bar key uses label or value+index to avoid stale keys.
- `VibeResizable` — aspect ratio clamping invariant fix; `activePointerId` guard added; `process.env.NODE_ENV` replaced with `import.meta.env.DEV`.
- `VibeBreadcrumb` — inline arrow function per render replaced with a stable handler.
- `VibeScrollspy` — `initInFlight` guard added; `smoothScroll` is now watched; `data-bs-smooth-scroll="false"` coercion bug fixed.
- `VibeSlider` — stale `props.modelValue` re-read on pointerup removed; `activePointerId`/`activeHandle` now reset on unmount.
- `VibeSortable` — `dragend` fallback listener added to `document` to prevent stuck drag state when `dragend` fires on a removed element.
- `VibeStepper` — empty `steps[]` guard; `isUnmounted` now also set in `onDeactivated` (KeepAlive support).
- `VibeTabContent` — dead emits removed.
- `VibeToast` — `isVisible` is now set on `shown.bs.toast` (animation complete) rather than `show.bs.toast` (animation start); double-dispose crash fixed.
- `VibeTooltip` — `initInFlight` guard added; `data-bs-toggle="tooltip"` removed from wrapper span.
- `VibeSortable` — drag state is incompatible with `dndStore` / `VibeDraggable` / `VibeDroppable`; documented inline.
- **Canvas charts** — tooltip layer now uses a separate overlay canvas; eliminates full canvas redraw on every tooltip hit change (~660 MB/s allocation pressure eliminated at HiDPI/60 Hz). Canvas elements now carry `role="img" aria-label="Chart"`.
- **Charts** — `hitTest` stale closure false positive confirmed: `props` is a Vue reactive proxy and reads current value at call time. `chartResize` RAF now reads `pendingEntry` ref inside the callback. `drawLine` smooth bezier now applies to 2-point datasets. `drawBar` negative-only data and negative hit-region bugs fixed.
