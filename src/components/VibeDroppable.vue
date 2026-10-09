<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { getActiveDrag, clearActiveDrag } from './dndStore'

const props = defineProps({
  group: { type: String, default: 'default' },
  acceptGroups: { type: Array as () => string[], default: undefined },
  disabled: { type: Boolean, default: false },
  tag: { type: String, default: 'div' }
})

const emit = defineEmits<{
  (e: 'drop', payload: { payload: unknown; group: string; event: DragEvent | KeyboardEvent }): void
  (e: 'dragenter', event: DragEvent): void
  (e: 'dragleave', event: DragEvent): void
}>()

const isOver = ref(false)
let dragCounter = 0

watch(() => props.disabled, (disabled) => {
  if (disabled) {
    dragCounter = 0
    isOver.value = false
  }
})

const groupAccepted = (group: string): boolean => {
  if (props.acceptGroups && props.acceptGroups.length > 0) {
    return props.acceptGroups.includes(group)
  }
  return group === props.group
}

const readActiveDrag = (): { payload: unknown; group: string } | null => getActiveDrag()

const onDragEnter = (event: DragEvent) => {
  if (props.disabled) return
  const active = readActiveDrag()
  if (!active) return  // not from a VibeDraggable — ignore external/OS drags
  if (!groupAccepted(active.group)) return
  dragCounter += 1
  isOver.value = true
  emit('dragenter', event)
}

const onDragOver = (event: DragEvent) => {
  if (props.disabled) return
  // Same guards as enter/drop: preventDefault on dragover is the signal that
  // a drop is allowed, so OS files and wrong-group drags must not get it.
  const active = readActiveDrag()
  if (!active || !groupAccepted(active.group)) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

const onDragLeave = (event: DragEvent) => {
  if (props.disabled || dragCounter === 0) return
  dragCounter -= 1
  if (dragCounter <= 0) {
    isOver.value = false
    dragCounter = 0
    emit('dragleave', event)
  }
}

onBeforeUnmount(() => {
  dragCounter = 0
  isOver.value = false
})

const onDrop = (event: DragEvent) => {
  if (props.disabled) return
  event.preventDefault()
  isOver.value = false
  dragCounter = 0

  const active = readActiveDrag()
  if (!active) return  // not from a VibeDraggable — ignore external/OS drags
  if (!groupAccepted(active.group)) return

  emit('drop', { payload: active.payload, group: active.group, event })
}

// Keyboard drop (WCAG 2.1.1): a drag armed via keyboard on a VibeDraggable
// (Space/Enter) commits here with Enter, through the same group checks and
// drop emit as the pointer path. Only the gesture event differs.
const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  if (event.key !== 'Enter') return
  const active = readActiveDrag()
  if (!active) return
  if (!groupAccepted(active.group)) return
  event.preventDefault()
  isOver.value = false
  dragCounter = 0
  emit('drop', { payload: active.payload, group: active.group, event })
  // No DOM drop follows a keyboard commit, so the store document listener
  // never runs: disarm here like a pointer drop does.
  clearActiveDrag()
}
</script>

<template>
  <component
    :is="tag"
    class="vibe-droppable"
    :class="{ 'vibe-droppable-over': isOver, 'vibe-droppable-disabled': disabled }"
    :tabindex="disabled ? undefined : 0"
    data-vibe-droppable
    :data-vibe-group="group"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @keydown="onKeydown"
  >
    <slot :is-over="isOver" />
  </component>
</template>

<style scoped>
.vibe-droppable-over {
  outline: 2px dashed var(--bs-primary, #0d6efd);
  outline-offset: -2px;
}

.vibe-droppable-disabled {
  opacity: 0.6;
}
</style>
