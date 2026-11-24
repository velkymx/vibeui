# Unslop: a protocol for AI-built interfaces

Slop is not ugliness. It is **unreviewed decisions**. A page can be plain and excellent, or styled and sloppy. What makes it slop is that the choices were not made for this product: the palette, type, spacing, layout, copy, and motion came from a model's defaults rather than from a brief.

This document is a working protocol for people directing AI agents, and for agents building VibeUI screens. It defines a design contract, a catalog of tells with replacements, a build and review protocol, and paste-ready prompts.

It is written for a Bootstrap 5.3 / VibeUI codebase, but the protocol is framework-agnostic. The catalog draws on [Impeccable's Slop catalog](https://impeccable.style/slop/) and the [Bootstrap 5.3 Examples](https://getbootstrap.com/docs/5.3/examples/).

## How to use this in 5 minutes

1. Copy the `DESIGN.md` template in §2 into the repo root and fill it in. The scale is the set of allowed values; a screen may use a subset.
2. Add `DESIGN.md` and this file to the agent's read list. Paste this into `AGENTS.md` or `CLAUDE.md`:

   ```markdown
   - Read DESIGN.md and docs/unslop.md before any UI task.
   - Use VibeUI components and props; no raw Bootstrap markup or unexplained custom CSS.
   - Before review, run the §5.3 deletion pass and the §9 ship gate; attach 320/768/1440 screenshots.
   ```

3. Run one screen through §5.1: content inventory, archetype, text outline, one named reference.
4. Give the agent the contract prompt (§8.1) and the task prompt (§8.2).
5. Review the rendered page with the kill pass (§5.3) and the ship gate (§9). Attach screenshots at 320, 768, and 1440 px.

Everything else in this document is depth you can reach for when a review finding needs a name or a replacement.

---

## 1. Why context loss produces slop

Models regress to the mean when context is thin. Four mechanisms account for most AI-generated UI:

- **Default gravity.** With no stated direction, the model samples the most frequent pattern in its training data: purple gradients, Inter, three icon cards, a hero metric, a rounded card with a colored edge.
- **Local optimization.** Each component is generated in isolation. The fifth card gets a different radius, the fourth heading a different size. Nobody holds the whole page in view.
- **Narrative over evidence.** The model cannot see the rendered page unless you show it. It reasons from markup, not from screenshots, overflow, or contrast.
- **Drift over a long task.** The further a session gets from the brief, the more likely it is to "improve" things nobody asked to change.

The antidote is not better taste prompts. It is **persistent constraints plus rendered evidence**:

| Failure | Countermeasure |
| --- | --- |
| Model invents tokens | A short `DESIGN.md` in the repo, read before every task |
| Model copies a generic layout | One named reference example per screen |
| Local inconsistency | A single scope per task: one screen, one pass |
| Decoration creep | Explicit budgets (accent colors, type sizes, shadows) |
| No visual check | Screenshots at 320 / 768 / 1440 before review |
| Drift | A kill pass at the end of every task |

---

## 2. The contract: `DESIGN.md`

If a value is not in the file, it is not a decision. Keep the contract short enough to read at the start of every session. It should fit on one screen.

The scale below is the **project-wide set of allowed steps**. It is not a per-view menu: §3 limits how many of those steps one screen may use.

```markdown
# Design contract

## Character
Three adjectives, and one sentence about who this is for and what they do all day.

## Type
- Families: <one family for UI, optional one for display/code>
- Project scale (allowed steps only): 12 / 14 / 16 / 20 / 24 / 32 / 48
- Weights (allowed): 400 / 500 / 600
- Body measure: 65–75 characters

## Color roles
- Surface / surface-alt / border / text / text-muted
- Accent (one), Accent-contrast
- Success / warning / danger (status only, never decoration)
- No gradients. No glows. No raw hex outside this list.

## Space
- Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- Page padding: 16 mobile, 24 tablet, 32 desktop
- Component group gap > item gap (proximity communicates hierarchy)

## Shape and depth
- Radius: 6 for controls, 10 for surfaces, pill only for tags
- One shadow tier; borders and shadow never both define the same edge

## Motion
- Only for state change (open/close, insert/remove, progress)
- Duration 120–200 ms, standard easing; honor prefers-reduced-motion
- No parallax, no marquees, no scroll-reveal by default

## Voice
- Sentence case, plain verbs, no "supercharge/seamless/world-class"
- Errors say what happened and what to do next
- Empty states offer the first action, not an apology

## References
- Marketing page: Bootstrap `album` or `cover`
- Auth: Bootstrap `sign-in`
- Checkout: Bootstrap `checkout`
- Dashboard: Bootstrap `dashboard`
- Everything else: the closest existing screen in this repo (link it)
```

**Rule for agents:** read `DESIGN.md`, the referenced example, and the target file before writing a line. Do not infer the system from memory, from `dist/`, or from a previous conversation.

The same file powers [Impeccable's design-system checks](https://impeccable.style/docs/detector), so keeping it accurate has a second payoff in §9.

---

## 3. The budgets

Budgets turn taste into a checkable property. A view fails review if it exceeds them without a stated reason.

| Dimension | Per-view budget |
| --- | --- |
| Accent colors | 1 |
| Type families | 2 (UI + optional display/code) |
| Type sizes | 3, or 4 with a display heading, chosen from the project scale |
| Font weights | 2, or 3 with a deliberate emphasis system, chosen from the allowed weights |
| Shadows | 1 tier; zero if borders carry the hierarchy |
| Card depth | 1 level. Cards do not contain cards |
| Primary actions | 1; the rest are secondary or links |
| Borders + shadows | One of the two defines an edge |
| Radius values | 2 (controls, surfaces) plus pill |
| Icons | Only when they aid recognition, never as decoration |
| Motion | State change only |
| Copy density | No label that repeats the heading it sits above |

Write the budget into the review comment. "Exceeds the type budget: 5 sizes" is actionable. "Feels AI-ish" is not.

---

## 4. The catalog: tell → replacement

Not all tells are equal. The items in §4.7 and §4.8 break the task or exclude users. The rest are craft problems: fix them, but do not block a release on card radius while the empty state is missing.

### Start here: the ten highest-impact tells

| # | Tell | Severity |
| --- | --- | --- |
| 1 | No empty, loading, or error states | Blocker |
| 2 | Placeholder used as the only label; unlabeled controls | Blocker |
| 3 | Contrast below WCAG AA | Blocker |
| 4 | Invisible focus or a keyboard dead end | Blocker |
| 5 | Horizontal scroll at 320 px | Blocker |
| 6 | Cards nested inside cards; every section boxed | High |
| 7 | Identical icon + heading + paragraph grids | High |
| 8 | Decorative gradients, glows, glass, or grid textures | High |
| 9 | Duplicate labels, restated helper text, generic claims | High |
| 10 | A modal for a page-sized task, or a confirm for a routine one | High |

### 4.1 Structure and layout

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| Cards inside cards, three levels deep | Depth without hierarchy; padding eats the content | One surface. Use spacing, dividers, or a section heading |
| Identical grids of icon + heading + paragraph | Every point gets equal weight, so none matters | Order by importance; use a list, table, or asymmetric layout |
| Hero metric block ("99.9%", "10x") with no job | Template landing page; the number is decoration | Lead with a metric only if the product is the metric, and give it a source and comparison |
| Side-tab color stripe on every card | Looks like an alert without being one | Remove it. Use a status badge only when there is a status |
| Template stack: hero, logos, features, testimonial, CTA | Layout not derived from the content | Start from the job: what does the visitor decide or do next? |
| Equal spacing everywhere | Nothing groups; the eye has no structure | Tight within a group, generous between groups |
| Multi-step settings in a modal | A page-sized task in a dialog | Dedicated page or a drawer with a stepper |
| Dashboard of stats with no decision | Numbers that do not change behavior | Name the decision each panel supports; delete the rest |
| Empty table with no next step | Dead end | Explain why it is empty and offer the first action |

### 4.2 Typography

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| Inter or Geist on every product | Interchangeable voice | Keep the brand face; if none, pick a system stack and differentiate with scale and spacing |
| Small label above a heading, repeating it | Extra reading, zero information | Delete the label or merge its words into the heading |
| Pill badge above the headline | Looks interactive and competes with the message | Put the information in the headline or supporting text |
| Oversized hero headline filling the first screen | Pushes the offer and the action below the fold | Shorten it; save display sizes for two or three words |
| Nearly flat type hierarchy | The page cannot be scanned | 3 sizes and 2 weights, applied consistently |
| Interface text below 14 px | Hard to read, fails zoom users | 16 px body, 14 px for secondary labels at minimum |
| All-caps body copy | Tiring to read | Sentence case; reserve caps for short labels |
| Wide letter spacing on paragraphs | Slows reading | Default tracking for body; spacing only for short labels |
| Justified paragraphs | Rivers and gaps | Left-align (start-align in RTL) |
| Centered long paragraphs | Ragged both edges, hard to track | Center only short blocks, two lines max |
| A single word on the last line | Looks unfinished | Balance headings with `text-wrap: balance`; use `text-wrap: pretty` on intros |

### 4.3 Color and contrast

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| Purple-to-blue gradient on buttons, text, backgrounds | The default "AI product" palette | One accent from the brand; neutrals carry the page |
| Gradient text | Color changes for decoration | Solid color; emphasis through size or weight |
| Dark mode plus neon glows and borders | Neon wall; everything shouts | Neutral surfaces; accent only on action and focus |
| Cream/beige as an instant "editorial" look | Fashion, not a decision | Choose the palette from the product's world |
| Gray text on a colored surface | Washed out, often fails contrast | Darker tint or light text; check the actual pairing at 4.5:1 |
| Every status gets its own color | Color noise; real warnings lose force | Color only where meaning changes |
| Low-contrast muted text | Users cannot read it | Meet WCAG AA: 4.5:1 body, 3:1 large text |

### 4.4 Visual details

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| Glassmorphism used as decoration | Blur is solving a layering problem that does not exist | Solid surface or a plain border |
| Decorative grid lines, noise, or stripes | Fills space with texture | Let the layout and content carry the page |
| Hard offset shadow (4 px, no blur) | The neobrutalist default | One soft shadow, or a border |
| Hairline border plus wide shadow | Two edges defining one shape | Pick one |
| Extreme corner radius on every card | Content is squeezed; all cards look alike | Two radii from the contract |
| Icon tile above every heading | Clip-art feature grid | Put the icon beside the heading, or drop it |
| Rough hand-drawn SVG mascot | Unfinished page | Use a real asset or none |
| Emoji as interface icons | Platform-dependent, unstyleable, often unlabeled | `VibeIcon` with a label or `aria-hidden` |
| Thick accent border on rounded cards | Competes with the content | Lighter border or a background shift |
| Placeholder-style illustrations (circles and blobs) | Says nothing about the product | One specific image or no image |

### 4.5 Motion

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| Pulsing status dot when nothing changes | Draws attention continuously | Static status; animate only activity in progress |
| Bounce or elastic easing | Routine actions feel fussy | Standard easing, 120–200 ms |
| Auto-scrolling marquee | Reads at the page's pace | Static list, or user-controlled |
| Scroll-reveal on every section | Content jumps and hides from search/AT | Render visible by default; animate sparingly |
| Blinking cursor in static copy | Looks editable | Only in real inputs |
| Count-up numbers on load | Delays reading; often lies about precision | Show the number |
| Hover scale on every card | Motion as a substitute for hierarchy | Reserve hover for interactive affordance |

### 4.6 Copy

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| "Supercharge", "seamless", "world-class", "unlock" | Claims without information | Say what the user can do and what changes |
| Em-dash in every sentence | A known model habit; affects rhythm | Full stops between thoughts; vary punctuation |
| "Not a feature. A platform." | Slogan cadence replacing explanation | State the distinction plainly, once |
| Lorem ipsum or invented names in a deliverable | The page was never tested with real content | Use real or realistic data; include a long-text row |
| Four helper lines for one field | Reading without deciding | One hint, visible only when needed |
| "Invalid input" | Blames the user, no recovery | "Enter an email like name@example.com" |
| Title Case In Every Label | Slows scanning; looks machine-set | Sentence case |
| Emoji in headings | Decorative, inconsistent across platforms | Remove, or use an icon with a text label |

### 4.7 Data and interaction (blocking)

| Tell | Why it reads as slop | Do instead |
| --- | --- | --- |
| Precisely fake numbers (99.99%, 10x, 24/7) | Invites trust without a source | Real data, or clearly labeled sample data |
| Charts without axes, units, or a conclusion | Looks analytical, communicates nothing | Label axes and units; state the takeaway in the caption |
| Placeholder as the only label | Fields become anonymous after typing | Persistent visible label; placeholder for an example |
| No loading, empty, or error state | The happy path is only one state | Design all four; keep the layout stable |
| Confirmation modal for every action | Interrupts routine work | Confirm destructive or irreversible actions only |
| Destructive action styled as primary | Accidental data loss | Secondary/danger placement, explicit verb |
| Search and filters that do not change results | Fake affordance | Wire them, or remove them |
| Hover-only affordances | Keyboard and touch users lose them | Visible controls; hover only enhances |
| Disabled control with no reason | The user cannot recover | Explain why, or keep it enabled and validate on submit |

### 4.8 Accessibility and quality (blocking)

| Tell | Why it fails | Do instead |
| --- | --- | --- |
| Contrast below AA | Unreadable for low vision | 4.5:1 body, 3:1 large text and UI boundaries |
| Invisible focus ring | Keyboard users are lost | Use Bootstrap's focus tokens; never `outline: none` alone |
| Skipped heading levels | Screen reader navigation breaks | h1 → h2 → h3, one h1 per page |
| Click targets under 24 px | Hard to hit, fails WCAG 2.5.8 | 44 px touch targets for primary controls |
| Horizontal scroll at 320 px | Layout breaks on phones | Test 320; allow wrapping and shrinking |
| Icon-only buttons without names | Unlabeled controls | `aria-label`, or visible text |
| Sideways scroll trapped by a popover | Menus clipped by containers | Use the component's teleport/strategy |

---

## 5. The protocol

### 5.1 Before writing code

1. **Inventory the content.** List the user's job, the data shown, the actions, and the states (empty, loading, error, success, long text, no permission).
2. **Name the archetype.** Auth, task page, list/detail, dashboard, checkout, marketing. The archetype decides the layout; the content should not be stretched into a template.
3. **Outline in text.** Headings and blocks only. Review the outline before markup. This is the cheapest place to fix structure.
4. **Choose one reference.** Name a Bootstrap example or an existing screen. "Match `checkout`'s structure, replace the content, add nothing."
5. **State the acceptance test.** Point at §3 for budgets and §9 for the ship gate; add 3–6 outcomes specific to this screen.

### 5.2 While building

- Use the design system, not your memory: VibeUI components, Bootstrap utilities, contract tokens.
- Change one screen per task. Do not restyle unrelated surfaces.
- When a requirement is ambiguous, stop and ask. Guessing produces rework and slop.
- Prefer deletion. If an element does not help a decision, remove it before styling it.
- Add states as you go. A screen without an empty state is half a screen.

### 5.3 The kill pass

Fast deletion before review. Do not restyle anything here.

- [ ] Labels that repeat the heading below or above them
- [ ] Badges with no status; icons with no recognition job
- [ ] A second primary button competing with the first
- [ ] Wrappers and cards that only add padding
- [ ] Decorative gradients, glows, grids, blobs, and stripes
- [ ] Motion that does not signal a state change
- [ ] Helper text that restates the label
- [ ] Numbers without a source, caption, or decision

State coverage and accessibility belong to the ship gate in §9.

### 5.4 Evidence before opinion

Capture screenshots at **320, 768, and 1440 px**. 320 is a reflow stress test, not a design target: it catches horizontal scroll, clipped menus, and unbreakable rows. Compare the screenshots next to the reference example. Reviewers should comment on the rendered result, not the markup. If the agent can drive a browser, require the screenshots in the task output.

---

## 6. Bootstrap examples as the reference corpus

The Bootstrap examples are not mood boards. They are proof that the framework's primitives compose into coherent pages with almost no custom CSS. They are small, responsive, accessible, and already use the same classes as VibeUI.

**Borrow the structure and proportions. Translate the elements into VibeUI components and props. Do not paste raw example markup.** The examples are Bootstrap HTML; VibeUI renders that markup for you, and pasting it bypasses the component API (and the accessibility wiring).

| Example | What it teaches | Reach for it when |
| --- | --- | --- |
| [Album](https://getbootstrap.com/docs/5.3/examples/album/) | Restraint with repeated cards; a grid that fits the content | Galleries, portfolios, indexes |
| [Pricing](https://getbootstrap.com/docs/5.3/examples/pricing/) | Comparison without decoration; one featured option | Plans, tiers, packages |
| [Checkout](https://getbootstrap.com/docs/5.3/examples/checkout/) | Form density, validation, order summary | Any multi-field form with a summary |
| [Sign-in](https://getbootstrap.com/docs/5.3/examples/sign-in/) | One task, centered, no marketing | Auth, password reset, 2FA |
| [Dashboard](https://getbootstrap.com/docs/5.3/examples/dashboard/) | App shell, sidebar, tables, charts | Admin and data-heavy screens |
| [Headers](https://getbootstrap.com/docs/5.3/examples/headers/) | Branding, nav, search without a hero | App headers and marketing nav |
| [Heroes](https://getbootstrap.com/docs/5.3/examples/heroes/) | Hero variants with clear calls to action | Landing page openings |
| [Features](https://getbootstrap.com/docs/5.3/examples/features/) | Explaining benefits without icon-card repetition | Product sections |
| [Sidebars](https://getbootstrap.com/docs/5.3/examples/sidebars/) | Navigation patterns for app shells | Dashboards, docs, inboxes |
| [Footers](https://getbootstrap.com/docs/5.3/examples/footers/) | Ending a page without a sitemap dump | Every page |
| [Navbars](https://getbootstrap.com/docs/5.3/examples/navbars/) | Responsive navigation options | Any top nav |
| [Blog](https://getbootstrap.com/docs/5.3/examples/blog/) | Editorial hierarchy, featured content | Articles, changelogs, news |
| [Product](https://getbootstrap.com/docs/5.3/examples/product/) | Product marketing with real grid work | Product and feature pages |
| [Cover](https://getbootstrap.com/docs/5.3/examples/cover/) | A single-message page | Launches, holding pages |
| [Sticky footer](https://getbootstrap.com/docs/5.3/examples/sticky-footer/) | Correct short-page layout | Auth, errors, legal |
| [Grid](https://getbootstrap.com/docs/5.3/examples/grid/) | Real responsive behavior of the grid | Before inventing a layout with CSS grid |
| [Cheatsheet](https://getbootstrap.com/docs/5.3/examples/cheatsheet/) | What the components actually look like | Checking a primitive before restyling it |

**How to use them with an agent**

1. Pick one example and cite the URL in the prompt.
2. Ask for the same structure with the new content. Do not ask for "inspiration".
3. Forbid new sections unless the content demands them.
4. Translate every raw element into its VibeUI equivalent (§7).
5. Compare screenshots at 320 and 1440.
6. If the result needs custom CSS, ask which Bootstrap primitive was missing. The answer is often "none; the layout was wrong".

---

## 7. VibeUI patterns and traps

VibeUI is a thin wrapper over Bootstrap 5.3. Most VibeUI-specific slop comes from bypassing the wrapper: hand-writing the markup, overriding the CSS, or driving the same control through two paths.

### 7.1 Traps

| Trap | Why it happens | Do instead |
| --- | --- | --- |
| `<VibeCard><VibeCard>…</VibeCard></VibeCard>`, or a manual `.card` inside `VibeCard` | Double surface; padding and borders stack | One `VibeCard`. Use `#header`, `#title`, `#footer`, `#image`, and the default slot for sections |
| `<button class="btn btn-primary">` or `<VibeButton class="btn-primary">` | Bypasses the prop API and duplicates classes | `<VibeButton variant="primary">` |
| `variant="outline-secondary"` | Not a variant; `outline` is a boolean prop | `<VibeButton variant="secondary" outline>` |
| `new bootstrap.Modal(el)` or `data-bs-toggle="modal"` in app code | Two control paths for one instance | `v-model` or the exposed `show()` / `hide()` |
| Hand-written `<ul class="dropdown-menu">` / `<li class="nav-item">` | Reimplements the component's markup and a11y | `:items` on `VibeDropdown` / `VibeNav`, or the `#item` slot |
| Manual `<label>` + input, placeholder-only fields | Loses the id/`aria-describedby` wiring | `VibeFormGroup` around the control |
| Custom table markup with sorting/filtering JS | Rebuilds a solved problem, usually worse | `VibeDataTable` with `:columns` and `:items` |
| `--bs-primary` overrides or global `.btn { … }` rules | Fights the design system at the root | Use `variant`/`size`/`outline`, then theme tokens if needed |
| `!important` to beat Bootstrap | Specificity fight; symptom of a structural mistake | Fix the structure, or use the component's prop |
| `import 'bootstrap'` or `bootstrap.Modal.getInstance()` | VibeUI owns the lifecycle; two owners conflict | Never import Bootstrap JS |
| `v-html` for structured content | Bypasses components and sanitization | Slots, components, or `VibeFormWysiwyg` for rich text |

### 7.2 Form: `VibeFormGroup` + `useForm`

Labels persist, errors come from the form model, and the submit button reflects validity. There is no manual id wiring and no placeholder-as-label.

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

### 7.3 Table: states are part of the component

`VibeDataTable` already owns the loading row and the empty row. Do not float a spinner over the table or render a second "no data" block beside it.

```vue
<script setup lang="ts">
import type { DataTableColumn } from '@velkymx/vibeui'

interface Invoice { id: number; customer: string; total: number }
const columns: DataTableColumn<Invoice>[] = [
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total', align: 'end', formatter: (v) => `$${v}` }
]
const props = defineProps<{ rows: Invoice[]; pending: boolean }>()
</script>

<template>
  <VibeDataTable
    :columns="columns"
    :items="props.rows"
    :loading="props.pending"
    row-key="id"
    empty-text="No invoices yet. Create one to get started."
  />
</template>
```

`empty-text` is the only empty-state hook today; there is no `#empty` slot. Put the primary action ("Create invoice") in the page header, where it is available in every state, rather than trying to place it inside the empty row.

### 7.4 Dialog: one control path

```vue
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const email = ref('')
const sendInvite = () => {
  open.value = false
}
</script>

<template>
  <VibeButton variant="primary" @click="open = true">Invite teammate</VibeButton>

  <VibeModal v-model="open" title="Invite a teammate" size="sm">
    <VibeFormGroup label="Email">
      <VibeFormInput v-model="email" type="email" autocomplete="email" />
    </VibeFormGroup>

    <template #footer>
      <VibeButton variant="secondary" @click="open = false">Cancel</VibeButton>
      <VibeButton variant="primary" :disabled="!email" @click="sendInvite">Send invite</VibeButton>
    </template>
  </VibeModal>
</template>
```

Do not add `data-bs-toggle="modal"` or a manual Bootstrap instance to the same dialog. One control path per instance.

`v-model` is the default: the parent owns the open/closed state, which keeps external triggers, routing, and form resets in sync. Use a template ref (`modal.value?.show()`, `.hide()`) only when the trigger is imperative and hoisting state would be noise, for example an async handler that opens a success dialog. Do not mix the two paths on one instance; VibeUI does not reconcile them.

### 7.5 Surfaces: build sections inside one card

```vue
<!-- Slop: three nested surfaces for one idea -->
<VibeCard>
  <VibeCard>
    <VibeCard>Invoice settings</VibeCard>
  </VibeCard>
</VibeCard>

<!-- Do: one surface, sections inside -->
<VibeCard title="Billing">
  <p class="text-body-secondary">Invoices are sent on the first of the month.</p>
  <VibeListGroup :items="invoices" />
  <template #footer>
    <VibeButton variant="secondary" size="sm">Manage plan</VibeButton>
  </template>
</VibeCard>
```

### 7.6 Data-driven by default

```vue
<VibeNav :items="tabs" pills />
<VibeDropdown text="Actions" :items="actions" />
<VibeBreadcrumb :items="trail" />
```

If a component accepts `:items`, `:options`, `:columns`, or `:bars`, do not hand-write its markup in a slot. Use the slot only for content the data shape cannot express.

### 7.7 Before and after: one settings fragment

A typical AI first pass: raw Bootstrap markup, nested surfaces, a decorative badge, placeholder-only fields, and three competing actions.

```vue
<div class="card p-4 shadow-lg" style="border-radius: 2rem; background: linear-gradient(135deg, #6d5dfc, #2f80ed)">
  <div class="card">
    <span class="badge bg-primary">SETTINGS</span>
    <h2 class="mt-2">Account settings</h2>
    <label class="form-label">Settings</label>
    <input class="form-control" placeholder="Full name" />
    <input class="form-control" placeholder="Email address" />
    <button class="btn btn-primary">Save</button>
    <button class="btn btn-primary">Update</button>
    <button class="btn btn-outline-primary">Cancel</button>
  </div>
</div>
```

The same fragment, translated to VibeUI (`form` from §7.2; `save` and `discard` are the screen's handlers):

```vue
<VibeCard title="Account settings">
  <form novalidate @submit.prevent="save">
    <VibeFormGroup label="Full name" help-text="Shown on invoices.">
      <VibeFormInput v-model="form.fields.name" autocomplete="name" />
    </VibeFormGroup>

    <VibeFormGroup label="Email" help-text="Used for receipts and sign-in.">
      <VibeFormInput v-model="form.fields.email" type="email" autocomplete="email" />
    </VibeFormGroup>

    <div class="d-flex gap-2">
      <VibeButton type="submit" variant="primary">Save changes</VibeButton>
      <VibeButton variant="secondary" @click="discard">Discard</VibeButton>
    </div>
  </form>
</VibeCard>
```

What changed:

- Three surfaces became one `VibeCard`; the inner padding and borders disappeared.
- The gradient, 2rem radius override, and decorative `SETTINGS` badge are gone.
- Placeholder-only inputs became persistent labels with optional help text.
- Two primary buttons and a third competing action became one primary submit and one secondary action.
- Raw Bootstrap markup became components with the id/`aria-describedby` and validation wiring built in.

---

## 8. Prompts you can paste

### 8.1 Agent contract

```
You are building UI inside an established Bootstrap 5.3 + VibeUI system.

Before writing code:
1. Read DESIGN.md, docs/unslop.md, and the reference screen I name.
2. Restate the user's job, the data, the actions, and all states.
3. Outline the page in text (headings and blocks). Wait for approval.

Build rules:
- Follow the per-view budgets in docs/unslop.md §3. Do not invent tokens.
- Use VibeUI components and props; no raw Bootstrap markup for components.
- No custom CSS unless you name the missing primitive and I approve it.
- Do not add sections I did not ask for. If something is ambiguous, stop and ask.
- Do not restyle unrelated screens.

Ship gate: docs/unslop.md §9. Before review, run the deletion pass in §5.3.
Report: files changed, states covered, known gaps, screenshots at 320/768/1440.
```

### 8.2 Task prompt

```
Screen: <name and route>
Job: <what the user is trying to finish>
Content: <the real fields, rows, actions, and copy>
Reference: <Bootstrap example URL or existing screen>
States: empty, loading, error, success, long text, no permission
Acceptance:
- <3–6 checkable outcomes>
Out of scope: <files and surfaces not to touch>
```

### 8.3 Review prompt

```
Review the rendered page (screenshots attached) against docs/unslop.md and DESIGN.md.
Do not restyle it. Report findings, most severe first, as:
  [severity] element — tell — replacement
Group by: structure, typography, color, visual details, motion, copy, interaction, a11y.
Call out anything that exceeds the design budgets, and any state that is missing.
If a finding is a matter of taste rather than a rule, say so and do not block on it.
```

### 8.4 Scope-repair prompt

Use this when a session has drifted.

```
Stop adding. Summarize the current page in five lines: job, hierarchy, actions, states, and open questions.
List every element that does not serve the job.
Propose a deletion pass before any further styling. Do not change files yet.
```

---

## 9. Ship gate

The definition of done. The kill pass (§5.3) is the fast deletion step; this is the gate.

- [ ] The outline matches the content; no section exists only to fill a template
- [ ] Budgets respected: accent, type sizes, weights, shadows, primary actions, card depth
- [ ] Every element earns its place: no repeated label, decorative badge, or filler icon
- [ ] Realistic content, including a long row, a long name, and an empty list
- [ ] Empty, loading, error, and success states designed
- [ ] Keyboard path complete, focus visible, targets large enough
- [ ] Contrast AA, heading order correct, controls labeled
- [ ] Responsive at 320 / 768 / 1440; no horizontal scroll at 320
- [ ] Dark mode and reduced motion respected
- [ ] Uses the design system; no unexplained custom CSS
- [ ] Screenshots attached; diff reviewed against the reference

### Automated checks

- `npx impeccable detect src/` (package `impeccable`, 4.10.x verified) for a first pass at AI-pattern tells. `--changed` scans only git-changed files; `--json` for CI (exit `0` clean, `2` primary findings, `1` a target could not be scanned); `--no-design-system` skips the `DESIGN.md` comparison. Source scans skip rules that need a parsed page, such as contrast and tiny text, so also scan the running app or built HTML (`detect http://localhost:PORT`, `--viewport 320x800` for a mobile pass).
- `axe` or Lighthouse for contrast, labels, heading order, and targets.
- Playwright screenshots at 320, 768, and 1440, committed as review evidence.
- Stylelint rules: no raw hex outside the token file, no `!important`, no `border-radius` literals, no `box-shadow` literals.
- A grep for banned copy: `supercharge|seamless|world-class|unlock|elevate|revolutionary`.
- A grep for `lorem|ipsum|John Doe|jane@example.com` in shipped pages.

---

## 10. Keeping the agent unslopped across a long task

- **Keep tasks one screen deep.** Large tasks drift and exhaust context.
- **Put decisions in files, not chat.** `DESIGN.md`, the reference list, and this protocol survive a context reset.
- **Ask for an outline before markup.** Structure errors are cheap in text.
- **Require evidence.** A screenshot or a DOM dump beats a description.
- **Re-read the contract after every interruption.** Models do not remember what is not in context.
- **Prefer subtraction.** The cheapest improvement to an AI-built page is usually a deletion.
- **When in doubt, compare to a Bootstrap example.** If the example can do it with utilities, the custom CSS is probably unnecessary.

---

## References

- [Impeccable: Slop catalog](https://impeccable.style/slop/) — the source taxonomy and a live detector.
- [Impeccable: detector docs](https://impeccable.style/docs/detector) — command options, exit codes, and `DESIGN.md` checks.
- [Bootstrap 5.3 Examples](https://getbootstrap.com/docs/5.3/examples/) — the reference corpus for structure and restraint.
- [Bootstrap 5.3 utilities](https://getbootstrap.com/docs/5.3/utilities/spacing/) — spacing, color, and display primitives before custom CSS.
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) — contrast, targets, focus, and reflow.
- [VibeUI Best Practices](./best-practices.md) — setup, props and slots, forms, accessibility.
- [VibeUI component docs](./README.md) — the exact API for every component.
