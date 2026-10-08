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
// Declared before every resolver that closes over it: a computed getter is
// lazy, so the old order happened to work, but it breaks the moment any
// resolver is evaluated eagerly (see #199).
const vibeDefaults = useVibeDefaults()

const resolvedSize = computed(() => resolveProp(props.size, vibeDefaults.size, undefined))

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
