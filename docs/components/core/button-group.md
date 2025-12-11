# VibeButtonGroup

Group buttons together in a single line or vertically.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `Size` | `undefined` | Size for all buttons in group: `'sm'` or `'lg'` |
| `vertical` | `Boolean` | `false` | Stack buttons vertically |
| `role` | `String` | `'group'` | ARIA role attribute |
| `ariaLabel` | `String` | `undefined` | ARIA label for accessibility |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Button group content (typically VibeButton components) |

## Usage

### Basic Button Group

```vue
<template>
  <VibeButtonGroup>
    <VibeButton variant="primary">Left</VibeButton>
    <VibeButton variant="primary">Middle</VibeButton>
    <VibeButton variant="primary">Right</VibeButton>
  </VibeButtonGroup>
</template>
```

### Button Toolbar

```vue
<template>
  <div>
    <VibeButtonGroup aria-label="First group">
      <VibeButton variant="secondary">1</VibeButton>
      <VibeButton variant="secondary">2</VibeButton>
      <VibeButton variant="secondary">3</VibeButton>
    </VibeButtonGroup>

    <VibeButtonGroup aria-label="Second group">
      <VibeButton variant="secondary">4</VibeButton>
      <VibeButton variant="secondary">5</VibeButton>
    </VibeButtonGroup>
  </div>
</template>
```

### Vertical Button Group

```vue
<template>
  <VibeButtonGroup vertical>
    <VibeButton variant="primary">Button 1</VibeButton>
    <VibeButton variant="primary">Button 2</VibeButton>
    <VibeButton variant="primary">Button 3</VibeButton>
  </VibeButtonGroup>
</template>
```

### Sized Button Groups

```vue
<template>
  <div>
    <VibeButtonGroup size="sm">
      <VibeButton variant="primary">Small</VibeButton>
      <VibeButton variant="primary">Group</VibeButton>
    </VibeButtonGroup>

    <VibeButtonGroup size="lg">
      <VibeButton variant="primary">Large</VibeButton>
      <VibeButton variant="primary">Group</VibeButton>
    </VibeButtonGroup>
  </div>
</template>
```

### Mixed Button Types

```vue
<template>
  <VibeButtonGroup>
    <VibeButton variant="danger">Delete</VibeButton>
    <VibeButton variant="warning" outline>Archive</VibeButton>
    <VibeButton variant="success">Save</VibeButton>
  </VibeButtonGroup>
</template>
```

## Bootstrap CSS Classes

- `.btn-group`
- `.btn-group-vertical`
- `.btn-group-{size}`
