# E2E Browser Testing — Design

**Date:** 2026-05-29
**Status:** Approved (design)
**Topic:** Real-browser test coverage for the Bootstrap-JS + Quill integration paths the happy-dom unit suite cannot reach.

## Problem

The 925-test unit suite runs in happy-dom with Bootstrap JS mocked (`tests/mocks/bootstrap.ts`) and Quill unable to initialize. The integration layer that is hardest to get right — real Popper positioning, Bootstrap show/hide lifecycles and animations, and Quill editor behavior + DOMPurify sanitization — is therefore **unverified**. This is the top risk for a 1.0 commercial launch.

Goal: add a real-browser test layer that executes the actual Bootstrap JS and Quill code paths, covering every interactive component, without slowing the existing unit inner loop.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | All interactive paths: Overlays, Popper-positioned, Motion, Quill | "It all needs to work." |
| Test framework | Vitest 4 browser mode | Already installed; same API as the 925 unit tests; bundles with our real Vite 8 — no second bundler, no version mismatch, nothing experimental in the framework layer. |
| Browser driver | Playwright (provider) | Battle-tested headless Chromium driver. |
| Mount helper | `vitest-browser-vue` (`render` + `expect.element`) | Vitest-native Vue mounting in the browser. |
| Browsers | Chromium only | Integration bugs (Popper/Bootstrap/Quill) are engine-agnostic; keeps CI lean. Add WebKit later if needed. |
| CI | Separate required `e2e` job | Blocks merge on failure; parallel to unit job. |

Playwright Component Testing (`@playwright/experimental-ct-vue`) was rejected: it bundles with its own pinned Vite (≠ our Vite 8), and the framework layer is experimental. Vitest browser mode keeps our real Vite 8 pipeline and is stable in Vitest 4.

## Architecture

Two Vitest projects share one Vite 8 pipeline (`extends: true` inherits root `plugins: [vue()]`):

- **`unit`** — happy-dom, `bootstrap → tests/mocks/bootstrap.ts` alias. Today's 925 tests, unchanged. The mock alias is scoped to this project only.
- **`browser`** — real headless Chromium via the Playwright provider. **No bootstrap alias**, so components' own `import('bootstrap')` resolves the real package and the real Bootstrap JS executes for the first time. Real Quill (`new Quill()`) runs against a real contenteditable.

```ts
// vite.config.ts — test block
test: {
  projects: [
    {
      extends: true,
      test: {
        name: 'unit',
        environment: 'happy-dom',
        include: ['tests/**/*.test.ts'],
        exclude: ['tests/browser/**'],
        alias: { bootstrap: path.resolve(__dirname, 'tests/mocks/bootstrap.ts') }
      }
    },
    {
      extends: true,
      test: {
        name: 'browser',
        include: ['tests/browser/**/*.browser.test.ts'],
        setupFiles: ['tests/browser/setup.ts'],
        browser: {
          enabled: true,
          provider: 'playwright',
          headless: true,
          instances: [{ browser: 'chromium' }]
        }
      }
    }
  ]
}
```

New dev dependencies: `@vitest/browser`, `playwright`, `vitest-browser-vue`.

Real dependency loading in the browser project:
- Bootstrap CSS + Quill CSS imported once in `tests/browser/setup.ts`.
- Bootstrap JS: never imported globally — pulled by components via their own dynamic `import('bootstrap')`, exercising the production path.
- Quill: real package, real editor instance.

## File Layout

```
tests/
  browser/
    setup.ts                      # imports bootstrap + quill CSS; per-test cleanup
    helpers.ts                    # openModal(), waitForBsEvent(), getQuill()
    overlays.browser.test.ts      # Modal, Offcanvas, Toast
    popper.browser.test.ts        # Tooltip, Popover, Dropdown
    motion.browser.test.ts        # Collapse, Accordion, Carousel, Tabs, Scrollspy
    wysiwyg.browser.test.ts       # VibeFormWysiwyg / Quill
```

