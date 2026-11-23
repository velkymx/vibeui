<script setup lang="ts">
// NEGATIVE type fixture: this file MUST fail to compile. Each template case
// asserts that a slot prop is too strict to accept a wrong type or a prop that
// belongs to another slot family. `scripts/check-negative-types.mjs` compiles it
// with tsconfig.types.negative.json and asserts the exact diagnostics below, so
// a regression to loose slot types fails the gate. Do not "fix" this file.
import VibeDataTable from '../../../src/components/VibeDataTable.vue'
import type { DataTableColumn } from '../../../src/types'

interface Row {
  id: number
  name: string
}

const rows: Row[] = [{ id: 1, name: 'a' }]
const columns: DataTableColumn<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' }
]
</script>

<template>
  <VibeDataTable :items="rows" :columns="columns">
    <!-- TS2345 + TS2339: `name` is a string column, so { value: number } is not assignable -->
    <template #cell(name)="{ value }: { value: number }">{{ value.toFixed() }}</template>
    <!-- TS2339: a cell slot has no `column` prop -->
    <template #cell(id)="{ column }">{{ column }}</template>
    <!-- TS2339: a footer slot has no `item` prop -->
    <template #footer(name)="{ item }">{{ item }}</template>
    <!-- TS2339: no slot by that name -->
    <template #bogus(x)="props">{{ props }}</template>
  </VibeDataTable>
</template>
