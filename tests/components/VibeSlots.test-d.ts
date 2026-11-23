import { h } from 'vue'
import VibeSortable from '../../src/components/VibeSortable.vue'

// DataTable's per-column slots (#147 cell, #283 footer) are generic over the row
// type, which h() cannot infer — slot props passed here would not be checked at
// all (a wrong annotation compiles). They are covered by the template fixture
// tests/types/datatable-slots.vue, which vue-tsc does type-check.

// Sortable: the default slot receives the typed row and index. Sortable's generic
// constraint is `Record<string, unknown>`, so the row type carries an index signature.
type SortRow = { id: number; name: string; [k: string]: unknown }
const sortRows: SortRow[] = [{ id: 1, name: 'a' }]
h(VibeSortable, { modelValue: sortRows }, {
  default: (props: { item: SortRow; index: number }) => `${props.item.name}:${props.index}`,
})
