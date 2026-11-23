<script setup lang="ts">
// Template type fixture, compiled by vue-tsc via tsconfig.types.json.
// `h()`-style slot assertions cannot check a generic component's slots: the
// SFC's T is not inferred from h() props, so slot names fall back permissively
// (see VibeScopedSlots.test-d.ts). Only a compiled template reproduces how
// consumers use `#cell(key)` / `#footer(key)`.
import VibeDataTable from '../../src/components/VibeDataTable.vue'
import type { DataTableColumn } from '../../src/types'

interface Row {
  id: number
  name: string
}

const rows: Row[] = [{ id: 1, name: 'a' }]
const columns: DataTableColumn<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name', footer: 'Total' }
]
</script>

<template>
  <VibeDataTable :items="rows" :columns="columns" expandable>
    <!-- #cell(key) receives the row, the per-key value, and the row index. -->
    <template #cell(name)="{ item, value, index }">
      {{ value.toUpperCase() }} {{ item.id }} {{ index.toFixed() }}
    </template>
    <!-- Annotated binding: the consumer pattern the 1.3.0 union broke. -->
    <template #cell(id)="{ value }: { value: number }">{{ value.toFixed() }}</template>

    <!-- #footer(key) receives the column definition only. -->
    <template #footer(name)="{ column }">{{ column.label }} {{ column.key }}</template>

    <template #expanded="{ item, index }">{{ item.name }} {{ index }}</template>
  </VibeDataTable>
</template>
