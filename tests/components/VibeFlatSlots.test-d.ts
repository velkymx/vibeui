import { h } from 'vue'
import VibeListGroup from '../../src/components/VibeListGroup.vue'
import VibeBreadcrumb from '../../src/components/VibeBreadcrumb.vue'
import type { ListGroupItem, BreadcrumbItem } from '../../src/types'

// #147 (flat components): item slots carry their item type. Limited to components
// that do not dynamically import 'bootstrap' (which is untyped under the
// tsconfig.types gate, a separate pre-existing gap).
h(VibeListGroup, { items: [] as ListGroupItem[] }, {
  item: (props: { item: ListGroupItem; index: number }) => `${props.item.text}:${props.index}`,
})

h(VibeBreadcrumb, { items: [] as BreadcrumbItem[] }, {
  item: (props: { item: BreadcrumbItem; index: number }) => `${props.index}`,
})
