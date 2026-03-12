<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Size, Tag } from '../types'

const props = defineProps({
  size: { type: String as PropType<Size>, default: undefined },
  prepend: { type: String, default: undefined },
  append: { type: String, default: undefined },
  tag: { type: String as PropType<Tag>, default: 'div' }
})

const containerClass = computed(() => {
  const classes = ['input-group']
  if (props.size) classes.push(`input-group-${props.size}`)
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