Mount pattern:
```ts
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import VibeModal from '../../src/components/VibeModal.vue'

test('opens, traps focus, returns focus on close', async () => {
  const screen = render(VibeModal, { props: { modelValue: true, title: 'Hi' } })
  await expect.element(screen.getByRole('dialog')).toBeVisible()
})
```

## Scripts (`package.json`)

```jsonc
"test": "vitest --project unit",            // fast inner loop, unchanged default
"test:run": "vitest run --project unit",    // CI unit (name kept)
"test:browser": "vitest run --project browser",
"test:all": "vitest run"                    // both projects
```

`test` / `test:run` stay pinned to `unit` so the inner loop never pays browser-launch cost.

## Coverage Matrix

Only behavior happy-dom cannot reach (real Bootstrap JS / Popper / Quill). No re-testing prop/class logic the unit suite already covers.

**overlays — Modal / Offcanvas / Toast**
- Modal: `v-model=true` → `.modal.show` + `.modal-backdrop` present; ESC closes → `v-model=false`; focus returns to trigger on close; backdrop click closes; body scroll lock.
- Offcanvas: open/close lifecycle, backdrop, ESC, focus return.
- Toast: autohide timer fires → hidden; `v-model` sync.

**popper — Tooltip / Popover / Dropdown**
- Tooltip: hover → real Popper positions `.tooltip` with computed `transform`; leave → removed.
- Popover: click → `.popover` shown + positioned; outside-click dismiss.
- Dropdown: toggle → `.dropdown-menu.show` + Popper placement; ESC/outside close; keyboard arrow nav.

**motion — Collapse / Accordion / Carousel / Tabs / Scrollspy**
- Collapse: toggle → `.collapsing` transition → `.collapse.show`.
- Accordion: opening one closes siblings (real Bootstrap).
- Carousel: `next()` advances active item; indicators sync.
- Tabs: click tab → pane `.active` swap, `.fade` handled.
- Scrollspy: scroll container → active nav link tracks.

**wysiwyg — VibeFormWysiwyg (our glue only; Quill's own behavior is not our project to test)**
- Real `new Quill()` mounts the editor — proves our dynamic-import + init glue runs (path happy-dom cannot run).
- Set HTML containing `<script>` / `onerror` → our `sanitizeHtml.ts` (DOMPurify) strips it. This is our security layer, exercised end-to-end in a real browser for the only time.

Explicitly **not** tested (Quill's behavior, not ours): typing → v-model round-trip, toolbar formatting output, disabled/readonly editability.

## CI Wiring

New `e2e` job in `.github/workflows/ci.yml`, parallel to the unit job, required for merge:

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:browser
```

Existing unit job untouched (`npm run test:run` stays the `unit` project). Chromium-only install keeps the job lean.

## Risks & Verification (resolved in a smoke phase before the full suite)

- **`vitest-browser-vue` API shape** — verify `render` + `expect.element` against the installed version with a smoke spec (mount `VibeButton`, assert visible) before writing the four real specs. If the mount API differs, adjust the helper, not the architecture.
- **Real Bootstrap JS resolution** — confirm the browser project resolves the real `bootstrap` (no mock-alias leak from root) by mounting `VibeModal` and asserting a real `.modal-backdrop` appears (the mock never creates one). Proves real Bootstrap JS executing.
- **Animation timing** — real CSS transitions are async. Use `expect.element(...).toBeVisible()` polling and Bootstrap `shown.bs.*` events via a `waitForBsEvent` helper; never fixed `setTimeout`.
- **Quill in CI** — real Quill needs real layout, which headless Chromium provides. This is the exact gap that motivated the work.

No fallback path: each uncertainty resolves to a concrete smoke-phase check before the full suite is authored.

## Out of Scope

- Firefox / WebKit browsers (Chromium only for 1.0).
- Visual regression / screenshot diffing.
- Re-testing prop/class/validation logic already covered by the unit suite.
