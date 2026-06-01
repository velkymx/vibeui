<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Size, SpinnerType } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  type: { type: String as () => SpinnerType, default: 'border' },
  size: { type: String as () => Size, default: undefined },
  label: { type: String, default: 'Loading...' },
  tag: { type: String, default: 'div' }
})

const emit = defineEmits(['component-error'])

const spinnerClass = computed(() => {
  const classes = [`spinner-${props.type}`]
  if (props.variant) classes.push(`text-${props.variant}`)
  if (props.size) classes.push(`spinner-${props.type}-${props.size}`)
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="spinnerClass" role="status">
    <span class="visually-hidden">{{ label }}</span>
  </component>
</template>
