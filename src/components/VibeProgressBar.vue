<script setup lang="ts">
import { computed } from 'vue'
import type { Variant } from '../types'

const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  variant: { type: String as () => Variant, default: undefined },
  striped: { type: Boolean, default: false },
  animated: { type: Boolean, default: false },
  label: { type: String, default: undefined },
  showValue: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])

const progressBarClass = computed(() => {
  const classes = ['progress-bar']
  if (props.variant) classes.push(`bg-${props.variant}`)
  if (props.striped || props.animated) classes.push('progress-bar-striped')
  if (props.animated) classes.push('progress-bar-animated')
  return classes.join(' ')
})

const progressBarStyle = computed(() => {
  const percentage = Math.min(100, Math.max(0, (props.value / props.max) * 100))
  return { width: `${percentage}%` }
})

const displayLabel = computed(() => {
  if (props.label) return props.label
  if (props.showValue) return `${props.value}%`
  return ''
})
</script>

<template>
  <div
    :class="progressBarClass"
    :style="progressBarStyle"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
  >
    {{ displayLabel }}
    <slot />
  </div>
</template>
