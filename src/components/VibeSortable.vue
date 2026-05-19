<!-- NOTE: VibeSortable manages its own drag state (draggingIndex). It is NOT compatible
     with dndStore / VibeDraggable / VibeDroppable — mixing them causes undefined behavior.
     Use VibeDraggable + VibeDroppable for cross-list or free-form drag-drop scenarios. -->
<script setup lang="ts" generic="T">
import { ref, onMounted, onBeforeUnmount, type PropType } from 'vue'

const props = defineProps({
  modelValue: { type: Array as PropType<T[]>, required: true },
  itemKey: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  tag: { type: String, default: 'div' },
  itemTag: { type: String, default: 'div' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', items: T[]): void
  (e: 'reorder', payload: { from: number; to: number; item: T }): void
}>()

const draggingIndex = ref<number | null>(null)

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

const clearDrag = () => { draggingIndex.value = null }
onMounted(() => {
  document.removeEventListener('dragend', clearDrag)
  document.addEventListener('dragend', clearDrag)
})
onBeforeUnmount(() => document.removeEventListener('dragend', clearDrag))
</script>

<template>
  <component :is="tag" class="vibe-sortable">
    <component
      :is="itemTag"
      v-for="(item, index) in modelValue"
      :key="itemKey ? (item as any)[itemKey] : index"
      class="vibe-sortable-item"
      :class="{ 'vibe-sortable-dragging': draggingIndex === index }"
      :draggable="!disabled"
      data-vibe-sortable-item
      @dragstart="(e: DragEvent) => onDragStart(e, index)"
      @dragover="onDragOver"
      @drop="(e: DragEvent) => onDrop(e, index)"
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
