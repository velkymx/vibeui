import type { DataTableColumn, DataTableCellSlotProps } from '../../src/types'

// #38: a plain interface (NO string index signature) must be a valid row type.
// Before the fix the generic was `T extends Record<string, unknown>`, so writing
// `DataTableColumn<PromptDef>` errored TS2344 (PromptDef lacks an index signature)
// and consumers had to cast. Relaxing the constraint to `T extends object` fixes it.
interface PromptDef { id: number; name: string; active: boolean }

// Columns accept the plain interface with no cast; `formatter` sees typed row/value.
const cols: DataTableColumn<PromptDef>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'id', label: 'ID', formatter: (value, row) => `${row.id}:${String(value)}` },
]
void cols

// `key` is narrowed to the row's own keys.
// @ts-expect-error 'bogus' is not a key of PromptDef
const bad: DataTableColumn<PromptDef> = { key: 'bogus', label: 'x' }
void bad

// Cell-slot props carry the plain interface through with full property typing.
const slot: DataTableCellSlotProps<PromptDef> = {
  item: { id: 1, name: 'a', active: true },
  value: 'a',
  index: 0,
}
const rowName: string = slot.item.name
void rowName
