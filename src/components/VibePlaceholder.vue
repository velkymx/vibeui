<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Size, PlaceholderAnimation, Tag } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  size: { type: String as () => Size, default: undefined },
  animation: { type: String as () => PlaceholderAnimation, default: undefined },
  width: { type: [String, Number], default: undefined },
  tag: { type: String as () => Tag, default: 'span' }
})

const emit = defineEmits(['component-error'])

const placeholderClass = computed(() => {
  const classes = ['placeholder']
  if (props.variant) classes.push(`bg-${props.variant}`)
  if (props.size) classes.push(`placeholder-${props.size}`)
  return classes.join(' ')
})

const containerClass = computed(() => {
  if (props.animation) return `placeholder-${props.animation}`
  return undefined
})

const widthStyle = computed(() => {
  if (props.width) {
    const value = typeof props.width === 'number' ? `${props.width}%` : props.width
    return { width: value }
  }
  return undefined
})
</script>

<template>
  <component :is="tag" :class="containerClass">
    <span :class="placeholderClass" :style="widthStyle">
      <slot />
    </span>
  </component>
</template>
