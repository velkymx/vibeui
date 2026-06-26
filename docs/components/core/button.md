# VibeButton

Button component with variants, sizes, and support for links and router-links.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `'primary'` | Button color variant |
| `size` | `Size` | `undefined` | Button size: `'sm'` or `'lg'` |
| `outline` | `Boolean` | `false` | Use outline style instead of solid |
| `disabled` | `Boolean` | `false` | Disable the button |
| `type` | `ButtonType` | `'button'` | Button type: `'button'`, `'submit'`, or `'reset'` |
| `href` | `String` | `undefined` | Renders as anchor tag with href |
| `to` | `String\|Object` | `undefined` | Renders as router-link with to prop |
| `active` | `Boolean` | `false` | Apply active state styling |
| `focusRing` | `Boolean` | `false` | Enable the Bootstrap 5.3 focus-ring helper |

## Accessibility

**Disabled contrast (WCAG 1.4.3):** The disabled state overrides Bootstrap's default `opacity: 0.65` fade with full-opacity body tokens (`--bs-body-color` / `--bs-tertiary-bg`), keeping label contrast ≥ 4.5:1 in both light and dark mode.

**Icon-only buttons (WCAG 4.1.2):** A button whose slot contains only an icon (no visible text) must have an `aria-label` or `aria-labelledby` attribute so screen readers can announce its purpose. In development mode, VibeButton logs a `console.warn` when this is missing.

```vue
<!-- correct -->
<VibeButton aria-label="Delete item">
  <i class="bi bi-trash" aria-hidden="true" />
</VibeButton>

<!-- incorrect — no accessible name -->
<VibeButton>
  <i class="bi bi-trash" />
</VibeButton>
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Emitted when button is clicked (unless disabled) |
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Button content |

## Usage

### Basic Buttons

```vue
<template>
  <div>
    <VibeButton variant="primary">Primary</VibeButton>
    <VibeButton variant="secondary">Secondary</VibeButton>
    <VibeButton variant="success">Success</VibeButton>
  </div>
</template>
```

### Outline Buttons

```vue
<template>
  <div>
    <VibeButton variant="primary" outline>Outline Primary</VibeButton>
    <VibeButton variant="danger" outline>Outline Danger</VibeButton>
  </div>
</template>
```

### Button Sizes

```vue
<template>
  <div>
    <VibeButton variant="primary" size="sm">Small</VibeButton>
    <VibeButton variant="primary">Normal</VibeButton>
    <VibeButton variant="primary" size="lg">Large</VibeButton>
  </div>
</template>
```

### Disabled State

```vue
<template>
  <VibeButton variant="primary" disabled>Disabled Button</VibeButton>
</template>
```

### Link Buttons

```vue
<template>
  <div>
    <!-- Anchor link -->
    <VibeButton variant="primary" href="https://example.com">
      External Link
    </VibeButton>

    <!-- Router link (requires Vue Router) -->
    <VibeButton variant="secondary" :to="{ name: 'home' }">
      Home
    </VibeButton>
  </div>
</template>
```

### Form Submit

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <VibeButton type="submit" variant="success">Submit Form</VibeButton>
  </form>
</template>
```

### With Click Handler

```vue
<script setup>
const handleClick = () => {
  console.log('Button clicked!')
}
</script>

<template>
  <VibeButton variant="primary" @click="handleClick">
    Click Me
  </VibeButton>
</template>
```

## Bootstrap CSS Classes

- `.btn`
- `.btn-{variant}` or `.btn-outline-{variant}`
- `.btn-{size}`
- `.active`
- `.focus-ring`
