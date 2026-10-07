<script setup lang="ts">
import { computed } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Variant, Size, SpinnerType } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  type: { type: String as () => SpinnerType, default: 'border' },
  size: { type: String as () => Size, default: undefined },
  label: { type: String, default: 'Loading...' },
  tag: { type: String, default: 'div' }
})
// #159: explicit prop wins, then the global default, then the builtin.
const resolvedSize = computed(() => resolveProp(props.size, vibeDefaults.size, undefined))

// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, undefined))


const spinnerClass = computed(() => {
  const classes = [`spinner-${props.type}`]
  if (resolvedVariant.value) classes.push(`text-${resolvedVariant.value}`)
  if (resolvedSize.value) classes.push(`spinner-${props.type}-${resolvedSize.value}`)
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="spinnerClass" role="status">
    <span class="visually-hidden">{{ label }}</span>
  </component>
</template>
