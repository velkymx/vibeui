<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { Variant, Tag } from '../types'

// Vue's class-binding value form (string, array, or object map).
type ClassValue = string | unknown[] | Record<string, unknown>

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  border: { type: String as () => Variant, default: undefined },
  textVariant: { type: String as () => Variant, default: undefined },
  tag: { type: String as () => Tag, default: 'div' },
  // Content props
  title: { type: String, default: undefined },
  body: { type: String, default: undefined },
  header: { type: String, default: undefined },
  footer: { type: String, default: undefined },
  // Per-section class hooks — let consumers style the header/body/footer wrappers
  // (e.g. a variant-colored header) without dropping to a raw .card.
  headerClass: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
  bodyClass: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
  footerClass: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
  // Image props
  imgSrc: { type: String, default: undefined },
  imgAlt: { type: String, default: '' },
  imgTop: { type: Boolean, default: false },
  imgBottom: { type: Boolean, default: false }
})

const cardClass = computed(() => {
  const classes = ['card']
  if (props.variant) classes.push(`text-bg-${props.variant}`)
  if (props.border) classes.push(`border-${props.border}`)
  if (props.textVariant) classes.push(`text-${props.textVariant}`)
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :class="cardClass">
    <!-- Top image -->
    <img
      v-if="imgSrc && imgTop"
      :src="imgSrc"
      :alt="imgAlt"
      class="card-img-top"
    >

    <!-- Image slot: a direct card child (outside .card-body) for a card image with
         custom composition — e.g. a card-img-top with an absolutely-positioned overlay. -->
    <slot name="image" />

    <!-- Header -->
    <div v-if="header || $slots.header" :class="['card-header', headerClass]">
      <slot name="header">{{ header }}</slot>
    </div>

    <!-- Body -->
    <div v-if="title || body || $slots.title || $slots.body || !!$slots.default" :class="['card-body', bodyClass]">
      <h5 v-if="title || $slots.title" class="card-title">
        <slot name="title">{{ title }}</slot>
      </h5>
      <p v-if="body || $slots.body" class="card-text">
        <slot name="body">{{ body }}</slot>
      </p>
      <!-- Default slot for additional body content -->
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="footer || $slots.footer" :class="['card-footer', footerClass]">
      <slot name="footer">{{ footer }}</slot>
    </div>

    <!-- Bottom image -->
    <img
      v-if="imgSrc && imgBottom"
      :src="imgSrc"
      :alt="imgAlt"
      class="card-img-bottom"
    >
  </component>
</template>
