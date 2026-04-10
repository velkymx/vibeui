# VibeContainer

Responsive container component wrapping Bootstrap's `.container`, `.container-fluid`, and `.container-{breakpoint}` classes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fluid` | `Boolean \| ContainerType` | `false` | `false` = `.container`, `true` = `.container-fluid`, or a breakpoint (`'sm'`, `'md'`, `'lg'`, `'xl'`, `'xxl'`) for `.container-{breakpoint}` |
| `tag` | `Tag` | `'div'` | HTML element to render |

### ContainerType

`'sm' | 'md' | 'lg' | 'xl' | 'xxl'`

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Container content |

## Usage

### Fixed-width Container

```vue
<template>
  <VibeContainer>
    <p>Responsive fixed-width container</p>
  </VibeContainer>
</template>
```

### Fluid Container

```vue
<template>
  <VibeContainer fluid>
    <p>Full-width container spanning the entire viewport</p>
  </VibeContainer>
</template>
```

### Responsive Breakpoint Container

```vue
<template>
  <!-- 100% wide until the md breakpoint, then fixed-width -->
  <VibeContainer fluid="md">
    <p>Fluid until medium breakpoint</p>
  </VibeContainer>
</template>
```
