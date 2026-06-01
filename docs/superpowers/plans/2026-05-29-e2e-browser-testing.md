# E2E Browser Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-browser Vitest project that executes the actual Bootstrap JS and Quill code paths the happy-dom unit suite mocks or cannot run, covering every interactive component.

**Architecture:** Two Vitest 4 projects share one Vite 8 pipeline. `unit` keeps happy-dom + the `bootstrap → mock` alias (today's 925 tests, unchanged). A new `browser` project runs headless Chromium via the Playwright provider with **no** bootstrap alias, so components' own `import('bootstrap')` resolves the real package. Tests live in `tests/browser/*.browser.test.ts`, mount via `vitest-browser-vue`, and assert against the real DOM (tests run inside the browser, so `document` is real).

**Tech Stack:** Vitest 4 browser mode, `@vitest/browser`, Playwright (driver), `vitest-browser-vue`, Vite 8, real Bootstrap 5.3 JS + CSS, real Quill 2.

**Spec:** `docs/superpowers/specs/2026-05-29-e2e-browser-testing-design.md`

**Scope note (decided during planning):** `VibeTabs` is pure Vue reactivity (no `import('bootstrap')`); its behavior is fully covered by the happy-dom unit suite, so it is **excluded** from the browser suite. Browser motion coverage = Collapse, Accordion, Carousel, Scrollspy.

**Conventions used in every spec:**
- Interactions: `userEvent` from `@vitest/browser/context` (`click`, `hover`, `keyboard`, `type`).
- Body/teleported queries (Modal/Offcanvas/Toast/Tooltip/Popover append to `document.body`): direct `document.querySelector` inside `vi.waitFor`, via the `waitForSelector` / `waitForGone` helpers from `tests/browser/helpers.ts`.
- `vi` and test globals are available (`globals: true`).

---

### Task 1: Install dependencies and prove the toolchain (smoke)

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Modify: `vite.config.ts` (test block → projects)
- Create: `tests/browser/setup.ts`
- Create: `tests/browser/smoke.browser.test.ts`

- [ ] **Step 1: Install dev dependencies and the Chromium binary**

Run:
```bash
npm i -D @vitest/browser playwright vitest-browser-vue
npx playwright install chromium
```
Expected: packages added; Chromium downloaded.

- [ ] **Step 2: Replace the `test` block in `vite.config.ts` with a two-project config**

Replace the entire existing `test: { ... }` object with:

```ts
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'examples/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts'
      ]
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'happy-dom',
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/browser/**'],
          // Mock alias is scoped to this project ONLY — the browser project must
          // resolve the real bootstrap package.
          alias: {
            bootstrap: path.resolve(__dirname, 'tests/mocks/bootstrap.ts')
          }
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

Leave the `plugins`, `build`, and top-of-file imports untouched. `path` is already imported.

- [ ] **Step 3: Create the browser setup file**

`tests/browser/setup.ts`:
```ts
// Loaded once per browser test file. Pulls in the real Bootstrap + Quill CSS so
// the real Bootstrap JS and Quill render against authentic styles. vitest-browser-vue
// auto-registers component cleanup via afterEach when globals are enabled.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'quill/dist/quill.snow.css'
```

- [ ] **Step 4: Write the smoke spec**

`tests/browser/smoke.browser.test.ts`:
```ts
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import VibeButton from '../../src/components/VibeButton.vue'

test('mounts a Vibe SFC in a real browser', async () => {
  const screen = render(VibeButton, {
    props: { variant: 'primary' },
    slots: { default: 'Click me' }
  })
  await expect.element(screen.getByRole('button', { name: 'Click me' })).toBeVisible()
})
```

- [ ] **Step 5: Run the smoke spec**

Run: `npx vitest run --project browser tests/browser/smoke.browser.test.ts`
Expected: PASS. Proves Chromium launches, our Vite 8 + `@vitejs/plugin-vue` bundles a `<script setup lang="ts">` SFC, and `vitest-browser-vue` mounts it. If this fails, the toolchain issue is isolated here — fix it before writing any real spec.

- [ ] **Step 6: Verify the unit suite is untouched**

Run: `npx vitest run --project unit`
Expected: all existing tests PASS (the 925-test suite), confirming the mock alias still applies in the unit project.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.ts tests/browser/setup.ts tests/browser/smoke.browser.test.ts
git commit -m "test(e2e): add Vitest browser project + Playwright; smoke spec"
```

---

### Task 2: Browser test helpers + proof that real Bootstrap JS runs

**Files:**
- Create: `tests/browser/helpers.ts`
- Create: `tests/browser/_realbootstrap.browser.test.ts`

- [ ] **Step 1: Write the helpers**

`tests/browser/helpers.ts`:
```ts
import { expect, vi } from 'vitest'

// Poll the real DOM until a node matching `selector` exists; returns it.
// Used for Bootstrap/Quill nodes that lack a stable role (e.g. .modal-backdrop)
// and for teleported content appended to document.body.
export async function waitForSelector(selector: string, timeout = 4000): Promise<Element> {
  let found: Element | null = null
  await vi.waitFor(() => {
    found = document.querySelector(selector)
    expect(found, `expected to find "${selector}"`).not.toBeNull()
  }, { timeout })
  return found as unknown as Element
}

// Poll until no node matches `selector` (e.g. after a close/hide animation).
export async function waitForGone(selector: string, timeout = 4000): Promise<void> {
  await vi.waitFor(() => {
    expect(document.querySelector(selector), `expected "${selector}" to be gone`).toBeNull()
  }, { timeout })
}
```

- [ ] **Step 2: Write the real-Bootstrap proof spec**

`tests/browser/_realbootstrap.browser.test.ts`:
```ts
import { render } from 'vitest-browser-vue'
import { test } from 'vitest'
import VibeModal from '../../src/components/VibeModal.vue'
import { waitForSelector } from './helpers'

// The happy-dom mock NEVER creates a .modal-backdrop element. Its presence proves
// the real Bootstrap Modal JS executed (no mock alias leaked into this project).
test('real Bootstrap JS runs: opening a modal creates a .modal-backdrop', async () => {
  render(VibeModal, { props: { modelValue: true, title: 'Real BS' }, slots: { default: 'Body' } })
  await waitForSelector('.modal.show')
  await waitForSelector('.modal-backdrop')
})
```

- [ ] **Step 3: Run it**

Run: `npx vitest run --project browser tests/browser/_realbootstrap.browser.test.ts`
Expected: PASS. The `.modal-backdrop` assertion is the load-bearing check — it cannot pass under the mock or in happy-dom.

- [ ] **Step 4: Commit**

```bash
git add tests/browser/helpers.ts tests/browser/_realbootstrap.browser.test.ts
git commit -m "test(e2e): helpers + proof real Bootstrap JS executes"
```

---

### Task 3: Overlays spec (Modal, Offcanvas, Toast)

**Files:**
- Create: `tests/browser/overlays.browser.test.ts`

- [ ] **Step 1: Write the overlays spec**

`tests/browser/overlays.browser.test.ts`:
```ts
import { defineComponent, ref } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe } from 'vitest'
import VibeModal from '../../src/components/VibeModal.vue'
import VibeOffcanvas from '../../src/components/VibeOffcanvas.vue'
import VibeToast from '../../src/components/VibeToast.vue'
import { waitForSelector, waitForGone } from './helpers'

describe('VibeModal', () => {
  test('ESC closes the modal and focus returns to the trigger (WCAG 2.4.3)', async () => {
    const Host = defineComponent({
      components: { VibeModal },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button type="button" @click="open = true">Open</button>
          <VibeModal v-model="open" title="Hi">Body</VibeModal>
        </div>`
    })
    const screen = render(Host)
    // Clicking focuses the trigger; Bootstrap captures it as the pre-open activeElement.
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await waitForSelector('.modal.show')
    await userEvent.keyboard('{Escape}')
    await waitForGone('.modal.show')
    await waitForGone('.modal-backdrop')
    expect(document.activeElement?.textContent).toBe('Open')
  })
})

