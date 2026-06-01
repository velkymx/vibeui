<script setup lang="ts">
import { computed } from 'vue'
import type { Size } from '../types'

const props = defineProps({
  size: { type: String as () => Size, default: undefined },
  vertical: { type: Boolean, default: false },
  role: { type: String, default: 'group' },
  ariaLabel: { type: String, default: undefined }
})

const emit = defineEmits(['component-error'])

const groupClass = computed(() => {
  const classes = [props.vertical ? 'btn-group-vertical' : 'btn-group']
  if (props.size) classes.push(`btn-group-${props.size}`)
  return classes.join(' ')
})
</script>

<template>
  <div :class="groupClass" :role="role" :aria-label="ariaLabel">
    <slot />
  </div>
</template>
