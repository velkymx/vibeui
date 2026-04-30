# VibeSortable

Drag-and-drop reorderable list. Generic over the row type; binds an ordered array via `v-model`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T[]` | required | Ordered array (v-model) |
| `disabled` | `Boolean` | `false` | Disable dragging |
| `tag` | `String` | `'div'` | Container element |
| `itemTag` | `String` | `'div'` | Element wrapping each item |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `T[]` | New ordered array after a successful drop |
| `reorder` | `{ from, to, item }` | Convenience event for persisting moves |

### Slots

The default slot is scoped per item with `{ item, index }`.

## Examples

```vue
<script setup>
import { ref } from 'vue'
const tasks = ref(['Wireframes', 'Backend', 'QA', 'Launch'])
</script>

<template>
  <VibeSortable v-model="tasks">
    <template #default="{ item, index }">
      <div class="card p-2 mb-2">
        {{ index + 1 }}. {{ item }}
      </div>
    </template>
  </VibeSortable>
</template>
```

Items get `data-vibe-sortable-item` for testability and styling. The currently dragging item gets a `vibe-sortable-dragging` class.

## When to use VibeSortable vs VibeDraggable

- **VibeSortable**: a single ordered list whose only operation is reorder.
- **VibeDraggable + VibeDroppable**: cross-list moves, kanban boards, builders, anywhere the source and target are different containers.
