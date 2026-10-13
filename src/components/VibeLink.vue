<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Tag, Variant } from '../types'
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'

const props = defineProps({
  tag: { type: String as PropType<Tag | 'a'>, default: 'a' },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  target: { type: String, default: undefined },
  rel: { type: String, default: undefined },
  variant: { type: String as PropType<Variant>, default: undefined },
  underline: { type: [Boolean, String] as PropType<boolean | '0'>, default: true },
  underlineVariant: { type: String as PropType<Variant>, default: undefined },
  underlineOpacity: { type: [String, Number] as PropType<'0' | '10' | '25' | '50' | '75' | '100' | 0 | 10 | 25 | 50 | 75 | 100>, default: undefined },
  offset: { type: [String, Number] as PropType<'1' | '2' | '3' | 1 | 2 | 3>, default: undefined },
  opacity: { type: [String, Number] as PropType<'10' | '25' | '50' | '75' | '100' | 10 | 25 | 50 | 75 | 100>, default: undefined },
  focusRing: { type: Boolean, default: false }
})
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, undefined))


// An href that fails sanitizing is dropped entirely rather than rendered as a
// dead anchor, so the element falls through to `to` or to the plain tag.
const sanitizedHref = computed(() => safeHref(props.href))
const isRouterLink = computed(() => !sanitizedHref.value && !!props.to)
const componentTag = computed(() => {
  if (isRouterLink.value) return 'router-link'
  return sanitizedHref.value ? 'a' : props.tag
})

// target="_blank" without an explicit rel is a tabnabbing vector: default to
// noopener. Keys omitted when undefined so router-link fallthrough never sees
// undefined values (same discipline as linkBindings).
const rootAttrs = computed(() => {
  const out: Record<string, unknown> = {
    ...linkBindings(sanitizedHref.value, isRouterLink.value ? props.to : undefined)
  }
  if (props.target !== undefined) out.target = props.target
  const rel = props.rel ?? (props.target === '_blank' ? 'noopener' : undefined)
  if (rel !== undefined) out.rel = rel
  return out
})

const linkClass = computed(() => {
  const classes: string[] = []
  
  if (resolvedVariant.value) {
    classes.push(`link-${resolvedVariant.value}`)
  }

  if (props.underline === false || props.underline === '0') {
    classes.push('link-underline-opacity-0')
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
    v-bind="rootAttrs"
  >
    <slot />
  </component>
</template>
