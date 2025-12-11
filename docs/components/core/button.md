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

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when button is clicked (unless disabled) |
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
