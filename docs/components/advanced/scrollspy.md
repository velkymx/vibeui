# VibeScrollspy

Automatically update navigation based on scroll position.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `String` | Required | CSS selector of navigation element to update |
| `offset` | `Number` | `10` | Offset pixels from top when calculating position |
| `method` | `String` | `'auto'` | Scroll method: `'auto'`, `'offset'`, or `'position'` |
| `smoothScroll` | `Boolean` | `false` | Enable smooth scrolling |
| `tag` | `String` | `'div'` | HTML tag to render |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `activate` | - | Emitted when a new item is activated |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Scrollable content with target sections |

## Usage

### Basic Scrollspy

```vue
<template>
  <div class="row">
    <div class="col-4">
      <VibeNav id="navbar-example" vertical pills :items="navItems" />
    </div>
    <div class="col-8">
      <VibeScrollspy
        target="#navbar-example"
        smooth-scroll
        style="height: 300px; overflow-y: auto"
      >
        <h4 id="item-1">Item 1</h4>
        <p>Content for item 1...</p>
        <h4 id="item-2">Item 2</h4>
        <p>Content for item 2...</p>
      </VibeScrollspy>
    </div>
  </div>
</template>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's ScrollSpy functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Manual Refresh:** If you dynamically add or remove content inside the scrollspy, you may need to call the `refresh()` method on the component instance via template refs.

**Instance Exposure:** You can access the underlying Bootstrap instance via template ref using the `bsInstance` property.

## Bootstrap CSS Classes

- Uses Bootstrap's `data-bs-spy="scroll"` attributes
- Targets navigation items automatically
