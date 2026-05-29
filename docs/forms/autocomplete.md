# VibeAutocomplete

Search-as-you-type input backed by an array or async source, with keyboard navigation. Generic over the item type `T`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The text value of the input (v-model). |
| `source` | `T[] \| (query: string) => T[] \| Promise<T[]>` | — (required) | Array to filter, or a function returning matches (sync or async). |
| `itemText` | `(item: T) => string` | `undefined` | Maps an item to its display/filter text. Defaults to the string form of the item. |
| `minChars` | `number` | `1` | Minimum characters before searching. |
| `debounce` | `number` | `200` | Debounce in ms before running a query (`0` disables debouncing). |
| `maxResults` | `number` | `10` | Maximum number of results shown. |
| `placeholder` | `string` | `''` | Placeholder text. |
| `label` | `string` | `undefined` | Label text. |
| `id` | `string` | auto-generated | Element id. |
| `disabled` | `boolean` | `false` | Disable the input. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted as the user types and when an item is selected. |
| `select` | `T` | Emitted with the chosen item when a result is selected. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item: T, index: number, label: string }` | Custom rendering for each result row. |
| `empty` | — | Content shown when there are no results. Defaults to "No results". |

## Usage

### Array source

```vue
<script setup lang="ts">
import { ref } from 'vue'
const query = ref('')
const fruits = ['Apple', 'Apricot', 'Banana', 'Cherry', 'Mango']
</script>

<template>
  <VibeAutocomplete v-model="query" :source="fruits" label="Fruit" />
</template>
```

### Async source with typed items

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface User { id: number; name: string }
const value = ref('')

const search = async (q: string): Promise<User[]> => {
  const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`)
  return res.json()
}

const onSelect = (user: User) => console.log('picked', user.id)
</script>

<template>
  <VibeAutocomplete
    v-model="value"
    :source="search"
    :item-text="(u) => u.name"
    :min-chars="2"
    label="Assignee"
    @select="onSelect"
  >
    <template #item="{ item }">
      <strong>{{ item.name }}</strong> <small class="text-muted">#{{ item.id }}</small>
    </template>
    <template #empty>No users found</template>
  </VibeAutocomplete>
</template>
```

## Important Notes

- **Async race-safety:** in-flight async queries are token-guarded, so only the latest query's results are applied.
- **Keyboard support:** Arrow Up/Down move the highlight, Enter selects, Escape closes the menu. The combobox exposes `aria-expanded`, `aria-controls`, and `aria-activedescendant`.
- **Selection text:** selecting an item sets the input to the item's `itemText` (or string) value and emits both `update:modelValue` and `select`.
- **Outside click:** clicking outside the component closes the menu.

## Bootstrap CSS Classes

- `.form-control`
- `.form-label`

The dropdown menu, items, and empty state use VibeUI's own `.vibe-autocomplete*` classes (styled with Bootstrap CSS variables).
