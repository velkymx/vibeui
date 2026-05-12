<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const ALL_HANDLES: Handle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

const props = defineProps({
  handles: { type: Array as PropType<Handle[]>, default: () => ['se'] as Handle[] },
  width: { type: Number, default: 200 },
  height: { type: Number, default: 150 },
  minWidth: { type: Number, default: 20 },
  maxWidth: { type: Number, default: Infinity },
  minHeight: { type: Number, default: 20 },
  maxHeight: { type: Number, default: Infinity },
  aspectRatio: { type: Number, default: undefined },
  grid: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'update:width', width: number): void
  (e: 'update:height', height: number): void
  (e: 'resizestart', payload: { width: number; height: number }): void
  (e: 'resize', payload: { width: number; height: number; handle: Handle }): void
  (e: 'resizeend', payload: { width: number; height: number }): void
}>()

const currentWidth = ref(props.width)
const currentHeight = ref(props.height)
const activeHandle = ref<Handle | null>(null)
const startX = ref(0)
const startY = ref(0)
const startW = ref(0)
const startH = ref(0)

watch(
  () => props.width,
  (val) => {
    if (val !== currentWidth.value) currentWidth.value = val
  }
)

watch(
  () => props.height,
  (val) => {
    if (val !== currentHeight.value) currentHeight.value = val
  }
)

const snap = (v: number): number => Math.round(v / props.grid) * props.grid

const clampW = (w: number) => Math.min(props.maxWidth, Math.max(props.minWidth, w))
const clampH = (h: number) => Math.min(props.maxHeight, Math.max(props.minHeight, h))

const applyAspect = (w: number, h: number, fromWidth: boolean): { w: number; h: number } => {
  if (!props.aspectRatio) return { w, h }
  if (fromWidth) return { w, h: w / props.aspectRatio }
  return { w: h * props.aspectRatio, h }
}

const containerStyle = computed(() => ({
  width: `${currentWidth.value}px`,
  height: `${currentHeight.value}px`
}))

const validHandles = computed(() => props.handles.filter(h => ALL_HANDLES.includes(h)))

const onPointerDown = (handle: Handle, event: PointerEvent) => {
  if (props.disabled) return
  event.stopPropagation()
  activeHandle.value = handle
  startX.value = event.clientX
  startY.value = event.clientY
  startW.value = currentWidth.value
  startH.value = currentHeight.value
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  emit('resizestart', { width: currentWidth.value, height: currentHeight.value })
}

const onPointerMove = (event: PointerEvent) => {
  if (!activeHandle.value) return
  const dx = event.clientX - startX.value
  const dy = event.clientY - startY.value

  let nextW = startW.value
  let nextH = startH.value

  const handle = activeHandle.value
  if (handle.includes('e')) nextW = startW.value + dx
  if (handle.includes('w')) nextW = startW.value - dx
  if (handle.includes('s')) nextH = startH.value + dy
  if (handle.includes('n')) nextH = startH.value - dy

  const widthDriven = handle.includes('e') || handle.includes('w')
  const aspected = applyAspect(nextW, nextH, widthDriven)
  nextW = clampW(snap(aspected.w))
  nextH = clampH(snap(aspected.h))

  if (nextW !== currentWidth.value) {
    currentWidth.value = nextW
    emit('update:width', nextW)
  }
  if (nextH !== currentHeight.value) {
    currentHeight.value = nextH
    emit('update:height', nextH)
  }
  emit('resize', { width: currentWidth.value, height: currentHeight.value, handle })
}

const onPointerUp = (event: PointerEvent) => {
  if (!activeHandle.value) return
  ;(event.target as HTMLElement).releasePointerCapture?.(event.pointerId)
  activeHandle.value = null
  emit('resizeend', { width: currentWidth.value, height: currentHeight.value })
}
</script>

<template>
  <div
    class="vibe-resizable"
    :class="{ 'vibe-resizable-disabled': disabled, 'vibe-resizable-active': activeHandle !== null }"
    :style="containerStyle"
  >
    <slot />
    <span
      v-for="h in validHandles"
      :key="h"
      :class="['vibe-resizable-handle', `vibe-resizable-handle-${h}`]"
      :data-handle="h"
      @pointerdown="(e: PointerEvent) => onPointerDown(h, e)"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    />
  </div>
</template>

<style scoped>
.vibe-resizable {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
}

.vibe-resizable-handle {
  position: absolute;
  background-color: transparent;
  z-index: 10;
}

.vibe-resizable-active {
  user-select: none;
}

.vibe-resizable-disabled .vibe-resizable-handle {
  pointer-events: none;
}

.vibe-resizable-handle-n,
.vibe-resizable-handle-s {
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
}

.vibe-resizable-handle-n { top: -3px; }
.vibe-resizable-handle-s { bottom: -3px; }

.vibe-resizable-handle-e,
.vibe-resizable-handle-w {
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
}

.vibe-resizable-handle-e { right: -3px; }
.vibe-resizable-handle-w { left: -3px; }

.vibe-resizable-handle-ne,
.vibe-resizable-handle-nw,
.vibe-resizable-handle-se,
.vibe-resizable-handle-sw {
  width: 12px;
  height: 12px;
  z-index: 11;
}

.vibe-resizable-handle-ne { top: -6px; right: -6px; cursor: nesw-resize; }
.vibe-resizable-handle-nw { top: -6px; left: -6px; cursor: nwse-resize; }
.vibe-resizable-handle-se { bottom: -6px; right: -6px; cursor: nwse-resize; }
.vibe-resizable-handle-sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
</style>
