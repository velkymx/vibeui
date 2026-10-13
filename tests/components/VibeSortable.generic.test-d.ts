import { h } from 'vue'
import VibeSortable from '../../src/components/VibeSortable.vue'

// #162: a plain interface (no index signature) must be a valid row type,
// matching VibeDataTable (#38). Before the fix the generic was
// `T extends Record<string, unknown>`, so the first h() call errored TS2344.
interface SortRow { id: number; name: string }
const rows: SortRow[] = [{ id: 1, name: 'a' }]

// Plain rows accepted (T inferred from modelValue alone; passing itemKey in the
// same h() call defeats generic inference, so the key narrowing below is
// asserted directly against the row's key union, which is the prop's type).
h(VibeSortable, { modelValue: rows })

// itemKey is typed `keyof T & string`, so row keys autocomplete and bogus keys
// are rejected.
const goodKey: keyof SortRow & string = 'id'
void goodKey
// @ts-expect-error 'bogus' is not a key of SortRow
const badKey: keyof SortRow & string = 'bogus'
void badKey
