<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Size, Tag } from '../types'

const props = defineProps({
  size: { type: String as PropType<Size>, default: undefined },
  prepend: { type: String, default: undefined },
  append: { type: String, default: undefined },
  tag: { type: String as PropType<Tag>, default: 'div' }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedSize = computed(() => resolveProp(props.size, vibeDefaults.size, undefined))


const containerClass = computed(() => {
  const classes = ['input-group']
  if (resolvedSize.value) classes.push(`input-group-${resolvedSize.value}`)
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="containerClass">
    <!-- Prepend slot or prop -->
    <slot name="prepend">
      <span v-if="prepend" class="input-group-text">{{ prepend }}</span>
    </slot>

    <!-- Main content (usually VibeFormInput with noWrapper) -->
    <slot />

    <!-- Append slot or prop -->
    <slot name="append">
      <span v-if="append" class="input-group-text">{{ append }}</span>
    </slot>
  </component>
</template>
