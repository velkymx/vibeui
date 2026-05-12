# VibeAutocomplete

Search-as-you-type input with array or async source. Generic over the item type for typed slot scopes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | Current input value (v-model) |
| `source` | `T[] \| (q: string) => T[] \| Promise<T[]>` | required | Static list or async fetcher |
| `minChars` | `Number` | `1` | Minimum chars before querying |
| `debounce` | `Number` | `200` | Debounce window (ms) for async sources |
| `placeholder` | `String` | `''` | |
| `label` | `String` | `undefined` | |
| `id` | `String` | auto | |
| `disabled` | `Boolean` | `false` | |
| `itemText` | `(item: T) => string` | `undefined` | Required when `T` is not a string |
| `maxResults` | `Number` | `10` | Cap on rendered items per query |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Input text changed |
| `select` | `T` | An item was chosen (click or Enter) |

### Keyboard

| Key | Action |
|-----|--------|
| `ArrowDown` | Open menu / move highlight down |
| `ArrowUp` | Move highlight up |
| `Enter` | Select highlighted item |
| `Escape` | Close menu |

### Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ item, index, label }` | Custom item rendering |
| `empty` | — | Shown when query yields no results |

## Examples

### Static array

```vue
<VibeAutocomplete
  v-model="city"
  :source="['Albany', 'Boston', 'Chicago', 'Denver']"
  placeholder="Find a city..."
/>
```

### Async API with custom rendering

```vue
<script setup>
async function searchUsers(q) {
  const res = await fetch(`/api/users?q=${q}`)
  return await res.json()  // [{ id, name, avatar }, ...]
}
</script>

<template>
  <VibeAutocomplete
    v-model="query"
    :source="searchUsers"
    :item-text="u => u.name"
    :min-chars="2"
    :debounce="300"
    @select="user => assign(user)"
  >
    <template #item="{ item }">
      <img :src="item.avatar" class="rounded-circle me-2" width="20" />
      {{ item.name }}
    </template>
    <template #empty>
      No matching users.
    </template>
  </VibeAutocomplete>
</template>
```
