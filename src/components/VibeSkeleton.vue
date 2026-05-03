<script setup lang="ts">
import { computed, type PropType } from 'vue'

type SkeletonVariant = 'text' | 'rect' | 'circle' | 'card'
type Dim = string | number

const props = defineProps({
  variant: { type: String as PropType<SkeletonVariant>, default: 'text' },
  width: { type: [String, Number] as PropType<Dim>, default: undefined },
  height: { type: [String, Number] as PropType<Dim>, default: undefined },
  lines: { type: Number, default: 1 },
  animated: { type: Boolean, default: true }
})

const toCss = (v: Dim | undefined): string | undefined => {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

const baseClasses = computed(() => {
  const c = ['vibe-skeleton']
  if (props.animated) c.push('vibe-skeleton-animated')
  return c
})

const lineCount = computed(() => Math.max(1, props.lines))

// Circle width: explicit width wins, otherwise CSS default (.vibe-skeleton-circle).
const circleWidth = computed(() => (props.variant === 'circle' ? toCss(props.width) : undefined))
// Circle height: explicit height wins, otherwise mirror the width to keep 1:1.
const circleHeight = computed(() => {
  if (props.variant !== 'circle') return undefined
  const h = toCss(props.height)
  if (h !== undefined) return h
  return toCss(props.width)
})

const sharedAttrs = {
  'aria-busy': true,
  role: 'status'
} as const
</script>

<template>
  <template v-if="variant === 'text'">
    <div
      v-for="i in lineCount"
      :key="i"
      :class="[
        'vibe-skeleton',
        'vibe-skeleton-text',
        animated ? 'vibe-skeleton-animated' : '',
        i === lineCount && lineCount > 1 ? 'vibe-skeleton-text-last' : ''
      ]"
      :style="{
        width: i === lineCount && lineCount > 1 ? '60%' : toCss(width),
        height: toCss(height)
      }"
      role="status"
      aria-busy="true"
    />
  </template>

  <div
    v-else-if="variant === 'rect'"
    :class="[...baseClasses, 'vibe-skeleton-rect']"
    :style="{ width: toCss(width), height: toCss(height) }"
    v-bind="sharedAttrs"
  />

  <div
    v-else-if="variant === 'circle'"
    :class="[...baseClasses, 'vibe-skeleton-circle']"
    :style="{ width: circleWidth, height: circleHeight }"
    v-bind="sharedAttrs"
  />

  <div
    v-else-if="variant === 'card'"
    class="vibe-skeleton-card"
    v-bind="sharedAttrs"
  >
    <div
      :class="['vibe-skeleton', 'vibe-skeleton-rect', animated ? 'vibe-skeleton-animated' : '']"
      :style="{ width: '100%', height: toCss(height) || '160px' }"
    />
    <div
      :class="['vibe-skeleton', 'vibe-skeleton-text', animated ? 'vibe-skeleton-animated' : '']"
      style="width: 80%"
    />
    <div
      :class="['vibe-skeleton', 'vibe-skeleton-text', 'vibe-skeleton-text-last', animated ? 'vibe-skeleton-animated' : '']"
      style="width: 50%"
    />
  </div>
</template>

<style scoped>
.vibe-skeleton {
  display: block;
  background-color: var(--bs-secondary-bg, #e9ecef);
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
}

.vibe-skeleton-text {
  height: 0.875rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.vibe-skeleton-text:last-child {
  margin-bottom: 0;
}

.vibe-skeleton-rect {
  width: 100%;
  height: 1rem;
}

.vibe-skeleton-circle {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
}

.vibe-skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vibe-skeleton-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.45) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: vibe-skeleton-shimmer 1.4s infinite;
}

@keyframes vibe-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-color-scheme: dark) {
  .vibe-skeleton {
    background-color: var(--bs-secondary-bg, #2b3035);
  }
  .vibe-skeleton-animated::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 100%
    );
  }
}

@media (prefers-reduced-motion: reduce) {
  .vibe-skeleton-animated::after {
    animation: none;
  }
}
</style>
