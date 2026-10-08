<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ProgressBar } from '../types'
import { safeLength } from '../utils/safeCss'

const props = defineProps({
  // #137: a number is treated as pixels (consistent with the chart components);
  // a string passes through. Both are validated by safeLength below.
  height: { type: [Number, String] as PropType<number | string>, default: undefined },
  bars: { type: Array as () => ProgressBar[], required: true }
})

// #147: type label slot.
defineSlots<{
  label?: (props: { bar: ProgressBar; index: number }) => unknown
}>()

const progressStyle = computed(() => {
  // Normalize a numeric height to px, then validate the freeform value before
  // binding to :style — blocks CSS injection.
  const raw = typeof props.height === 'number' ? `${props.height}px` : props.height
  const h = safeLength(raw)
  return h ? { height: h } : undefined
})

const getBarClass = (bar: ProgressBar) => {
  const classes = ['progress-bar']
  if (bar.variant) classes.push(`bg-${bar.variant}`)
  if (bar.striped || bar.animated) classes.push('progress-bar-striped')
  if (bar.animated) classes.push('progress-bar-animated')
  return classes.join(' ')
}

// Single normalization point for a consumer-supplied bar. Guards NaN/Infinity
// values and a degenerate (zero or negative) max, so width, the visible label,
// and the ARIA values can never disagree (see #194).
interface NormalizedBar {
  value: number
  max: number
  percentage: number
}

const normalizeBar = (bar: ProgressBar): NormalizedBar => {
  const max = bar.max !== undefined && bar.max > 0 ? bar.max : 100
  const finite = Number.isFinite(bar.value) ? bar.value : 0
  const value = Math.min(max, Math.max(0, finite))
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return { value, max, percentage }
}

const getBarStyle = (bar: ProgressBar) => {
  // An explicit non-positive max means "no measurable progress".
  if (bar.max !== undefined && bar.max <= 0) return { width: '0%' }
  return { width: `${normalizeBar(bar).percentage}%` }
}

const getBarLabel = (bar: ProgressBar) => {
  if (bar.label) return bar.label
  if (bar.showValue) {
    return `${Math.round(normalizeBar(bar).percentage)}%`
  }
  return ''
}
</script>

<template>
  <div class="progress" :style="progressStyle">
    <div
      v-for="(bar, index) in bars"
      :key="bar.label ?? `${bar.value}-${index}`"
      :class="getBarClass(bar)"
      :style="getBarStyle(bar)"
      role="progressbar"
      :aria-label="bar.label || 'Progress'"
      :aria-valuenow="normalizeBar(bar).value"
      :aria-valuemin="0"
      :aria-valuemax="normalizeBar(bar).max"
    >
      <!-- Scoped slot for custom label -->
      <slot name="label" :bar="bar" :index="index">
        {{ getBarLabel(bar) }}
      </slot>
    </div>
  </div>
</template>
