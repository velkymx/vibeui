import { h } from 'vue'
import VibeModal from '../../src/components/VibeModal.vue'
import VibeNavbarNav from '../../src/components/VibeNavbarNav.vue'
import VibeProgress from '../../src/components/VibeProgress.vue'
import VibeStepper from '../../src/components/VibeStepper.vue'
import VibePagination from '../../src/components/VibePagination.vue'
import VibeTabContent from '../../src/components/VibeTabContent.vue'
import type {
  NavItem,
  DropdownItem,
  ProgressBar,
  TabPane,
  DataTableCellSlotProps,
} from '../../src/types'

// #147 remainder: scoped slots carry typed props, no any.
// Non-generic components assert via h() slot functions. Generic components
// (DataTable, Sortable) assert via their slot prop interfaces directly because
// h() cannot infer the SFC generic parameter; runtime slot wiring is covered by
// unit tests. Sortable plain-interface acceptance is tracked by #162.

// Modal default exposes bus payload.
h(VibeModal, {}, {
  default: (props: { payload: unknown }) => `${String(props.payload)}`,
})

// NavbarNav item + dropdown-item.
h(VibeNavbarNav, { items: [] as NavItem[] }, {
  item: (props: { item: NavItem; index: number }) => `${props.item.text}:${props.index}`,
  'dropdown-item': (props: { item: NavItem; child: DropdownItem; index: number; childIndex: number }) =>
    `${props.child.text}:${props.childIndex}`,
})

// Progress label.
h(VibeProgress, { bars: [] as ProgressBar[] }, {
  label: (props: { bar: ProgressBar; index: number }) => `${props.bar.value}:${props.index}`,
})

// Pagination page/prev/next.
h(VibePagination, { totalPages: 5 }, {
  page: (props: { page: number; active: boolean }) => `${props.page}:${props.active}`,
  prev: (props: { disabled: boolean }) => `${props.disabled}`,
  next: (props: { disabled: boolean }) => `${props.disabled}`,
})

// TabContent pane.
h(VibeTabContent, { panes: [] as TabPane[] }, {
  pane: (props: { pane: TabPane; index: number }) => `${props.pane.title}:${props.index}`,
})

// DataTable cell slot carries row type (generic T).
interface TableRow { id: number; name: string }
const cellProps: DataTableCellSlotProps<TableRow> = {
  item: { id: 1, name: 'a' },
  value: 'a',
  index: 0,
}
const cellName: string = cellProps.item.name
void cellName

// Stepper slots.
h(VibeStepper, { steps: [{ label: 'One' }] }, {
  marker: (props: { index: number; step: { label: string }; active: boolean }) =>
    `${props.index}:${props.active}`,
  label: (props: { index: number; step: { label: string } }) => `${props.step.label}`,
  actions: (props: { next: () => Promise<void>; prev: () => Promise<void>; isFirst: boolean; isLast: boolean }) =>
    `${props.isFirst}:${props.isLast}`,
})
