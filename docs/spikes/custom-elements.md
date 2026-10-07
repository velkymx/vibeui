# Custom elements spike (#156): decision record

**Verdict: NO-GO for now.** Keep this file as the decision record; reopen if the prerequisites below are met.

## What was probed

`defineCustomElement()` wrappers (`shadowRoot: false`, plus `configureApp`) around `VibeButton` and `VibeModal`, in `tests/components/VibeCustomElements.spike.test.ts` (happy-dom; real Bootstrap JS/CSS not exercised, noted per finding).

## Findings

| Area | Result | Evidence |
|------|--------|----------|
| Props from attributes | Works | `variant="danger"` renders `btn-danger` |
| Bootstrap classes | Work | Light DOM inherits page CSS by construction |
| Vue emits as DOM events | Work | `click` listener on host fires |
| Teleport (Modal to body) | Works | `.modal` lands in `document.body` |
| `configureApp` hook | Works | Runs at element setup |
| Bootstrap JS init | Works under mock | Real library per-element behavior unverified |
| **SFC slot projection** | **Broken** | Light-DOM children never reach `$slots`; fallback renders, children left orphaned |

## Why slots break

With `shadowRoot: false`, Vue rewires only literal `<slot>` elements found via `querySelectorAll("slot")` (`_parseSlots` / `_renderSlots` in `@vue/runtime-dom`). Compiled SFCs emit `renderSlot()` calls, never `<slot>` elements, so light-DOM children are collected but never re-inserted at an outlet. Verified against the bundled runtime and with a minimal render-function component (fallback renders, children orphaned).

## The catch-22

- `shadowRoot: false` keeps global Bootstrap CSS working but breaks every composable slot, the core VibeUI pattern (dual-mode collapses to props-only).
- Shadow DOM restores native slots but walls off global Bootstrap CSS (requires shipping CSS text into each root) and risks Bootstrap JS `document.querySelector` targeting (collapse parents, carousel indicators) plus per-app `useId` collisions across element instances.

## Reopen criteria

1. A slot-compatible light-DOM story (upstream Vue support or a vetted forwarding pattern).
2. A real-browser pass proving Bootstrap JS, adopted-stylesheet CSS delivery, and id uniqueness across instances.
3. A defined build target, element registration API, and pilot scope, as follow-up issues.
