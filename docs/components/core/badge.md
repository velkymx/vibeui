# VibeBadge

Small count and labeling component with Bootstrap 5.3 styling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `'primary'` | Background color variant |
| `pill` | `Boolean` | `false` | Renders badge with rounded pill shape |
| `tag` | `String` | `'span'` | HTML tag to render: `'span'`, `'a'`, or any valid tag |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Badge content |

## Usage

### Basic Badge

```vue
<template>
  <VibeButton variant="primary">
    Notifications <VibeBadge variant="secondary">4</VibeBadge>
  </VibeButton>
</template>
```

### Pill Badges

```vue
<template>
  <div>
    <VibeBadge variant="primary" pill>Primary</VibeBadge>
    <VibeBadge variant="success" pill>Success</VibeBadge>
    <VibeBadge variant="danger" pill>Danger</VibeBadge>
  </div>
</template>
```

### Link Badges

```vue
<template>
  <VibeBadge tag="a" href="#" variant="primary">Link Badge</VibeBadge>
</template>
```

### All Variants

```vue
<template>
  <div>
    <VibeBadge variant="primary">Primary</VibeBadge>
    <VibeBadge variant="secondary">Secondary</VibeBadge>
    <VibeBadge variant="success">Success</VibeBadge>
    <VibeBadge variant="danger">Danger</VibeBadge>
    <VibeBadge variant="warning">Warning</VibeBadge>
    <VibeBadge variant="info">Info</VibeBadge>
    <VibeBadge variant="light">Light</VibeBadge>
    <VibeBadge variant="dark">Dark</VibeBadge>
  </div>
</template>
```

## Bootstrap CSS Classes

- `.badge`
- `.bg-{variant}`
- `.rounded-pill` (when `pill` is true)