describe('VibeOffcanvas', () => {
  test('opens with a backdrop and ESC closes it', async () => {
    const Host = defineComponent({
      components: { VibeOffcanvas },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button type="button" @click="open = true">Open panel</button>
          <VibeOffcanvas v-model="open" title="Panel">Panel body</VibeOffcanvas>
        </div>`
    })
    const screen = render(Host)
    await userEvent.click(screen.getByRole('button', { name: 'Open panel' }))
    await waitForSelector('.offcanvas.show')
    await waitForSelector('.offcanvas-backdrop')
    await userEvent.keyboard('{Escape}')
    await waitForGone('.offcanvas.show')
  })
})

describe('VibeToast', () => {
  test('autohide hides the toast after the delay', async () => {
    render(VibeToast, {
      props: { modelValue: true, title: 'Saved', autohide: true, delay: 150 },
      slots: { default: 'Your changes were saved' }
    })
    await waitForSelector('.toast.show')
    // delay (150ms) + Bootstrap fade — generous window via waitForGone's polling.
    await waitForGone('.toast.show')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npx vitest run --project browser tests/browser/overlays.browser.test.ts`
Expected: PASS (3 tests). Focus-return and autohide-timer paths are the ones happy-dom cannot verify.

- [ ] **Step 3: Commit**

```bash
git add tests/browser/overlays.browser.test.ts
git commit -m "test(e2e): overlays — Modal focus-return, Offcanvas, Toast autohide"
```

---

### Task 4: Popper-positioned spec (Tooltip, Popover, Dropdown)

**Files:**
- Create: `tests/browser/popper.browser.test.ts`

- [ ] **Step 1: Write the popper spec**

`tests/browser/popper.browser.test.ts`:
```ts
import { defineComponent } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe } from 'vitest'
import VibeTooltip from '../../src/components/VibeTooltip.vue'
import VibePopover from '../../src/components/VibePopover.vue'
import VibeDropdown from '../../src/components/VibeDropdown.vue'
import { waitForSelector, waitForGone } from './helpers'

describe('VibeTooltip', () => {
  test('hover shows a Popper-positioned tooltip; leaving removes it', async () => {
    const Host = defineComponent({
      components: { VibeTooltip },
      template: `<div><VibeTooltip text="Helpful tip"><button type="button">Hover me</button></VibeTooltip></div>`
    })
    const screen = render(Host)
    await userEvent.hover(screen.getByRole('button', { name: 'Hover me' }))
    const tip = await waitForSelector('.tooltip')
    // Real Popper applies an inline transform for positioning — absent in happy-dom.
    expect((tip as HTMLElement).style.transform).not.toBe('')
    await userEvent.unhover(screen.getByRole('button', { name: 'Hover me' }))
    await waitForGone('.tooltip')
  })
})

describe('VibePopover', () => {
  test('click shows a popover; clicking outside dismisses it', async () => {
    const Host = defineComponent({
      components: { VibePopover },
      template: `
        <div>
          <VibePopover title="More info" text="Popover body"><button type="button">Toggle</button></VibePopover>
          <button type="button">Outside</button>
        </div>`
    })
    const screen = render(Host)
    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    await waitForSelector('.popover')
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
    await waitForGone('.popover')
  })
})

describe('VibeDropdown', () => {
  test('toggle opens a Popper-positioned menu; ESC closes it', async () => {
    const screen = render(VibeDropdown, {
      props: { text: 'Menu', items: [{ text: 'Alpha' }, { text: 'Beta' }] }
    })
    const toggle = screen.getByRole('button', { name: 'Menu' })
    await userEvent.click(toggle)
    await waitForSelector('.dropdown-menu.show')
    expect((await waitForSelector('.dropdown-toggle')).getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await waitForGone('.dropdown-menu.show')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npx vitest run --project browser tests/browser/popper.browser.test.ts`
Expected: PASS (3 tests). The tooltip `transform` assertion confirms real Popper positioning.

- [ ] **Step 3: Commit**

```bash
git add tests/browser/popper.browser.test.ts
git commit -m "test(e2e): popper — Tooltip/Popover/Dropdown real positioning"
```

---

### Task 5: Motion spec (Collapse, Accordion, Carousel, Scrollspy)

**Files:**
- Create: `tests/browser/motion.browser.test.ts`

- [ ] **Step 1: Write the motion spec**

`tests/browser/motion.browser.test.ts`:
```ts
import { defineComponent } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe, vi } from 'vitest'
import VibeCollapse from '../../src/components/VibeCollapse.vue'
import VibeAccordion from '../../src/components/VibeAccordion.vue'
import VibeCarousel from '../../src/components/VibeCarousel.vue'
import VibeScrollspy from '../../src/components/VibeScrollspy.vue'
import { waitForSelector } from './helpers'

describe('VibeCollapse', () => {
  test('toggling modelValue runs the real show transition to .collapse.show', async () => {
    const screen = render(VibeCollapse, {
      props: { modelValue: false },
      slots: { default: 'Hidden content' }
    })
    await screen.rerender({ modelValue: true })
    await waitForSelector('.collapse.show')
  })
})

describe('VibeAccordion', () => {
  test('opening one panel closes its sibling (real Bootstrap parent behavior)', async () => {
    const screen = render(VibeAccordion, {
      props: {
        id: 'acc1',
        items: [
          { id: 'panelA', title: 'Panel A', content: 'A body', show: true },
          { id: 'panelB', title: 'Panel B', content: 'B body' }
        ]
      }
    })
    await waitForSelector('#panelA.show')
    await userEvent.click(screen.getByRole('button', { name: 'Panel B' }))
    await waitForSelector('#panelB.show')
    await vi.waitFor(() => {
      expect(document.querySelector('#panelA.show'), 'Panel A should have closed').toBeNull()
    })
  })
})

describe('VibeCarousel', () => {
  test('clicking next advances the active slide', async () => {
    render(VibeCarousel, {
      props: {
        id: 'car1',
        ride: false,
        items: [{ captionText: 'Slide one' }, { captionText: 'Slide two' }]
      }
    })
    await waitForSelector('.carousel-item.active')
    await userEvent.click(await waitForSelector('.carousel-control-next') as HTMLElement)
    await vi.waitFor(() => {
      const items = document.querySelectorAll('.carousel-item')
      expect(items[1].classList.contains('active'), 'second slide should be active').toBe(true)
    })
  })
})

describe('VibeScrollspy', () => {
  test('scrolling the container moves the active nav link', async () => {
    const Host = defineComponent({
      components: { VibeScrollspy },
      template: `
        <div>
          <nav id="ss-nav">
            <ul class="nav nav-pills flex-column">
              <li class="nav-item"><a class="nav-link" href="#sec1">Section 1</a></li>
              <li class="nav-item"><a class="nav-link" href="#sec2">Section 2</a></li>
            </ul>
          </nav>
          <VibeScrollspy target="#ss-nav" height="120px">
            <div id="sec1" style="height: 400px">Section 1 content</div>
            <div id="sec2" style="height: 400px">Section 2 content</div>
          </VibeScrollspy>
        </div>`
    })
    render(Host)
    const root = await waitForSelector('[data-bs-spy="scroll"]') as HTMLElement
    root.scrollTop = root.scrollHeight
    await vi.waitFor(() => {
      const active = document.querySelector('#ss-nav .nav-link.active') as HTMLElement | null
      expect(active?.getAttribute('href'), 'second section should be active after scroll').toBe('#sec2')
    }, { timeout: 5000 })
  })
})
```

- [ ] **Step 2: Run it**

Run: `npx vitest run --project browser tests/browser/motion.browser.test.ts`
Expected: PASS (4 tests). These exercise real Collapse transitions, Accordion parent grouping, Carousel slide advance, and ScrollSpy IntersectionObserver — none of which happy-dom drives.

- [ ] **Step 3: Commit**

```bash
git add tests/browser/motion.browser.test.ts
git commit -m "test(e2e): motion — Collapse/Accordion/Carousel/Scrollspy"
```

---

### Task 6: Wysiwyg spec (Quill render + our DOMPurify sanitize)

**Files:**
- Create: `tests/browser/wysiwyg.browser.test.ts`

- [ ] **Step 1: Write the wysiwyg spec**

`tests/browser/wysiwyg.browser.test.ts`:
```ts
import { render } from 'vitest-browser-vue'
import { expect, test, describe } from 'vitest'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import { waitForSelector } from './helpers'

describe('VibeFormWysiwyg (our integration glue only)', () => {
  test('mounts a real Quill editor (init path happy-dom cannot run)', async () => {
    render(VibeFormWysiwyg, { props: { modelValue: '<p>Hello</p>' } })
    // Quill builds .ql-toolbar + .ql-editor only when it initializes against real layout.
    await waitForSelector('.ql-toolbar')
    const editor = await waitForSelector('.ql-editor')
    expect(editor.textContent).toContain('Hello')
  })

  test('our sanitizeHtml layer strips dangerous markup before it reaches the editor', async () => {
    // Reset any prior pollution.
    delete (window as unknown as Record<string, unknown>).__xssScript
    delete (window as unknown as Record<string, unknown>).__xssImg
    const malicious =
      '<p>safe text</p>' +
      '<script>window.__xssScript = true<\/script>' +
      '<img src="x" onerror="window.__xssImg = true">'
    render(VibeFormWysiwyg, { props: { modelValue: malicious } })
    const editor = await waitForSelector('.ql-editor')
    expect(editor.textContent).toContain('safe text')
    expect(editor.innerHTML).not.toContain('onerror')
    expect(editor.innerHTML.toLowerCase()).not.toContain('<script')
    // Neither payload executed.
    expect((window as unknown as Record<string, unknown>).__xssScript).toBeUndefined()
    expect((window as unknown as Record<string, unknown>).__xssImg).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npx vitest run --project browser tests/browser/wysiwyg.browser.test.ts`
Expected: PASS (2 tests). First proves real Quill init; second proves our `sanitizeHtml.ts` strips XSS end-to-end in a real browser.

- [ ] **Step 3: Commit**

```bash
git add tests/browser/wysiwyg.browser.test.ts
git commit -m "test(e2e): wysiwyg — real Quill init + DOMPurify sanitize"
```

---

### Task 7: npm scripts + CI job

**Files:**
- Modify: `package.json` (scripts)
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Update scripts in `package.json`**

Set the `scripts` entries to:
```jsonc
"test": "vitest --project unit",
"test:run": "vitest run --project unit",
"test:browser": "vitest run --project browser",
"test:all": "vitest run"
```
(Keep any other existing scripts such as `build`, `lint`, `type-check` unchanged. `test` and `test:run` stay pinned to `unit` so the inner loop and the existing CI unit job never pay browser-launch cost.)

- [ ] **Step 2: Verify the unit scripts still pass**

Run: `npm run test:run`
Expected: the 925-test unit suite PASSES (now via `--project unit`).

- [ ] **Step 3: Add the `e2e` job to `.github/workflows/ci.yml`**

Add this job alongside the existing job(s) (same indentation level under `jobs:`):
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
Do not modify the existing unit job (it continues to run `npm run test:run`).

- [ ] **Step 4: Run the full browser suite locally as a final gate**

Run: `npm run test:browser`
Expected: every browser spec PASSES (smoke + real-bootstrap proof + overlays + popper + motion + wysiwyg).

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "test(e2e): npm scripts + required CI e2e job (Chromium)"
```

---

## Self-Review

**Spec coverage:**
- Two Vitest projects, one Vite 8 pipeline, mock alias scoped to `unit` → Task 1. ✓
- New dev deps (`@vitest/browser`, `playwright`, `vitest-browser-vue`) → Task 1. ✓
- Real Bootstrap/Quill CSS via setup, real BS JS via component dynamic import → Tasks 1–2. ✓
- File layout (`setup.ts`, `helpers.ts`, four spec files) → Tasks 1, 2, 3, 4, 5, 6. ✓
- Coverage matrix: overlays (Task 3), popper (Task 4), motion (Task 5), wysiwyg render+sanitize (Task 6). ✓
- Scripts pinned to `unit`; `test:browser`/`test:all` added → Task 7. ✓
- Separate required `e2e` CI job, Chromium-only install → Task 7. ✓
- Risk verifications: smoke proves bundling (Task 1); `.modal-backdrop` proves real BS JS (Task 2); tooltip `transform` proves real Popper (Task 4); event-based polling via `waitForSelector`/`vi.waitFor`, no fixed `setTimeout` (all tasks). ✓
- Tabs intentionally excluded (pure Vue, no BS JS) — documented in the scope note; deviates from the spec's component list by design, consistent with the spec's "only behavior happy-dom can't reach" principle.

**Placeholder scan:** No TBD/TODO; every step has concrete code or an exact command + expected result.

**Type/name consistency:** Helper names (`waitForSelector`, `waitForGone`) defined in Task 2 and used identically in Tasks 3–6. Project names (`unit`, `browser`) consistent across `vite.config.ts`, scripts, and CI. Component import paths use `../../src/components/`.
