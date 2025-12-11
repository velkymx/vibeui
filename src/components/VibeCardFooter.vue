<script setup lang="ts">
import type { Tag } from '../types'

const props = defineProps({
  tag: { type: String as () => Tag, default: 'div' }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <component :is="tag" class="card-footer">
    <slot />
  </component>
</template>
