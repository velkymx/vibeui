<script setup lang="ts">
import type { Tag } from '../types'

const props = defineProps({
  target: { type: String, required: true },
  offset: { type: Number, default: 10 },
  method: { type: String, default: 'auto' },
  smoothScroll: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' }
})

const emit = defineEmits(['activate', 'component-error'])
</script>

<template>
  <component
    :is="tag"
    data-bs-spy="scroll"
    :data-bs-target="target"
    :data-bs-offset="offset"
    :data-bs-method="method"
    :data-bs-smooth-scroll="smoothScroll"
    tabindex="0"
  >
    <slot />
  </component>
</template>
