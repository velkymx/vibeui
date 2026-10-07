<script setup lang="ts">
import { computed } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Variant, Tag } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  subtle: { type: Boolean, default: false },
  pill: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'a', default: 'span' },
  // Bootstrap text-color name (e.g. 'dark', 'body', 'white') for an explicit
  // foreground override, applied as `text-{textColor}`.
  textColor: { type: String, default: undefined }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, 'primary'))


const badgeClass = computed(() => {
  const classes = ['badge']

  if (props.subtle) {
    classes.push(`bg-${resolvedVariant}-subtle`, `text-${resolvedVariant}-emphasis`)
  } else {
    // .text-bg-{variant} pairs the background with a contrast-correct foreground,
    // so light/warning/info stay readable — .badge alone defaults to color:#fff.
    classes.push(`text-bg-${resolvedVariant}`)
  }

  if (props.pill) classes.push('rounded-pill')
  // Bootstrap's text-color utilities carry !important, so this wins over the
  // foreground set by .text-bg-{variant} / .text-{variant}-emphasis.
  if (props.textColor) classes.push(`text-${props.textColor}`)
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="badgeClass">
    <slot />
  </component>
</template>
