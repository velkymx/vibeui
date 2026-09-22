<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Tag } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: 'primary' },
  subtle: { type: Boolean, default: false },
  pill: { type: Boolean, default: false },
  tag: { type: String as () => Tag | 'a', default: 'span' },
  // Bootstrap text-color name (e.g. 'dark', 'body', 'white') for an explicit
  // foreground override, applied as `text-{textColor}`.
  textColor: { type: String, default: undefined }
})

const badgeClass = computed(() => {
  const classes = ['badge']

  if (props.subtle) {
    classes.push(`bg-${props.variant}-subtle`, `text-${props.variant}-emphasis`)
  } else {
    // .text-bg-{variant} pairs the background with a contrast-correct foreground,
    // so light/warning/info stay readable — .badge alone defaults to color:#fff.
    classes.push(`text-bg-${props.variant}`)
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
