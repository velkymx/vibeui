<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Tag, Variant } from '../types'

const props = defineProps({
  tag: { type: String as PropType<Tag | 'a'>, default: 'a' },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  variant: { type: String as PropType<Variant>, default: undefined },
  underline: { type: [Boolean, String] as PropType<boolean | '0' | '1' | '2' | '3'>, default: true },
  underlineVariant: { type: String as PropType<Variant>, default: undefined },
  underlineOpacity: { type: [String, Number] as PropType<'0' | '10' | '25' | '50' | '75' | '100' | 0 | 10 | 25 | 50 | 75 | 100>, default: undefined },
  offset: { type: [String, Number] as PropType<'1' | '2' | '3' | 1 | 2 | 3>, default: undefined },
  opacity: { type: [String, Number] as PropType<'10' | '25' | '50' | '75' | '100' | 10 | 25 | 50 | 75 | 100>, default: undefined },
  focusRing: { type: Boolean, default: false }
})

const isRouterLink = computed(() => !!props.to)
const componentTag = computed(() => {
  if (isRouterLink.value) return 'router-link'
  return props.tag
})

const linkClass = computed(() => {
  const classes: string[] = []
  
  if (props.variant) {
    classes.push(`link-${props.variant}`)
  }

  // Underline handling
  if (props.underline === false || props.underline === '0') {
    classes.push('link-underline-0')
  } else if (typeof props.underline === 'string' && ['1', '2', '3'].includes(props.underline)) {
    classes.push('link-underline', `link-underline-opacity-${props.underline}`) // wait, BS use underline-opacity?
    // BS 5.3 underline utilities:
    // .link-underline
    // .link-underline-opacity-0, 10, 25, 50, 75, 100
  }

  if (props.underlineVariant) {
    classes.push(`link-underline-${props.underlineVariant}`)
  }

  if (props.underlineOpacity !== undefined) {
    classes.push(`link-underline-opacity-${props.underlineOpacity}`)
  }

  if (props.offset !== undefined) {
    classes.push(`link-offset-${props.offset}`)
  }

  if (props.opacity !== undefined) {
    classes.push(`link-opacity-${props.opacity}`)
  }

  if (props.focusRing) {
    classes.push('focus-ring')
  }

  return classes.join(' ')
})
</script>

<template>
  <component
    :is="componentTag"
    :class="linkClass"
    :href="href"
    :to="to"
  >
    <slot />
  </component>
</template>
