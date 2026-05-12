# VibeDraggable / VibeDroppable

Generic drag-and-drop primitives for kanban boards, builders, palette UIs. Communicates payloads through a shared module-level store, so payloads can be typed objects or non-serializable values (refs, functions) — no DataTransfer string round-trip.

## VibeDraggable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `payload` | `unknown` | `undefined` | Data passed to the matching droppable on drop |
| `group` | `String` | `'default'` | Tag used to match against droppable groups |
| `disabled` | `Boolean` | `false` | Disable dragging |
| `tag` | `String` | `'div'` | Element to render |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `dragstart` | `{ payload, group, event }` | Emitted on dragstart |
| `dragend` | `{ payload, group, event }` | Emitted on dragend, regardless of drop success |

### Slots

Default slot scope: `{ isDragging }`.

## VibeDroppable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `group` | `String` | `'default'` | Group accepted unless `acceptGroups` overrides |
| `acceptGroups` | `String[]` | `undefined` | Whitelist of groups that may drop here |
| `disabled` | `Boolean` | `false` | Reject all drops |
| `tag` | `String` | `'div'` | Element to render |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `drop` | `{ payload, group, event }` | Successful drop, only emitted when group matches |
| `dragenter` | `DragEvent` | |
| `dragleave` | `DragEvent` | |

### Slots

Default slot scope: `{ isOver }`.

## Examples

### Kanban column move

```vue
<script setup>
import { ref } from 'vue'
const todo = ref([{ id: 1, title: 'Wireframes' }])
const done = ref([])

function moveCard(card, from, to) {
  from.value = from.value.filter(c => c.id !== card.id)
  to.value.push(card)
}
</script>

<template>
  <div class="d-flex gap-3">
    <VibeDroppable group="cards" @drop="({ payload }) => moveCard(payload, todo, done)">
      <template #default="{ isOver }">
        <div :class="['col bg-light p-3', isOver ? 'border-primary' : '']">
          <h5>To do</h5>
          <VibeDraggable v-for="card in todo" :key="card.id" :payload="card" group="cards">
            <div class="card mb-2 p-2">{{ card.title }}</div>
          </VibeDraggable>
        </div>
      </template>
    </VibeDroppable>

    <VibeDroppable group="cards" @drop="({ payload }) => moveCard(payload, done, todo)">
      <h5>Done</h5>
      <VibeDraggable v-for="card in done" :key="card.id" :payload="card" group="cards">
        <div class="card mb-2 p-2">{{ card.title }}</div>
      </VibeDraggable>
    </VibeDroppable>
  </div>
</template>
```

### Multi-source whitelist

```vue
<VibeDroppable :accept-groups="['todo', 'done']" group="trash">
  <div class="trash-zone">Drop to delete</div>
</VibeDroppable>
```
