# VibeRow

Row component for Bootstrap's grid system. Provides gutters, row columns, and alignment props.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `Tag` | `'div'` | HTML element to render |
| `gutters` | `GutterSize` | `undefined` | Base gutter size (both axes) |
| `guttersX` | `GutterSize` | `undefined` | Horizontal gutter size |
| `guttersY` | `GutterSize` | `undefined` | Vertical gutter size |
| `guttersSm` | `GutterSize` | `undefined` | Gutter size at `sm` breakpoint |
| `guttersMd` | `GutterSize` | `undefined` | Gutter size at `md` breakpoint |
| `guttersLg` | `GutterSize` | `undefined` | Gutter size at `lg` breakpoint |
| `guttersXl` | `GutterSize` | `undefined` | Gutter size at `xl` breakpoint |
| `guttersXxl` | `GutterSize` | `undefined` | Gutter size at `xxl` breakpoint |
| `guttersXSm` | `GutterSize` | `undefined` | Horizontal gutter at `sm` breakpoint |
| `guttersXMd` | `GutterSize` | `undefined` | Horizontal gutter at `md` breakpoint |
| `guttersXLg` | `GutterSize` | `undefined` | Horizontal gutter at `lg` breakpoint |
| `guttersXXl` | `GutterSize` | `undefined` | Horizontal gutter at `xl` breakpoint |
| `guttersXXxl` | `GutterSize` | `undefined` | Horizontal gutter at `xxl` breakpoint |
| `guttersYSm` | `GutterSize` | `undefined` | Vertical gutter at `sm` breakpoint |
| `guttersYMd` | `GutterSize` | `undefined` | Vertical gutter at `md` breakpoint |
| `guttersYLg` | `GutterSize` | `undefined` | Vertical gutter at `lg` breakpoint |
| `guttersYXl` | `GutterSize` | `undefined` | Vertical gutter at `xl` breakpoint |
| `guttersYXxl` | `GutterSize` | `undefined` | Vertical gutter at `xxl` breakpoint |
| `rowCols` | `RowColsSize` | `undefined` | Number of columns per row |
| `rowColsSm` | `RowColsSize` | `undefined` | Columns per row at `sm` breakpoint |
| `rowColsMd` | `RowColsSize` | `undefined` | Columns per row at `md` breakpoint |
| `rowColsLg` | `RowColsSize` | `undefined` | Columns per row at `lg` breakpoint |
| `rowColsXl` | `RowColsSize` | `undefined` | Columns per row at `xl` breakpoint |
| `rowColsXxl` | `RowColsSize` | `undefined` | Columns per row at `xxl` breakpoint |
| `alignItems` | `AlignItems` | `undefined` | Vertical alignment of columns |
| `justifyContent` | `JustifyContent` | `undefined` | Horizontal distribution of columns |

### Type Reference

- **GutterSize:** `0 | 1 | 2 | 3 | 4 | 5`
- **RowColsSize:** `1 | 2 | 3 | 4 | 5 | 6`
- **AlignItems:** `'start' | 'center' | 'end' | 'baseline' | 'stretch'`
- **JustifyContent:** `'start' | 'center' | 'end' | 'around' | 'between' | 'evenly'`

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Row content (typically `VibeCol` components) |

## Usage

### Basic Grid

```vue
<template>
  <VibeContainer>
    <VibeRow>
      <VibeCol>Column 1</VibeCol>
      <VibeCol>Column 2</VibeCol>
      <VibeCol>Column 3</VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

### With Gutters

```vue
<template>
  <VibeContainer>
    <VibeRow :gutters="3" :guttersY="4">
      <VibeCol :cols="6">Col 1</VibeCol>
      <VibeCol :cols="6">Col 2</VibeCol>
      <VibeCol :cols="6">Col 3</VibeCol>
      <VibeCol :cols="6">Col 4</VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

### Row Columns

```vue
<template>
  <VibeContainer>
    <!-- Automatically size each child to 1/3 width -->
    <VibeRow :row-cols="3">
      <VibeCol>Item 1</VibeCol>
      <VibeCol>Item 2</VibeCol>
      <VibeCol>Item 3</VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

### Alignment

```vue
<template>
  <VibeContainer>
    <VibeRow align-items="center" justify-content="between">
      <VibeCol :cols="4">Left</VibeCol>
      <VibeCol :cols="4">Right</VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```
