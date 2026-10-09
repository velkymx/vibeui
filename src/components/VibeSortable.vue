<!-- NOTE: VibeSortable manages its own drag state (draggingIndex). It is NOT compatible
     with dndStore / VibeDraggable / VibeDroppable — mixing them causes undefined behavior.
     Use VibeDraggable + VibeDroppable for cross-list or free-form drag-drop scenarios. -->
<script setup lang="ts" generic="T extends object">
import { ref, onMounted, onBeforeUnmount, onActivated, type PropType } from 'vue'
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
  // Objects with an explicit key field: use it.
  if (isObject && props.itemKey) return readField(item, props.itemKey) as string | number
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

// Unified handlers read the row index from the element's data-sortable-index attribute,
// so the template binds one stable function reference instead of allocating a new inline
// arrow per item per render.
const indexOf = (event: Event): number =>
  Number((event.currentTarget as HTMLElement).dataset.sortableIndex)
const onDragStartEvt = (event: DragEvent) => onDragStart(event, indexOf(event))
const onDropEvt = (event: DragEvent) => onDrop(event, indexOf(event))

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
  <component :is="tag" class="vibe-sortable">
    <component
      :is="itemTag"
      v-for="(item, index) in modelValue"
      :key="resolveKey(item)"
      class="vibe-sortable-item"
      :class="{ 'vibe-sortable-dragging': draggingIndex === index }"
      :draggable="!disabled"
      data-vibe-sortable-item
      :data-sortable-index="index"
      @dragstart="onDragStartEvt"
      @dragover="onDragOver"
      @drop="onDropEvt"
      @dragend="onDragEnd"
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
