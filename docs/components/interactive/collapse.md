# VibeCollapse

Toggle visibility of content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
| `modelValue` | `Boolean` | `false` | Control visibility (v-model) |
| `tag` | `String` | `'div'` | HTML tag to render |
| `horizontal` | `Boolean` | `false` | Horizontal collapse |
| `isNav` | `Boolean` | `false` | Adds `navbar-collapse` class for use inside `VibeNavbar` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when visibility changes |
| `show` | - | Emitted when collapse starts showing |
| `shown` | - | Emitted when collapse is fully shown |
| `hide` | - | Emitted when collapse starts hiding |
| `hidden` | - | Emitted when collapse is fully hidden |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Collapsible content |

## Usage

### Inside a Navbar

When used inside a `VibeNavbar`, add `is-nav` to get the `navbar-collapse` class and Vue-managed toggling via `VibeNavbarToggle`. No Bootstrap JS is needed.

```vue
<template>
  <VibeNavbar variant="dark" expand="lg">
    <VibeNavbarBrand href="#">Brand</VibeNavbarBrand>
    <VibeNavbarToggle target="navContent" />
    <VibeCollapse id="navContent" is-nav>
      <VibeNavbarNav :items="navItems" />
    </VibeCollapse>
  </VibeNavbar>
</template>
```

### Standalone with v-model

Outside of a navbar, use `v-model` to control visibility:

```vue
<template>
  <div>
    <VibeButton variant="primary" @click="show = !show">
      Toggle Collapse
    </VibeButton>

    <VibeCollapse id="collapseExample" v-model="show">
      <div class="card card-body mt-2">
        This content can be collapsed!
      </div>
    </VibeCollapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
</script>
```

### Standalone with Bootstrap JS

You can also use Bootstrap JS `data-bs-toggle` on a separate button to control a standalone collapse:

```vue
<template>
  <div>
    <VibeButton
      variant="primary"
      data-bs-toggle="collapse"
      data-bs-target="#collapseExample"
    >
      Toggle Collapse
    </VibeButton>

    <VibeCollapse id="collapseExample">
      <div class="card card-body mt-2">
        This content can be collapsed!
      </div>
    </VibeCollapse>
  </div>
</template>
```

### Horizontal Collapse

```vue
<template>
  <div>
    <VibeButton variant="primary" @click="show = !show">
      Toggle Width
    </VibeButton>

    <div style="min-height: 120px">
      <VibeCollapse id="collapseWidthExample" v-model="show" horizontal>
        <div class="card card-body" style="width: 300px">
          This is horizontal collapse content!
        </div>
      </VibeCollapse>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
</script>
```

## Important Notes

- When used inside `VibeNavbar`, always add `is-nav`. This adds the `navbar-collapse` CSS class which Bootstrap needs for responsive behavior (`display: flex` above the navbar's expand breakpoint).
- Inside a `VibeNavbar`, visibility is managed through Vue's provide/inject — `VibeNavbarToggle` and `VibeCollapse` stay in sync without Bootstrap JS.
- Standalone usage supports both `v-model` and Bootstrap JS `data-bs-toggle` approaches.

## Bootstrap CSS Classes

- `.collapse`
- `.navbar-collapse` (when `is-nav` is set)
- `.collapse-horizontal`
- `.show`
