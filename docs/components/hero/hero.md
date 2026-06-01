# VibeHero

A hero / banner section. Renders a `<section>` with consistent padding, an inner container, and content alignment — covering the Bootstrap 5.3 hero patterns (centered, two-column, dark, bordered) plus full-bleed background image / gradient heroes.

```vue
<VibeHero variant="dark" text-variant="light">
  <h1 class="display-4 fw-bold">Build faster with VibeUI</h1>
  <p class="lead">A modern Vue 3 component library for Bootstrap 5.3.</p>
  <VibeButton variant="primary" size="lg">Get started</VibeButton>
</VibeHero>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `undefined` | Background color → `bg-{variant}` (same vocabulary as `VibeCard`) |
| `textVariant` | `Variant` | `undefined` | Text color → `text-{variant}` |
| `border` | `Variant` | `undefined` | Adds `border border-{variant} rounded-3` (the bordered-hero pattern) |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Content alignment → `text-{align}` |
| `fluid` | `Boolean \| ContainerType` | `false` | Inner container width (same vocabulary as `VibeContainer`) |
| `minHeight` | `String` | `undefined` | Sanitized via `safeLength`; when set, content is vertically centered |
| `bgImage` | `String` | `undefined` | Full-bleed background image URL; sanitized via `safeHref` (blocks `javascript:`/`data:`), rendered `cover`/`center` |
| `overlay` | `Boolean \| String` | `false` | Darkening layer over `bgImage` for legibility — `true` for a default dark scrim, or a CSS color (sanitized via `safeColor`) |
| `gradient` | `String` | `undefined` | CSS gradient background (e.g. `linear-gradient(135deg, #667eea, #764ba2)`); validated to `*-gradient(...)` only — no `url()`/`expression()` |
| `tag` | `Tag` | `'section'` | Root element tag |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Hero content. You supply the inner layout (a centered column, or a `VibeRow`/`VibeCol` split). |

## Examples

**Centered (Bootstrap "centered hero")**

```vue
<VibeHero>
  <VibeCol :lg="7" class="mx-auto">
    <h1 class="display-3 fw-bold">Photo Gallery</h1>
    <p class="lead">Curated photography from around the world.</p>
  </VibeCol>
</VibeHero>
```

**Two-column with gradient**

```vue
<VibeHero gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" align="start" class="text-white">
  <VibeRow class="align-items-center">
    <VibeCol :lg="6"><h1 class="display-3 fw-bold">Headline</h1></VibeCol>
    <VibeCol :lg="6"><img src="/demo.png" class="img-fluid rounded-4 shadow-lg"></VibeCol>
  </VibeRow>
</VibeHero>
```

**Full-bleed image with overlay**

```vue
<VibeHero bg-image="/banner.jpg" overlay min-height="400px" class="text-white">
  <h1 class="display-3 fw-bold">Welcome</h1>
</VibeHero>
```
