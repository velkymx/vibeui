<script setup lang="ts">
import { ref, onBeforeUnmount, type PropType } from 'vue'
import { setActiveDrag, clearActiveDrag } from './dndStore'

const props = defineProps({
  payload: { type: null as unknown as PropType<unknown>, default: undefined },
  group: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  tag: { type: String, default: 'div' }
})

const emit = defineEmits<{
  (e: 'dragstart', payload: { payload: unknown; group: string; event: DragEvent | KeyboardEvent }): void
  (e: 'dragend', payload: { payload: unknown; group: string; event: DragEvent | KeyboardEvent }): void
}>()

const isDragging = ref(false)
// Keyboard-armed drag (WCAG 2.1.1): Space/Enter arms the same store the
// pointer path uses, so a focused VibeDroppable can drop it via Enter.
// The commit path (drop emit) is shared; only the gesture differs.
const keyboardArmed = ref(false)

const armKeyboard = (event: KeyboardEvent): void => {
  keyboardArmed.value = true
  setActiveDrag(props.payload, props.group)
  emit('dragstart', { payload: props.payload, group: props.group, event })
}

const disarmKeyboard = (event?: KeyboardEvent): void => {
  if (!keyboardArmed.value) return
  keyboardArmed.value = false
  clearActiveDrag()
  if (event) emit('dragend', { payload: props.payload, group: props.group, event })
}

const onKeydown = (event: KeyboardEvent): void => {
  if (props.disabled) return
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    if (keyboardArmed.value) disarmKeyboard(event)
    else armKeyboard(event)
  } else if (event.key === 'Escape') {
    disarmKeyboard(event)
  }
}

// An armed-then-unmounted source must not strand its payload in the store,
// where a later keyboard drop would receive it.
onBeforeUnmount(() => disarmKeyboard())

const onDragStart = (event: DragEvent) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  isDragging.value = true
  setActiveDrag(props.payload, props.group)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
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
    :tabindex="disabled ? undefined : 0"
    :aria-grabbed="isDragging || keyboardArmed"
    data-vibe-draggable
    :data-vibe-group="group"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @keydown="onKeydown"
  >
    <slot :is-dragging="isDragging || keyboardArmed" />
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
