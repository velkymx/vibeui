# VibeNav

Data-driven navigation tabs and pills for organizing content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Boolean` | `false` | Use tabs style |
| `pills` | `Boolean` | `false` | Use pills style |
| `underline` | `Boolean` | `false` | Use the new Bootstrap 5.3 underline style |
| `fill` | `Boolean` | `false` | Fill available width proportionally |
| `justified` | `Boolean` | `false` | Fill available width equally |
| `vertical` | `Boolean` | `false` | Stack navigation vertically |
| `tag` | `String` | `'ul'` | HTML tag to render |
| `items` | `NavItem[]` | Required | Array of nav items |

### NavItem Interface

```typescript
interface NavItem {
  text: string
  href?: string
  to?: string | object
  /** Tab panel selector (e.g. '#panel-id') for tabs/pills mode with router-link items */
  target?: string
  active?: boolean
  disabled?: boolean
  children?: NavItem[] // Support for dropdowns
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index, event }` | Emitted when item is clicked |
| `show` | `event` | Emitted when a tab starts showing |
| `shown` | `event` | Emitted when a tab is fully shown |
| `hide` | `event` | Emitted when a tab starts hiding |
| `hidden` | `event` | Emitted when a tab is fully hidden |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item, index }` | Custom item rendering |

## Usage

### Interactive Tabs

When using the `tabs` or `pills` props, nav links with an `href` starting with `#` will automatically act as Bootstrap tab triggers.

```vue
<template>
  <div>
    <VibeNav tabs :items="navItems" />
    
    <VibeTabContent :panes="tabPanes" class="mt-3" />
  </div>
</template>

<script setup>
const navItems = [
  { text: 'Home', href: '#home', active: true },
  { text: 'Profile', href: '#profile' }
]

const tabPanes = [
  { id: 'home', content: 'Home content...', active: true },
  { id: 'profile', content: 'Profile content...' }
]
</script>
```

### Tabs with Vue Router Links

Items using `to` (router-link) also work in tabs/pills mode. Provide a `target` field pointing to the panel ID, and Bootstrap Tab events (`show`, `shown`, `hide`, `hidden`) will fire correctly:

```vue
<template>
  <VibeNav tabs :items="navItems" @shown="onShown" />
  <div class="tab-content mt-3">
    <div id="overview-pane" class="tab-pane fade show active">Overview content</div>
    <div id="settings-pane" class="tab-pane fade">Settings content</div>
  </div>
</template>

<script setup>
const navItems = [
  { text: 'Overview', to: '/overview', target: '#overview-pane', active: true },
  { text: 'Settings', to: '/settings', target: '#settings-pane' }
]

const onShown = (event) => {
  console.log('Tab shown:', event.target)
}
</script>
```

Items with `to` starting with `#` are also treated as tab targets without needing an explicit `target` field.

## Exposed Methods

| Method | Description |
|--------|-------------|
| `refresh()` | Tears down and re-initializes Bootstrap Tab instances. Call after dynamically changing items if needed. |

> **Escape hatch:** `_unsafe_bsInstances` (a `Map` of the underlying Bootstrap `Tab` instances) is also exposed. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on these directly WILL break the component.

## Important Notes

**`href` sanitization:** Item and child `href` values are sanitized. Only `https?://`, root-relative (`/path`), relative (`./`, `../`), and anchor (`#anchor`) URLs are allowed; `javascript:`, `data:`, and protocol-relative (`//`) URLs are stripped. Use `to` for Vue Router navigation.

**Disabled button items:** Items without `href` or `to` (plain button items) receive the HTML `disabled` attribute when `disabled: true` is set. Link and router-link items only get the disabled visual style — the browser attribute is omitted because `<a disabled>` has no native effect.

**Automatic Initialization:** When using `tabs` or `pills`, this component automatically initializes Bootstrap's Tab functionality for items that target a local panel ID via `href="#..."`, `target="#..."`, or `to="#..."`.

**State Management:** For complex tab state, combine `VibeNav` with `VibeTabContent` and manage the `active` state through your data.

## Bootstrap CSS Classes

- `.nav`
- `.nav-tabs`
- `.nav-pills`
- `.nav-underline`
- `.nav-item`
- `.nav-link`
