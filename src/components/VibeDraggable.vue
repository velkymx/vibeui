<script setup lang="ts">
import { ref } from 'vue'
import { setActiveDrag, clearActiveDrag } from './dndStore'

const props = defineProps({
  payload: { type: null, default: undefined } as {
    type: null
    default?: unknown
  },
  group: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  tag: { type: String, default: 'div' }
})

const emit = defineEmits<{
  (e: 'dragstart', payload: { payload: unknown; group: string; event: DragEvent }): void
  (e: 'dragend', payload: { payload: unknown; group: string; event: DragEvent }): void
}>()

const isDragging = ref(false)

const onDragStart = (event: DragEvent) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  isDragging.value = true
  setActiveDrag(props.payload, props.group)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/vibe-group', props.group)
  }
  emit('dragstart', { payload: props.payload, group: props.group, event })
}

const onDragEnd = (event: DragEvent) => {
  isDragging.value = false
  clearActiveDrag()
  emit('dragend', { payload: props.payload, group: props.group, event })
}
</script>

<template>
  <component
    :is="tag"
    class="vibe-draggable"
    :class="{ 'vibe-draggable-dragging': isDragging, 'vibe-draggable-disabled': disabled }"
    :draggable="!disabled"
    data-vibe-draggable
    :data-vibe-group="group"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <slot :is-dragging="isDragging" />
  </component>
</template>

<style scoped>
.vibe-draggable {
  cursor: grab;
}

.vibe-draggable-dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.vibe-draggable-disabled {
  cursor: not-allowed;
}
</style>
