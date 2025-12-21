<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Tag, ContainerType } from '../types'

const props = defineProps({
  fluid: { type: [Boolean, String] as PropType<boolean | ContainerType>, default: false },
  tag: { type: String as PropType<Tag>, default: 'div' }
})

const emit = defineEmits(['component-error'])

const containerClass = computed(() => {
  if (props.fluid === false) {
    return 'container'
  } else if (props.fluid === true) {
    return 'container-fluid'
  } else {
    return `container-${props.fluid}`
  }
})
</script>

<template>
  <component :is="tag" :class="containerClass">
    <slot />
  </component>
</template>
