# Positioning Utilities

VibeUI exposes Bootstrap 5.3's position utility classes directly through a Bootstrap CSS import. These are static, declarative classes — pair them with `usePosition` (see `docs/composables/use-position.md`) when you need JS-driven anchoring.

## position-{value}

| Class | Effect |
|------|--------|
| `.position-static` | Default flow positioning |
| `.position-relative` | Relative to its normal position |
| `.position-absolute` | Relative to nearest positioned ancestor |
| `.position-fixed` | Relative to the viewport |
| `.position-sticky` | Switches to fixed when scroll threshold passed |

## top / start / bottom / end

For `.position-absolute`, `.position-fixed`, `.position-sticky`: place the element along a side of the containing box.

| Class | Position |
|------|----------|
| `.top-0` / `.top-50` / `.top-100` | 0%, 50%, 100% from top |
| `.start-0` / `.start-50` / `.start-100` | 0%, 50%, 100% from inline-start |
| `.bottom-0` / `.bottom-50` / `.bottom-100` | from bottom |
| `.end-0` / `.end-50` / `.end-100` | from inline-end |

## translate-middle

Shifts the element by –50% on one or both axes — useful for centering relative to its anchor coordinate.

| Class | Effect |
|------|--------|
| `.translate-middle` | `translate(-50%, -50%)` |
| `.translate-middle-x` | `translate(-50%, 0)` |
| `.translate-middle-y` | `translate(0, -50%)` |

## Common patterns

**Centering a card in its container:**

```html
<div class="position-relative" style="height: 200px;">
  <div class="position-absolute top-50 start-50 translate-middle">
    Centered
  </div>
</div>
```

**Sticky page header:**

```html
<header class="position-sticky top-0 bg-body z-3">
  <!-- ... -->
</header>
```

**Fixed FAB (floating action button):**

```html
<VibeButton variant="primary" class="position-fixed bottom-0 end-0 m-3 rounded-circle">
  +
</VibeButton>
```

**Notification badge offset on an avatar:**

```html
<div class="position-relative d-inline-block">
  <img src="avatar.png" class="rounded-circle" />
  <VibeBadge variant="danger" pill class="position-absolute top-0 start-100 translate-middle">
    3
  </VibeBadge>
</div>
```

## When to reach for `usePosition` instead

- The anchor is dynamic (not a parent in the DOM).
- You need viewport collision handling (flip / shift).
- You need to reposition on scroll, resize, or anchor mutation.
- The placement is computed at runtime (e.g. picker calendars, autocomplete menus).

For those cases, see [`usePosition`](../composables/use-position.md).
