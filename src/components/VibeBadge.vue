<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Tag } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: 'primary' },
  pill: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'a', default: 'span' }
})

const emit = defineEmits(['component-error'])

const badgeClass = computed(() => {
  const classes = ['badge', `bg-${props.variant}`]
  if (props.pill) classes.push('rounded-pill')
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="badgeClass">
    <slot />
  </component>
</template>
