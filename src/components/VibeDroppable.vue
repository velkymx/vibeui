<script setup lang="ts">
import { ref } from 'vue'
import { getActiveDrag } from './dndStore'

const props = defineProps({
  group: { type: String, default: 'default' },
  acceptGroups: { type: Array as () => string[], default: undefined },
  disabled: { type: Boolean, default: false },
  tag: { type: String, default: 'div' }
})

const emit = defineEmits<{
  (e: 'drop', payload: { payload: unknown; group: string; event: DragEvent }): void
  (e: 'dragenter', event: DragEvent): void
  (e: 'dragleave', event: DragEvent): void
}>()

const isOver = ref(false)
let dragCounter = 0

const groupAccepted = (group: string): boolean => {
  if (props.acceptGroups && props.acceptGroups.length > 0) {
    return props.acceptGroups.includes(group)
  }
  return group === props.group
}

const readActiveDrag = (): { payload: unknown; group: string } | null => getActiveDrag()

const onDragEnter = (event: DragEvent) => {
  if (props.disabled) return
  dragCounter += 1
  isOver.value = true
  emit('dragenter', event)
}

const onDragOver = (event: DragEvent) => {
  if (props.disabled) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

const onDragLeave = (event: DragEvent) => {
  if (props.disabled) return
  dragCounter -= 1
  if (dragCounter <= 0) {
    isOver.value = false
    dragCounter = 0
  }
  emit('dragleave', event)
}

const onDrop = (event: DragEvent) => {
  if (props.disabled) return
  event.preventDefault()
  isOver.value = false
  dragCounter = 0

  const active = readActiveDrag()
  const incomingGroup = active?.group ?? props.group
  if (!groupAccepted(incomingGroup)) return

  emit('drop', { payload: active?.payload, group: incomingGroup, event })
}
</script>

<template>
  <component
    :is="tag"
    class="vibe-droppable"
    :class="{ 'vibe-droppable-over': isOver, 'vibe-droppable-disabled': disabled }"
    data-vibe-droppable
    :data-vibe-group="group"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
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
