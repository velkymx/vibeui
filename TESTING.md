# Testing Guide for VibeUI

How VibeUI itself is tested, and how to write tests when contributing. For setup basics (Node version, `npm ci`, Playwright install) see [CONTRIBUTING.md](./CONTRIBUTING.md). If you're a **consumer** testing an app that uses VibeUI, you don't need this file — mount the components with your own test runner and see [`docs/`](./docs/README.md) for component APIs.

## Two Vitest projects, one Vite pipeline

Both projects are defined in `vite.config.ts` and share the same plugins and resolution.

| Project | Environment | Bootstrap JS | What it covers |
|---------|-------------|--------------|----------------|
| `unit` | happy-dom | **mocked** (`tests/mocks/bootstrap.ts` via a project-scoped alias) | Component logic, props → classes, events/`v-model`, a11y attributes, composables, validators. Fast inner loop. |
| `browser` | real headless Chromium (Playwright, via `vitest-browser-vue`) | **real** | Everything happy-dom can't run: Modal/Offcanvas/Toast lifecycle + focus return, Tooltip/Popover/Dropdown Popper positioning, Collapse/Accordion/Carousel/Scrollspy transitions, Quill init + DOMPurify sanitize. |

## Commands

```bash
npm test              # unit suite, watch mode (fast inner loop)
npm run test:run      # unit suite, single run (what CI's unit job runs)
npm run test:coverage # unit suite with coverage
npm run test:browser  # browser suite, single run (real Chromium)
npm run test:all      # both projects
npm run test:examples # Playwright: load every examples/*.html, assert clean mount (needs network)
```

`test` / `test:run` / `test:coverage` are pinned to the `unit` project so the inner loop never pays browser-launch cost.

## Which project does my test belong in?

- **Unit** if the behavior is observable from the rendered DOM without real Bootstrap JS: prop-driven classes, emitted events, `v-model` round-trips, ARIA attributes, slot rendering, validation logic.
- **Browser** if the behavior depends on real Bootstrap transitions, Popper positioning, focus movement across elements, or the real Quill editor. The mocked Bootstrap in the unit suite records constructor/`show`/`hide`/`dispose` calls but performs no DOM work — asserting "the modal is visible" there tests the mock, not the component.

## Writing unit tests

- One file per component: `tests/components/<Component>.test.ts`. Composables live in `tests/composables/`, shared utilities in `tests/utils/`.
- Mount with `@vue/test-utils`' `mount` and assert against the rendered DOM:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeProgress from '../../src/components/VibeProgress.vue'

it('renders one bar per entry with its variant class', () => {
  const wrapper = mount(VibeProgress, {
    props: { bars: [{ value: 30, variant: 'success' }, { value: 20, variant: 'warning' }] }
  })

  const bars = wrapper.findAll('.progress-bar')
  expect(bars).toHaveLength(2)
  expect(bars[0].classes()).toContain('bg-success')
})
```

- Test real behavior, never the mock: pass data, interact (`trigger`, `setValue`), assert DOM and emitted payloads.
- **Keep output pristine.** Expected DEV warnings (e.g. VibeButton's icon-only `aria-label` check) must be asserted *and* suppressed with a `vi.spyOn(console, 'warn')` — a test run that passes but prints warnings hides regressions.
- Canvas components (charts) use `tests/mocks/canvasMock.ts` — happy-dom has no 2D context.

## Writing browser tests

- Live in `tests/browser/*.browser.test.ts`; mount with `vitest-browser-vue`'s `render`.
- Tests run **inside** the browser, so `document` is real. Assert teleported/global nodes with `document.querySelector` via the helpers in `tests/browser/helpers.ts`:
  - `waitForSelector(sel)` — poll until a node exists (backdrops, teleported content).
  - `waitForGone(sel)` — poll until a node is removed (after hide animations).
  - `onceEvent(el, 'shown.bs.modal')` — await a Bootstrap transition event; **attach before triggering**.
- Use **event-based** waiting, never fixed `setTimeout`. Acting mid-transition is the classic false failure: Bootstrap's `hide()` silently no-ops while `_isTransitioning`.
- Screenshot assertions store baselines in `tests/browser/__screenshots__/`.

## Conventions

- **TDD**: bug fixes and features land with a failing test first (see CONTRIBUTING.md). The browser suite is the regression guard for integration bugs the unit suite can't reach.
- Test names describe behavior ("emits update:currentPage on page click"), not implementation.
- Cover edge cases the component guards against: empty `items` arrays, duplicate ids, invalid values, unmount races.

## CI

`.github/workflows/ci.yml` runs two required jobs on every push/PR to `main` / `1.0-main`, both on Node 24:

1. **test** — `npm run build` + `npm run test:run` (unit suite).
2. **e2e** — `npx playwright install --with-deps chromium` + `npm run test:browser`.

`test:examples` is an opt-in local gate only — it loads CDN assets (jsDelivr / esm.sh) and would make CI depend on external uptime.

## Before opening a PR

```bash
npm run build && npm run test:all
```

Both must be green.
