<script setup lang="ts">
import { computed } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Size } from '../types'

const props = defineProps({
  size: { type: String as () => Size, default: undefined },
  vertical: { type: Boolean, default: false },
  role: { type: String, default: 'group' },
  ariaLabel: { type: String, default: undefined }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedSize = computed(() => resolveProp(props.size, vibeDefaults.size, undefined))


const groupClass = computed(() => {
  const classes = [props.vertical ? 'btn-group-vertical' : 'btn-group']
  if (resolvedSize.value) classes.push(`btn-group-${resolvedSize.value}`)
  return classes.join(' ')
})
</script>

<template>
  <div :class="groupClass" :role="role" :aria-label="ariaLabel">
    <slot />
  </div>
</template>
