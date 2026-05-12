<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from 'vue'

type SliderValue = number | [number, number]

const props = defineProps({
  modelValue: { type: [Number, Array] as PropType<SliderValue>, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  range: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SliderValue): void
  (e: 'change', value: SliderValue): void
}>()

const trackRef = ref<HTMLElement | null>(null)
const activeHandle = ref<0 | 1 | null>(null)

onMounted(() => {
  const expectArray = props.range
  const isArray = Array.isArray(props.modelValue)
  if (expectArray && !isArray) {
    console.warn(
      '[VibeSlider] range=true expects modelValue as [low, high] tuple; received non-array. Slider will be inert.'
    )
  } else if (!expectArray && isArray) {
    console.warn(
      '[VibeSlider] range=false expects modelValue as a number; received array. Use range=true for tuple model.'
    )
  }
  if (props.max <= props.min) {
    console.warn(
      `[VibeSlider] max (${props.max}) must be greater than min (${props.min}). Slider is rendered but inert.`
    )
  }
})

const range01 = computed(() => Math.max(0, props.max - props.min))

const clamp = (v: number) => Math.min(props.max, Math.max(props.min, v))
const stepSnap = (v: number) => {
  if (range01.value === 0 || props.step <= 0) return clamp(v)
  const stepped = Math.round((v - props.min) / props.step) * props.step + props.min
  return clamp(stepped)
}

const lowValue = computed(() => {
  if (Array.isArray(props.modelValue)) return clamp(props.modelValue[0])
  return clamp(props.modelValue)
})

const highValue = computed(() => {
  if (Array.isArray(props.modelValue)) return clamp(props.modelValue[1])
  return clamp(props.modelValue)
})

const safePercent = (value: number): number => {
  if (range01.value === 0) return 0
  return ((value - props.min) / range01.value) * 100
}

const lowPercent = computed(() => safePercent(lowValue.value))
const highPercent = computed(() => safePercent(highValue.value))

const sliderClass = computed(() => {
  const c = ['vibe-slider']
  if (props.vertical) c.push('vibe-slider-vertical')
  if (props.disabled) c.push('vibe-slider-disabled')
  if (props.range) c.push('vibe-slider-range')
  return c.join(' ')
})

const fillStyle = computed(() => {
  if (props.range) {
    return props.vertical
      ? { bottom: `${lowPercent.value}%`, top: `${100 - highPercent.value}%` }
      : { left: `${lowPercent.value}%`, right: `${100 - highPercent.value}%` }
  }
  return props.vertical
    ? { bottom: '0%', top: `${100 - lowPercent.value}%` }
    : { left: '0%', right: `${100 - lowPercent.value}%` }
})

const lowHandleStyle = computed(() => (props.vertical
  ? { bottom: `${lowPercent.value}%` }
  : { left: `${lowPercent.value}%` }))

const highHandleStyle = computed(() => (props.vertical
  ? { bottom: `${highPercent.value}%` }
  : { left: `${highPercent.value}%` }))

const emitValue = (handleIdx: 0 | 1, next: number) => {
  if (props.range && Array.isArray(props.modelValue)) {
    const [lo, hi] = props.modelValue
    const snapped = stepSnap(next)
    let newLo: number
    let newHi: number
    let newActive: 0 | 1 = handleIdx
    if (handleIdx === 0) {
      // If user pushes low past high, swap roles so the gesture continues smoothly.
      if (snapped > hi) {
        newLo = hi
        newHi = snapped
        newActive = 1
      } else {
        newLo = snapped
        newHi = hi
      }
    } else {
      if (snapped < lo) {
        newLo = snapped
        newHi = lo
        newActive = 0
      } else {
        newLo = lo
        newHi = snapped
      }
    }
    if (newLo === lo && newHi === hi) return
    if (newActive !== handleIdx && activeHandle.value !== null) {
      activeHandle.value = newActive
    }
    const out: [number, number] = [newLo, newHi]
    emit('update:modelValue', out)
    emit('change', out)
    return
  }
  const snapped = stepSnap(next)
  if (snapped === lowValue.value) return
  emit('update:modelValue', snapped)
  emit('change', snapped)
}

const trackClickToValue = (event: PointerEvent): number => {
  if (!trackRef.value) return props.min
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = props.vertical
    ? 1 - (event.clientY - rect.top) / rect.height
    : (event.clientX - rect.left) / rect.width
  return props.min + ratio * (props.max - props.min)
}

const onTrackPointerDown = (event: PointerEvent) => {
  if (props.disabled) return
  // Skip if the click landed on a handle (handle has its own pointerdown).
  const target = event.target as HTMLElement
  if (target.classList.contains('vibe-slider-handle')) return
  const value = trackClickToValue(event)
  const targetHandle: 0 | 1 = props.range
    ? (Math.abs(value - lowValue.value) <= Math.abs(value - highValue.value) ? 0 : 1)
    : 0
  emitValue(targetHandle, value)
}

const handleKeydown = (handleIdx: 0 | 1, event: KeyboardEvent) => {
  if (props.disabled) return
  const current = handleIdx === 0 ? lowValue.value : highValue.value
  let next = current
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = current + props.step
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = current - props.step
      break
    case 'Home':
      next = props.min
      break
    case 'End':
      next = props.max
      break
    case 'PageUp':
      next = current + props.step * 10
      break
    case 'PageDown':
      next = current - props.step * 10
      break
    default:
      return
  }
  event.preventDefault()
  emitValue(handleIdx, next)
}

