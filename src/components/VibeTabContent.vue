<script setup lang="ts">
import { type PropType } from 'vue'
import type { Tag } from '../types'

const props = defineProps({
  id: { type: String, default: undefined },
  tag: { type: String as PropType<Tag>, default: 'div' }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <component :is="tag" :id="id" class="tab-content">
    <slot />
  </component>
</template>
