# VibeCollapse

Toggle visibility of content with smooth transitions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier |
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

### Reactive Usage (v-model)

```vue
<template>
  <div>
    <VibeButton variant="primary" @click="show = !show">
      Toggle Collapse
    </VibeButton>

    <VibeCollapse v-model="show">
      <div class="card card-body mt-2">
        This content is controlled via Vue state with smooth animations.
      </div>
    </VibeCollapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
</script>
```

### Inside a Navbar

When used inside a `VibeNavbar`, add `is-nav` to get the `navbar-collapse` class. `VibeNavbarToggle` will automatically synchronize with this component.

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

### Horizontal Collapse

```vue
<template>
  <div>
    <VibeButton variant="primary" @click="show = !show">
      Toggle Width
    </VibeButton>

    <div style="min-height: 120px">
      <VibeCollapse v-model="show" horizontal>
        <div class="card card-body" style="width: 300px">
          This is horizontal collapse content!
        </div>
      </VibeCollapse>
    </div>
  </div>
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Collapse functionality when it is mounted, ensuring that smooth sliding transitions are used.

**State Synchronization:** Refactored to ensure that clicking a toggle (like `VibeNavbarToggle`) updates both Vue's internal state and Bootstrap's JavaScript instance simultaneously.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

## Bootstrap CSS Classes

- `.collapse`
- `.navbar-collapse` (when `is-nav` is set)
- `.collapse-horizontal`
- `.show`