const handlePointerDown = (handleIdx: 0 | 1, event: PointerEvent) => {
  if (props.disabled || !trackRef.value) return
  activeHandle.value = handleIdx
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
}

const handlePointerMove = (event: PointerEvent) => {
  if (activeHandle.value === null || !trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = props.vertical
    ? 1 - (event.clientY - rect.top) / rect.height
    : (event.clientX - rect.left) / rect.width
  const raw = props.min + ratio * (props.max - props.min)
  emitValue(activeHandle.value, raw)
}

const handlePointerUp = (event: PointerEvent) => {
  if (activeHandle.value === null) return
  ;(event.target as HTMLElement).releasePointerCapture?.(event.pointerId)
  activeHandle.value = null
}
</script>

<template>
  <div :class="sliderClass">
    <div
      class="vibe-slider-track"
      ref="trackRef"
      @pointerdown="onTrackPointerDown"
    >
      <div class="vibe-slider-fill" :style="fillStyle" />
      <div
        class="vibe-slider-handle"
        role="slider"
        tabindex="0"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="lowValue"
        :aria-disabled="disabled || undefined"
        :style="lowHandleStyle"
        @keydown="(e: KeyboardEvent) => handleKeydown(0, e)"
        @pointerdown="(e: PointerEvent) => handlePointerDown(0, e)"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
      />
      <div
        v-if="range"
        class="vibe-slider-handle"
        role="slider"
        tabindex="0"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="highValue"
        :aria-disabled="disabled || undefined"
        :style="highHandleStyle"
        @keydown="(e: KeyboardEvent) => handleKeydown(1, e)"
        @pointerdown="(e: PointerEvent) => handlePointerDown(1, e)"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
      />
    </div>
  </div>
</template>

<style scoped>
.vibe-slider {
  --vibe-slider-track-height: 6px;
  --vibe-slider-handle-size: 18px;
  position: relative;
  width: 100%;
  padding: calc(var(--vibe-slider-handle-size) / 2) 0;
  user-select: none;
}

.vibe-slider-vertical {
  width: var(--vibe-slider-handle-size);
  height: 200px;
  padding: 0 calc(var(--vibe-slider-handle-size) / 2);
}

.vibe-slider-track {
  position: relative;
  width: 100%;
  height: var(--vibe-slider-track-height);
  background-color: var(--bs-secondary-bg, #e9ecef);
  border-radius: calc(var(--vibe-slider-track-height) / 2);
}

.vibe-slider-vertical .vibe-slider-track {
  width: var(--vibe-slider-track-height);
  height: 100%;
}

.vibe-slider-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bs-primary, #0d6efd);
  border-radius: inherit;
}

.vibe-slider-handle {
  position: absolute;
  width: var(--vibe-slider-handle-size);
  height: var(--vibe-slider-handle-size);
  background-color: white;
  border: 2px solid var(--bs-primary, #0d6efd);
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  touch-action: none;
}

.vibe-slider-vertical .vibe-slider-handle {
  top: auto;
  left: 50%;
  transform: translate(-50%, 50%);
}

.vibe-slider-handle:focus-visible {
  outline: 2px solid var(--bs-primary, #0d6efd);
  outline-offset: 2px;
}

.vibe-slider-handle:active {
  cursor: grabbing;
}

.vibe-slider-disabled {
  opacity: 0.55;
  pointer-events: none;
}
</style>
