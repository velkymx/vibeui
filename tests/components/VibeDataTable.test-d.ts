import { h } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #57: variant must be the Variant union, not an arbitrary string.
h(VibeDataTable, { variant: 'primary' })
h(VibeDataTable, { variant: 'success' })
// @ts-expect-error — 'bogus' is not a valid Variant
h(VibeDataTable, { variant: 'bogus' })
