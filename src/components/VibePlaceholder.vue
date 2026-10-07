<script setup lang="ts">
import { computed } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Variant, Size, PlaceholderAnimation, Tag } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  size: { type: String as () => Size, default: undefined },
  animation: { type: String as () => PlaceholderAnimation, default: undefined },
  width: { type: [String, Number], default: undefined },
  tag: { type: String as () => Tag, default: 'span' }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, undefined))


const placeholderClass = computed(() => {
  const classes = ['placeholder']
  if (resolvedVariant) classes.push(`bg-${resolvedVariant}`)
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
