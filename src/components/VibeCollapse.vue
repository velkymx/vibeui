<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { Tag } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' },
  horizontal: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const isVisible = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal
})

const collapseClass = computed(() => {
  const classes = ['collapse']
  if (props.horizontal) classes.push('collapse-horizontal')
  if (isVisible.value) classes.push('show')
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :id="id" :class="collapseClass">
    <slot />
  </component>
</template>
