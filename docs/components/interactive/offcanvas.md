# VibeOffcanvas

Hidden sidebar for navigation or additional content. Requires Bootstrap JS.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `title` | `String` | `''` | Offcanvas title |
| `placement` | `OffcanvasPlacement` | `'start'` | Placement: `'start'`, `'end'`, `'top'`, `'bottom'` |
| `backdrop` | `Boolean\|String` | `true` | Backdrop: `true`, `false`, or `'static'` |
| `scroll` | `Boolean` | `false` | Allow body scrolling |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when visibility changes |
| `show` | - | Emitted when offcanvas starts showing |
| `shown` | - | Emitted when offcanvas is fully shown |
| `hide` | - | Emitted when offcanvas starts hiding |
| `hidden` | - | Emitted when offcanvas is fully hidden |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Offcanvas body content |
| `header` | Custom header content |

## Usage

### Basic Offcanvas

```vue
<template>
  <div>
    <VibeButton
      variant="primary"
      data-bs-toggle="offcanvas"
      data-bs-target="#offcanvasExample"
    >
      Open Offcanvas
    </VibeButton>

    <VibeOffcanvas id="offcanvasExample" title="Offcanvas">
      <p>Some text as placeholder content.</p>
    </VibeOffcanvas>
  </div>
</template>
```

### Placement Options

```vue
<template>
  <div>
    <!-- Start (default - left) -->
    <VibeOffcanvas id="offcanvasStart" title="Left Side" placement="start">
      Content on the left
    </VibeOffcanvas>

    <!-- End (right) -->
    <VibeOffcanvas id="offcanvasEnd" title="Right Side" placement="end">
      Content on the right
    </VibeOffcanvas>

    <!-- Top -->
    <VibeOffcanvas id="offcanvasTop" title="Top" placement="top">
      Content on top
    </VibeOffcanvas>

    <!-- Bottom -->
    <VibeOffcanvas id="offcanvasBottom" title="Bottom" placement="bottom">
      Content on bottom
    </VibeOffcanvas>
  </div>
</template>
```

### Allow Body Scrolling

```vue
<template>
  <VibeOffcanvas
    id="offcanvasScroll"
    title="Scrollable"
    scroll
    :backdrop="false"
  >
    Content with body scroll enabled
  </VibeOffcanvas>
</template>
```

### Static Backdrop

```vue
<template>
  <VibeOffcanvas
    id="offcanvasStatic"
    title="Static Backdrop"
    backdrop="static"
  >
    Click outside won't close this offcanvas
  </VibeOffcanvas>
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

## Bootstrap CSS Classes

- `.offcanvas`
- `.offcanvas-{placement}`
- `.offcanvas-header`
- `.offcanvas-title`
- `.offcanvas-body`
