# VibeScrollspy

Automatically update navigation based on scroll position. Requires Bootstrap JS.

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
      <VibeNav id="navbar-example" vertical pills>
        <VibeNavItem href="#item-1">Item 1</VibeNavItem>
        <VibeNavItem href="#item-2">Item 2</VibeNavItem>
        <VibeNavItem href="#item-3">Item 3</VibeNavItem>
      </VibeNav>
    </div>
    <div class="col-8">
      <VibeScrollspy
        target="#navbar-example"
        :offset="10"
        smooth-scroll
        style="height: 300px; overflow-y: auto"
      >
        <h4 id="item-1">Item 1</h4>
        <p>Content for item 1...</p>
        <h4 id="item-2">Item 2</h4>
        <p>Content for item 2...</p>
        <h4 id="item-3">Item 3</h4>
        <p>Content for item 3...</p>
      </VibeScrollspy>
    </div>
  </div>
</template>
```

### Nested Navigation

```vue
<template>
  <div class="row">
    <div class="col-4">
      <VibeNav id="navbar-nested" vertical pills>
        <VibeNavItem href="#item-1">Item 1</VibeNavItem>
        <VibeNav vertical pills class="ms-3">
          <VibeNavItem href="#item-1-1">Item 1-1</VibeNavItem>
          <VibeNavItem href="#item-1-2">Item 1-2</VibeNavItem>
        </VibeNav>
        <VibeNavItem href="#item-2">Item 2</VibeNavItem>
        <VibeNavItem href="#item-3">Item 3</VibeNavItem>
      </VibeNav>
    </div>
    <div class="col-8">
      <VibeScrollspy
        target="#navbar-nested"
        :offset="10"
        smooth-scroll
        style="height: 300px; overflow-y: auto"
      >
        <div id="item-1">
          <h4>Item 1</h4>
          <div id="item-1-1">
            <h5>Item 1-1</h5>
            <p>Content...</p>
          </div>
          <div id="item-1-2">
            <h5>Item 1-2</h5>
            <p>Content...</p>
          </div>
        </div>
        <div id="item-2">
          <h4>Item 2</h4>
          <p>Content...</p>
        </div>
        <div id="item-3">
          <h4>Item 3</h4>
          <p>Content...</p>
        </div>
      </VibeScrollspy>
    </div>
  </div>
</template>
```

### With List Group

```vue
<template>
  <div class="row">
    <div class="col-4">
      <VibeListGroup id="list-example">
        <VibeListGroupItem href="#list-item-1">Item 1</VibeListGroupItem>
        <VibeListGroupItem href="#list-item-2">Item 2</VibeListGroupItem>
        <VibeListGroupItem href="#list-item-3">Item 3</VibeListGroupItem>
        <VibeListGroupItem href="#list-item-4">Item 4</VibeListGroupItem>
      </VibeListGroup>
    </div>
    <div class="col-8">
      <VibeScrollspy
        target="#list-example"
        style="height: 300px; overflow-y: auto"
      >
        <h4 id="list-item-1">Item 1</h4>
        <p>Content for item 1...</p>
        <h4 id="list-item-2">Item 2</h4>
        <p>Content for item 2...</p>
        <h4 id="list-item-3">Item 3</h4>
        <p>Content for item 3...</p>
        <h4 id="list-item-4">Item 4</h4>
        <p>Content for item 4...</p>
      </VibeScrollspy>
    </div>
  </div>
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

## Bootstrap CSS Classes

- Uses Bootstrap's `data-bs-spy="scroll"` attributes
- Targets navigation items automatically
