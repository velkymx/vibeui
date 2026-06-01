<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressBar } from '../types'

const props = defineProps({
  height: { type: String, default: undefined },
  bars: { type: Array as () => ProgressBar[], required: true }
})

const emit = defineEmits(['component-error'])

const progressStyle = computed(() => {
  if (props.height) {
    return { height: props.height }
  }
  return undefined
})

const getBarClass = (bar: ProgressBar) => {
  const classes = ['progress-bar']
  if (bar.variant) classes.push(`bg-${bar.variant}`)
  if (bar.striped || bar.animated) classes.push('progress-bar-striped')
  if (bar.animated) classes.push('progress-bar-animated')
  return classes.join(' ')
}

const getBarStyle = (bar: ProgressBar) => {
  const max = bar.max || 100
  const percentage = Math.min(100, Math.max(0, (bar.value / max) * 100))
  return { width: `${percentage}%` }
}

const getBarLabel = (bar: ProgressBar) => {
  if (bar.label) return bar.label
  if (bar.showValue) return `${bar.value}%`
  return ''
}
</script>

<template>
  <div class="progress" :style="progressStyle">
    <div
      v-for="(bar, index) in bars"
      :key="index"
      :class="getBarClass(bar)"
      :style="getBarStyle(bar)"
      role="progressbar"
      :aria-valuenow="bar.value"
      :aria-valuemin="0"
      :aria-valuemax="bar.max || 100"
    >
      <!-- Scoped slot for custom label -->
      <slot name="label" :bar="bar" :index="index">
        {{ getBarLabel(bar) }}
      </slot>
    </div>
  </div>
</template>
