<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Tag, ContainerType } from '../types'
import { safeHref } from '../utils/safeHref'
import { safeLength, safeColor } from '../utils/safeCss'

const props = defineProps({
  // Background / text color — same vocabulary as VibeCard.
  variant: { type: String as () => Variant, default: undefined },
  textVariant: { type: String as () => Variant, default: undefined },
  // Border color (adds border + rounded-3) — same `border` prop as VibeCard.
  border: { type: String as () => Variant, default: undefined },
  // Content alignment.
  align: { type: String as () => 'start' | 'center' | 'end', default: 'center' },
  // Inner container — same fluid vocabulary as VibeContainer.
  fluid: { type: [Boolean, String] as () => boolean | ContainerType, default: false },
  // Freeform sizes/URLs are sanitized, consistent with the rest of the library.
  minHeight: { type: String, default: undefined },
  bgImage: { type: String, default: undefined },
  overlay: { type: [Boolean, String], default: false },
  gradient: { type: String, default: undefined },
  tag: { type: String as () => Tag, default: 'section' }
})

// Allow only *-gradient(...) values, and never url()/expression()/javascript:.
const GRADIENT_RE = /^(?:repeating-)?(?:linear|radial|conic)-gradient\([^;{}]*\)$/i
const safeGradient = (v: string | undefined): string | undefined => {
  if (!v) return undefined
  const t = v.trim()
  if (/url\(|expression\(|javascript:/i.test(t)) return undefined
  return GRADIENT_RE.test(t) ? t : undefined
}

const heroClass = computed(() => {
  const c: string[] = ['py-5', `text-${props.align}`]
  if (props.variant) c.push(`bg-${props.variant}`)
  if (props.textVariant) c.push(`text-${props.textVariant}`)
  if (props.border) c.push('border', `border-${props.border}`, 'rounded-3')
  // Vertically center content when an explicit min-height is given.
  if (safeLength(props.minHeight)) c.push('d-flex', 'align-items-center')
  return c
})

const containerClass = computed(() => {
  if (props.fluid === true) return 'container-fluid'
  if (typeof props.fluid === 'string') return `container-${props.fluid}`
  return 'container'
})

const heroStyle = computed(() => {
  const style: Record<string, string> = {}
  const img = safeHref(props.bgImage)
  const grad = safeGradient(props.gradient)

  const layers: string[] = []
  if (grad) {
    layers.push(grad)
  } else if (img && props.overlay) {
    const o = typeof props.overlay === 'string'
      ? (safeColor(props.overlay) ?? 'rgba(0, 0, 0, 0.5)')
      : 'rgba(0, 0, 0, 0.5)'
    layers.push(`linear-gradient(${o}, ${o})`)
  }
  if (img) layers.push(`url("${img}")`)

  if (layers.length) {
    style.backgroundImage = layers.join(', ')
    if (img) {
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
    }
  }

  const mh = safeLength(props.minHeight)
  if (mh) style.minHeight = mh

  return style
})

const hasStyle = computed(() => Object.keys(heroStyle.value).length > 0)
</script>

<template>
  <component :is="tag" :class="heroClass" :style="hasStyle ? heroStyle : undefined">
    <div :class="containerClass">
      <slot />
    </div>
  </component>
</template>
