<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Tag } from '../types'

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
  // Image props
  imgSrc: { type: String, default: undefined },
  imgAlt: { type: String, default: '' },
  imgTop: { type: Boolean, default: true },
  imgBottom: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])

const cardClass = computed(() => {
  const classes = ['card']
  if (props.variant) classes.push(`bg-${props.variant}`)
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

    <!-- Header -->
    <div v-if="header || $slots.header" class="card-header">
      <slot name="header">{{ header }}</slot>
    </div>

    <!-- Body -->
    <div v-if="title || body || $slots.default" class="card-body">
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
    <div v-if="footer || $slots.footer" class="card-footer">
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
