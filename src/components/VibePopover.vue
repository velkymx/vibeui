<script setup lang="ts">
import type { Placement } from '../types'

const props = defineProps({
  title: { type: String, default: undefined },
  content: { type: String, required: true },
  placement: { type: String as () => Placement, default: 'top' },
  trigger: { type: String, default: 'click' },
  html: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <span
    data-bs-toggle="popover"
    :data-bs-placement="placement"
    :data-bs-title="title"
    :data-bs-content="content"
    :data-bs-trigger="trigger"
    :data-bs-html="html"
  >
    <slot />
  </span>
</template>
