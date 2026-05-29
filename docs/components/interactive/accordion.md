# VibeAccordion

Collapsible accordion component for organizing content in a data-driven way.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier for the accordion |
| `flush` | `Boolean` | `false` | Remove borders and rounded corners |
| `items` | `AccordionItem[]` | Required | Array of accordion items |
| `alwaysOpen` | `Boolean` | `false` | Don't collapse other items when one is opened |

### AccordionItem Interface

```typescript
interface AccordionItem {
  id: string
  title: string
  content: string
  show?: boolean
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `{ item, index }` | Emitted when an accordion item is clicked |
| `show` | `id` | Emitted when an item starts showing |
| `shown` | `id` | Emitted when an item is fully shown |
| `hide` | `id` | Emitted when an item starts hiding |
| `hidden` | `id` | Emitted when an item is fully hidden |
| `component-error` | `ComponentError` | Emitted if Bootstrap JS fails to load |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `title` | `{ item, index }` | Custom title rendering |
| `content` | `{ item, index }` | Custom content rendering |

## Usage

### Basic Example

```vue
<template>
  <VibeAccordion :items="accordionItems" />
</template>

<script setup>
const accordionItems = [
  {
    id: 'collapseOne',
    title: 'Accordion Item #1',
    content: 'This is the first item\'s content.',
    show: true
  },
  {
    id: 'collapseTwo',
    title: 'Accordion Item #2',
    content: 'This is the second item\'s content.'
  }
]
</script>
```

### Always Open

Items stay open when another item is opened:

```vue
<template>
  <VibeAccordion always-open :items="accordionItems" />
</template>
```

### Custom Title and Content (Slots)

Both the `title` and `content` slots receive `{ item, index }` so you can render rich markup while still driving the accordion from the `items` array:

```vue
<template>
  <VibeAccordion :items="accordionItems">
    <template #title="{ item }">
      <strong>{{ item.title }}</strong>
    </template>
    <template #content="{ item }">
      <div v-html="item.content" />
    </template>
  </VibeAccordion>
</template>

<script setup>
const accordionItems = [
  { id: 'one', title: 'Item #1', content: '<p>Rich <em>HTML</em> body.</p>', show: true },
  { id: 'two', title: 'Item #2', content: '<p>Second body.</p>' }
]
</script>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Collapse functionality for each item when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**Reactivity:** The `show` property in the `AccordionItem` objects is watched. Changing it in your parent state will trigger the corresponding Bootstrap transition.

**Item ids:** Each `item.id` (and the accordion `id`) must contain only alphanumeric characters, hyphens, and underscores — Bootstrap's internal `querySelector` breaks on CSS-special characters. In dev mode an unsafe id logs a console warning.

**Escape Hatch:** The exposed `_unsafe_bsInstances` template ref is a `Map` of the underlying Bootstrap Collapse instances keyed by item id. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on them directly **will** break the component. To re-sync after manual DOM changes, call the exposed `refresh()` method instead.

## Bootstrap CSS Classes

- `.accordion`
- `.accordion-flush`
- `.accordion-item`
- `.accordion-header`
- `.accordion-button`
- `.accordion-collapse`
- `.accordion-body`
