<script setup lang="ts">
import { computed } from 'vue'
import type { Tag, ListGroupItem, ComponentError } from '../types'
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'

const props = defineProps({
  flush: { type: Boolean, default: false },
  horizontal: { type: [Boolean, String], default: false },
  numbered: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'ul' | 'ol', default: 'ul' },
  items: { type: Array as () => ListGroupItem[], required: true },
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No items' }
})

const emit = defineEmits<{
  (e: 'item-click', payload: { item: ListGroupItem; index: number; event: Event }): void
  (e: 'component-error', error: ComponentError): void
}>()

// #147: type the item slot.
defineSlots<{
  item?: (props: { item: ListGroupItem; index: number }) => unknown
}>()

// Hoisted: a fresh object literal in :style defeats Vue's reference-based style
// patch check on every render (see #198).
const CLICKABLE_STYLE = { cursor: 'pointer' }

const listGroupClass = computed(() => {
  const classes = ['list-group']
  if (props.flush) classes.push('list-group-flush')
  if (props.numbered) classes.push('list-group-numbered')

  if (props.horizontal === true) {
    classes.push('list-group-horizontal')
  } else if (typeof props.horizontal === 'string') {
    classes.push(`list-group-horizontal-${props.horizontal}`)
  }

  return classes.join(' ')
})


// #34: resolve the wrapper element. An explicit item.tag wins (e.g. 'button'),
// otherwise fall back to the href/to based anchor/router-link/li.
// Runtime allowlist: the type union above covers TypeScript consumers, but list
// config frequently arrives from an API at runtime (see #199).
const ITEM_TAG_ALLOW = new Set(['li', 'button', 'div', 'span', 'a'])

const getItemTag = (item: ListGroupItem) => {
  if (item.tag && ITEM_TAG_ALLOW.has(item.tag)) return item.tag
  if (safeHref(item.href)) return 'a'
  if (item.to) return 'router-link'
  return 'li'
}

const getItemClass = (item: ListGroupItem) => {
  const classes = ['list-group-item']
  if (safeHref(item.href) || item.to || !item.disabled) classes.push('list-group-item-action')
  if (item.active) classes.push('active')
  if (item.disabled) classes.push('disabled')
  if (item.variant) classes.push(`list-group-item-${item.variant}`)
  // #34: per-item class passthrough.
  if (item.class) classes.push(item.class)
  return classes.join(' ')
}

// Per-item render data, computed once per items change instead of re-running
// tag/class/link resolution on every render (see #198). Same pattern as
// VibeDataTable's sortIconMap/thStyleMap.
const itemMeta = computed(() => {
  const tag = new Map<ListGroupItem, string>()
  const cls = new Map<ListGroupItem, string>()
  const links = new Map<ListGroupItem, Record<string, unknown>>()
  for (const item of props.items) {
    tag.set(item, getItemTag(item))
    cls.set(item, getItemClass(item))
    links.set(item, linkBindings(safeHref(item.href), item.to))
  }
  return { tag, cls, links }
})

const handleItemClick = (item: ListGroupItem, index: number, event: Event) => {
  if (!item.disabled) {
    emit('item-click', { item, index, event })
  }
}
</script>

<template>
  <component :is="tag" :class="listGroupClass">
    <div v-if="items.length === 0 && showEmpty" class="list-group-item text-body-secondary">
      {{ emptyText }}
    </div>
    <template v-for="(item, index) in items" :key="item.href ?? item.text ?? index">
    <component
      :is="itemMeta.tag.get(item)"
      :class="itemMeta.cls.get(item)"
      :style="!safeHref(item.href) && !item.to && !item.disabled ? CLICKABLE_STYLE : undefined"
      v-bind="itemMeta.links.get(item)"
      :type="itemMeta.tag.get(item) === 'button' ? 'button' : undefined"
      :disabled="itemMeta.tag.get(item) === 'button' ? item.disabled || undefined : undefined"
      :aria-disabled="item.disabled || undefined"
      :aria-current="item.active"
      @click="handleItemClick(item, index, $event)"
    >
      <!-- Scoped slot for custom item rendering -->
      <slot name="item" :item="item" :index="index">
        {{ item.text }}
      </slot>
    </component>
    </template>
  </component>
</template>
