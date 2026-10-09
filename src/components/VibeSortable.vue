<!-- NOTE: VibeSortable manages its own drag state (draggingIndex). It is NOT compatible
     with dndStore / VibeDraggable / VibeDroppable — mixing them causes undefined behavior.
     Use VibeDraggable + VibeDroppable for cross-list or free-form drag-drop scenarios. -->
<script setup lang="ts" generic="T extends object">
import { ref, nextTick, onMounted, onBeforeUnmount, onActivated, useTemplateRef, type PropType } from 'vue'
import { isDev } from '../composables/useEventBus'

const props = defineProps({
  modelValue: { type: Array as PropType<T[]>, required: true },
  // #162: narrowed to the row's keys so itemKey autocompletes (mirrors
  // DataTableColumn.key from #38). Runtime reads go through readField below.
  itemKey: { type: String as unknown as PropType<keyof T & string>, default: undefined },
  disabled: { type: Boolean, default: false },
  tag: { type: String, default: 'div' },
  itemTag: { type: String, default: 'div' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', items: T[]): void
  (e: 'reorder', payload: { from: number; to: number; item: T }): void
}>()

// #147: type the default slot to the row type T (typed item + index, not `any`).
defineSlots<{
  default?: (props: { item: T; index: number }) => unknown
}>()

const draggingIndex = ref<number | null>(null)

// #130: rows must keep a stable key across reorder so Vue moves the DOM node
// instead of re-patching each position in place (which leaks a row's slot-local
// state onto whatever item lands there). itemKey is preferred; without it we
// assign a stable id per item object (survives the splice reorder, which keeps
// the same references). A WeakMap keeps this type-safe (number) and leak-free.
const keyCache = new WeakMap<object, number>()
let keySeq = 0
let warnedNoKey = false
// #162: T is constrained to `object` so plain interfaces (no index signature)
// work as row types (#38). `object` cannot be indexed by a runtime string, so
// key reads go through this cast (same pattern as VibeDataTable.readField).
const readField = (row: T, key: string): unknown => (row as Record<string, unknown>)[key]
const resolveKey = (item: T): string | number => {
  const isObject = item !== null && typeof item === 'object'
  // Objects with an explicit key field: use it when it yields a usable key.
  // A missing field (typo'd item-key, heterogeneous rows) yields undefined,
  // which must NOT become the v-for key: fall through to identity below.
  if (isObject && props.itemKey) {
    const keyed = readField(item, props.itemKey)
    if (typeof keyed === 'string' || typeof keyed === 'number') return keyed
  }
  // Primitives: the value is the identity, stable across reorder.
  if (!isObject) return item as unknown as string | number
  // Objects without itemKey: assign a stable id per reference (survives the
  // splice reorder, which keeps the same object references). WeakMap keeps this
  // type-safe and leak-free. Warn once, since the id is not stable across
  // immutable replacement of items.
  if (isDev() && !warnedNoKey) {
    warnedNoKey = true
    console.warn(
      '[VibeSortable] No `itemKey` prop set for object rows. Rows are keyed by item ' +
      'identity, which is stable across reorder but not across immutable replacement ' +
      'of items. Pass :item-key="\'id\'" (the unique field on your row type).'
    )
  }
  let id = keyCache.get(item as object)
  if (id === undefined) {
    id = ++keySeq
    keyCache.set(item as object, id)
  }
  return id
}

const onDragStart = (event: DragEvent, index: number) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  draggingIndex.value = index
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const onDragOver = (event: DragEvent) => {
  if (props.disabled || draggingIndex.value === null) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

const onDrop = (event: DragEvent, targetIndex: number) => {
  if (props.disabled) return
  event.preventDefault()
  const from = draggingIndex.value
  draggingIndex.value = null
  if (from === null || from === targetIndex) return

  const next = [...props.modelValue]
  const [moved] = next.splice(from, 1)
  next.splice(targetIndex, 0, moved)
  emit('update:modelValue', next)
  emit('reorder', { from, to: targetIndex, item: moved })
}

const onDragEnd = () => {
  draggingIndex.value = null
}

// Keyboard reorder (WCAG 2.1.1): the row is focusable; Space/Enter grabs,
// arrows move the grabbed row, Escape cancels. Commits through the same
// splice plus emits as the pointer drop so watchers behave identically.
const grabbedIndex = ref<number | null>(null)

const moveRow = (from: number, to: number): void => {
  if (from === to) return
  const next = [...props.modelValue]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  emit('update:modelValue', next)
  emit('reorder', { from, to, item: moved })
}

const onRowKeydown = (event: KeyboardEvent, index: number): void => {
  if (props.disabled) return
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    grabbedIndex.value = grabbedIndex.value === index ? null : index
  } else if (event.key === 'Escape') {
    grabbedIndex.value = null
  } else if (grabbedIndex.value !== null && event.key === 'ArrowUp') {
    event.preventDefault()
    const from = grabbedIndex.value
    const to = Math.max(0, from - 1)
    moveRow(from, to)
    grabbedIndex.value = to
    focusRow(to)
  } else if (grabbedIndex.value !== null && event.key === 'ArrowDown') {
    event.preventDefault()
    const from = grabbedIndex.value
    const to = Math.min(props.modelValue.length - 1, from + 1)
    moveRow(from, to)
    grabbedIndex.value = to
    focusRow(to)
  }
}

// Programmatic reorder for consumers and keyboard-AT shims.
defineExpose({ move: moveRow })

const listRef = useTemplateRef<HTMLElement>('listRef')

// Focus follows the grabbed row across keyboard moves: keyed reorder moves
// the DOM node, but focus retention is not guaranteed (verify per
// environment), so re-focus by index after paint.
const focusRow = (at: number): void => {
  nextTick(() => {
    const el = listRef.value?.querySelectorAll('[data-vibe-sortable-item]')?.[at] as
      | HTMLElement
      | undefined
    el?.focus()
  })
}

// Unified handlers read the row index from the element's data-sortable-index attribute,
// so the template binds one stable function reference instead of allocating a new inline
// arrow per item per render.
const indexOf = (event: Event): number =>
  Number((event.currentTarget as HTMLElement).dataset.sortableIndex)
const onDragStartEvt = (event: DragEvent) => onDragStart(event, indexOf(event))
const onDropEvt = (event: DragEvent) => onDrop(event, indexOf(event))
const onRowKeydownEvt = (event: KeyboardEvent) => onRowKeydown(event, indexOf(event))

const clearDrag = () => { draggingIndex.value = null }
onMounted(() => {
  document.addEventListener('dragend', clearDrag)
})
onBeforeUnmount(() => document.removeEventListener('dragend', clearDrag))
// Reset stale drag state on KeepAlive reactivation — user may have been mid-drag
// when the component was deactivated; draggingIndex would remain non-null otherwise.
onActivated(() => { draggingIndex.value = null })
</script>

<template>
  <component :is="tag" ref="listRef" class="vibe-sortable">
    <component
      :is="itemTag"
      v-for="(item, index) in modelValue"
      :key="resolveKey(item)"
      class="vibe-sortable-item"
      :class="{ 'vibe-sortable-dragging': draggingIndex === index }"
      :draggable="!disabled"
      :tabindex="disabled ? undefined : 0"
      role="listitem"
      :aria-grabbed="grabbedIndex === index || undefined"
      data-vibe-sortable-item
      :data-sortable-index="index"
      @dragstart="onDragStartEvt"
      @dragover="onDragOver"
      @drop="onDropEvt"
      @dragend="onDragEnd"
      @keydown="onRowKeydownEvt"
    >
      <slot :item="item" :index="index" />
    </component>
  </component>
</template>

<style scoped>
.vibe-sortable-item {
  cursor: grab;
}

.vibe-sortable-item.vibe-sortable-dragging {
  opacity: 0.4;
  cursor: grabbing;
}
</style>
