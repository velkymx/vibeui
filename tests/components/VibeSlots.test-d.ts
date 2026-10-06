import { h } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'
import VibeSortable from '../../src/components/VibeSortable.vue'

// #147: scoped slots are typed to the row type T (not `any`).
interface Row { id: number; name: string; active: boolean }
const rows: Row[] = [{ id: 1, name: 'a', active: true }]

// DataTable: a cell slot receives the typed row, the typed cell value, and index.
h(VibeDataTable, { items: rows, columns: [] }, {
  'cell(name)': (props: { item: Row; value: string; index: number }) => `${props.item.name}:${props.value}:${props.index}`,
})

// Sortable: the default slot receives the typed row and index. Sortable's generic
// constraint is `Record<string, unknown>`, so the row type carries an index signature.
type SortRow = { id: number; name: string; [k: string]: unknown }
const sortRows: SortRow[] = [{ id: 1, name: 'a' }]
h(VibeSortable, { modelValue: sortRows }, {
  default: (props: { item: SortRow; index: number }) => `${props.item.name}:${props.index}`,
})
