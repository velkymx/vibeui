# VibeCol

Column component for Bootstrap's grid system. Supports responsive sizing, offsets, ordering, and alignment.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `Tag` | `'div'` | HTML element to render |
| `cols` | `ColSize \| Boolean` | `undefined` | Base column width (`1`-`12`, `'auto'`, or `true` for equal-width) |
| `sm` | `ColSize \| Boolean` | `undefined` | Column width at `sm` breakpoint |
| `md` | `ColSize \| Boolean` | `undefined` | Column width at `md` breakpoint |
| `lg` | `ColSize \| Boolean` | `undefined` | Column width at `lg` breakpoint |
| `xl` | `ColSize \| Boolean` | `undefined` | Column width at `xl` breakpoint |
| `xxl` | `ColSize \| Boolean` | `undefined` | Column width at `xxl` breakpoint |
| `offset` | `Number` | `undefined` | Base offset (`0`-`11`) |
| `offsetSm` | `Number` | `undefined` | Offset at `sm` breakpoint |
| `offsetMd` | `Number` | `undefined` | Offset at `md` breakpoint |
| `offsetLg` | `Number` | `undefined` | Offset at `lg` breakpoint |
| `offsetXl` | `Number` | `undefined` | Offset at `xl` breakpoint |
| `offsetXxl` | `Number` | `undefined` | Offset at `xxl` breakpoint |
| `order` | `OrderValue` | `undefined` | Base visual order |
| `orderSm` | `OrderValue` | `undefined` | Order at `sm` breakpoint |
| `orderMd` | `OrderValue` | `undefined` | Order at `md` breakpoint |
| `orderLg` | `OrderValue` | `undefined` | Order at `lg` breakpoint |
| `orderXl` | `OrderValue` | `undefined` | Order at `xl` breakpoint |
| `orderXxl` | `OrderValue` | `undefined` | Order at `xxl` breakpoint |
| `alignSelf` | `AlignItems` | `undefined` | Individual column vertical alignment |

### Type Reference

- **ColSize:** `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto'`
- **OrderValue:** `0 | 1 | 2 | 3 | 4 | 5 | 'first' | 'last'`
- **AlignItems:** `'start' | 'center' | 'end' | 'baseline' | 'stretch'`

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Column content |

## Usage

### Equal-width Columns

```vue
<template>
  <VibeRow>
    <!-- No sizing props = equal-width (col class) -->
    <VibeCol>1 of 3</VibeCol>
    <VibeCol>2 of 3</VibeCol>
    <VibeCol>3 of 3</VibeCol>
  </VibeRow>
</template>
```

### Specific Widths

```vue
<template>
  <VibeRow>
    <VibeCol :cols="8">Main content</VibeCol>
    <VibeCol :cols="4">Sidebar</VibeCol>
  </VibeRow>
</template>
```

### Responsive Columns

```vue
<template>
  <VibeRow>
    <!-- Full width on mobile, half on medium, third on large -->
    <VibeCol :cols="12" :md="6" :lg="4">Responsive</VibeCol>
    <VibeCol :cols="12" :md="6" :lg="4">Responsive</VibeCol>
    <VibeCol :cols="12" :md="12" :lg="4">Responsive</VibeCol>
  </VibeRow>
</template>
```

### Auto-width Column

```vue
<template>
  <VibeRow>
    <VibeCol :cols="2">Fixed</VibeCol>
    <VibeCol cols="auto">Sized to content</VibeCol>
    <VibeCol :cols="2">Fixed</VibeCol>
  </VibeRow>
</template>
```

### Offsets and Ordering

```vue
<template>
  <VibeRow>
    <VibeCol :cols="4" :offset="4">Centered column</VibeCol>
  </VibeRow>

  <VibeRow>
    <VibeCol :cols="6" order="last">Appears second</VibeCol>
    <VibeCol :cols="6" order="first">Appears first</VibeCol>
  </VibeRow>
</template>
```

### Vertical Alignment

```vue
<template>
  <VibeRow align-items="start" style="height: 200px;">
    <VibeCol>Top-aligned</VibeCol>
    <VibeCol align-self="end">Bottom-aligned</VibeCol>
  </VibeRow>
</template>
```
