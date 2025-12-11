<script setup lang="ts">
import type { Placement } from '../types'

const props = defineProps({
  content: { type: String, required: true },
  placement: { type: String as () => Placement, default: 'top' },
  trigger: { type: String, default: 'hover focus' },
  html: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <span
    data-bs-toggle="tooltip"
    :data-bs-placement="placement"
    :data-bs-title="content"
    :data-bs-trigger="trigger"
    :data-bs-html="html"
  >
    <slot />
  </span>
</template>
