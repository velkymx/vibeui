# Contributing to VibeUI

Thanks for working on VibeUI. This guide covers local setup, the test suites, and the conventions the codebase follows.

## Prerequisites

- **Node 24** (CI runs Node 24; older majors are not tested)
- **npm** (the repo ships a `package-lock.json`; use `npm ci` for reproducible installs)

## Setup

```bash
npm ci
```

Vue is a peer dependency but is pinned in `devDependencies`, so a plain install gives you everything needed to build and run the unit suite. The real-browser suite needs one extra step (below).

## Project stack

Vue 3.5 (`<script setup>` + `defineModel`) · Bootstrap 5.3 (JS loaded internally via dynamic `import('bootstrap')`) · TypeScript 6 (`moduleResolution: Bundler`, `verbatimModuleSyntax`) · Vite 8 · Vitest 4.

Bootstrap **CSS** is supplied by the consumer; Bootstrap **JS** is managed internally — never import Bootstrap JS from component code's public surface.

## Tests

There are two Vitest projects sharing one Vite pipeline:

| Project | Environment | What it covers |
|---------|-------------|----------------|
| `unit` | happy-dom, Bootstrap **mocked** | Component logic, props/classes/events, composables, validators. Fast. |
| `browser` | real headless **Chromium** (Playwright) | The real Bootstrap JS + Quill integration paths happy-dom can't run: Modal/Offcanvas/Toast lifecycle + focus return, Tooltip/Popover/Dropdown Popper positioning, Collapse/Accordion/Carousel/Scrollspy, Quill init + DOMPurify sanitize. |

### Commands

```bash
npm test              # unit suite, watch mode (fast inner loop)
npm run test:run      # unit suite, single run (what CI's unit job runs)
npm run test:coverage # unit suite with coverage
npm run test:browser  # browser suite, single run (real Chromium)
npm run test:all      # both Vitest projects (unit + browser)
npm run test:examples # Playwright: load every examples/*.html in Chromium, assert it mounts cleanly
```

`test` / `test:run` / `test:coverage` are pinned to the `unit` project so the inner loop never pays browser-launch cost.

`test:examples` builds `dist`, statically serves the repo, and loads each example page end-to-end (UMD bundle + `bootstrap` import map + CDN Vue). It needs **network access** (jsDelivr / esm.sh / Unsplash), so it's an opt-in local gate — not part of the required CI `e2e` job, which would otherwise depend on CDN uptime.

### One-time browser setup

The `browser` suite needs the Playwright Chromium binary:

```bash
npx playwright install chromium
```

CI installs it with `npx playwright install --with-deps chromium`.

### Writing browser tests

- Live in `tests/browser/*.browser.test.ts`; mount with `vitest-browser-vue`'s `render`.
- Tests run **inside** the browser, so `document` is real — assert classes/teleported nodes with `document.querySelector` via the `waitForSelector` / `waitForGone` / `onceEvent` helpers in `tests/browser/helpers.ts`.
- Use **event-based** waiting (Bootstrap `shown.bs.*` via `onceEvent`, or polling helpers) — never fixed `setTimeout` for state. Acting mid-transition is a common false failure (Bootstrap's `hide()` no-ops while `_isTransitioning`).

## Build

```bash
npm run build
```

Produces `dist/` (ES + UMD + CSS) and type declarations at `dist/src/**` (referenced by `package.json` `types`/`exports`).

## Conventions

- **Commits:** Conventional Commits — `feat`/`fix`/`test`/`docs`/`chore`/`perf` with a component scope, e.g. `fix(VibeModal): …`.
- **TDD:** bug fixes and features land with a failing test first. The browser suite is the regression guard for integration bugs the unit suite can't reach.
- **No `v-html`.** User/HTML content is sanitized through `src/utils/sanitizeHtml.ts`; URLs through `safeHref`; inline styles through `safeCss`.
- **Third-party instances** (Bootstrap/Quill) are held in `shallowRef` and disposed in `onBeforeUnmount`.

## Before opening a PR

```bash
npm run build && npm run test:all
```

Both must be green. The CI `e2e` job is required and runs the browser suite on every PR.
