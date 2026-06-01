# VibeScrollspy

Automatically update navigation based on scroll position.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `String` | Required | CSS selector of navigation element to update |
| `rootMargin` | `String` | `'0px 0px -25%'` | Intersection margin for triggering activation. Format: `'top right bottom left'` in CSS units |
| `offset` | `Number` | `undefined` | **Deprecated.** Use `rootMargin` instead. Ignored in Bootstrap 5.2+. |
| `method` | `String` | `'auto'` | Scroll detection method: `'auto'`, `'offset'`, or `'position'` |
| `smoothScroll` | `Boolean` | `false` | Enable smooth scrolling |
| `tag` | `String` | `'div'` | HTML tag to render |
| `height` | `String` | `'100%'` | CSS height of the scrollable container. Validated as a CSS length; invalid values fall back to `'100%'` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `activate` | `event` | Emitted when a new nav item is activated |
| `component-error` | `{ message, componentName, originalError }` | Emitted if Bootstrap JS is unavailable |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Scrollable content with target sections |

## Exposed Methods

| Method | Description |
|--------|-------------|
| `refresh()` | Recalculates section positions. Call after dynamic content changes. |

## Usage

### Basic Scrollspy

```vue
<template>
  <div class="row">
    <div class="col-4">
      <VibeNav id="navbar-example" vertical pills :items="navItems" />
    </div>
    <div class="col-8">
      <VibeScrollspy target="#navbar-example" :height="'300px'" smooth-scroll>
        <h4 id="item-1">Item 1</h4>
        <p>Content for item 1...</p>
        <h4 id="item-2">Item 2</h4>
        <p>Content for item 2...</p>
      </VibeScrollspy>
    </div>
  </div>
</template>

<script setup>
const navItems = [
  { text: 'Item 1', href: '#item-1' },
  { text: 'Item 2', href: '#item-2' }
]
</script>
```

### Adjusting the Activation Margin

`rootMargin` controls how early a section is activated relative to the scrollable viewport. The default `'0px 0px -25%'` activates a section when it enters the top 75% of the container.

```vue
<!-- Activate earlier — section activates when it crosses the midpoint -->
<VibeScrollspy target="#nav" root-margin="0px 0px -50%">
  ...
</VibeScrollspy>
```

### Refreshing After Dynamic Content

```vue
<script setup>
import { ref } from 'vue'

const scrollspy = ref(null)

async function loadMore() {
  // ... add content
  await nextTick()
  scrollspy.value.refresh()
}
</script>

<template>
  <VibeScrollspy ref="scrollspy" target="#nav">
    ...
  </VibeScrollspy>
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's ScrollSpy functionality when mounted, provided Bootstrap JavaScript is available.

**`rootMargin` replaces `offset`:** Bootstrap 5.2 replaced the `offset` integer with `rootMargin` (an IntersectionObserver-compatible margin string). The `offset` prop is deprecated and logs a console warning. Use `rootMargin` for all new usage.

**KeepAlive support:** Positions are recalculated when the component is reactivated inside `<KeepAlive>`.

**Validated height:** The `height` prop is validated as a CSS length string before being applied. Invalid values silently fall back to `'100%'` (CSS injection defense).
