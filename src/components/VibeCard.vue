<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Variant, Tag } from '../types'
import VibeCardHeader from './VibeCardHeader.vue'
import VibeCardBody from './VibeCardBody.vue'
import VibeCardFooter from './VibeCardFooter.vue'
import VibeCardImg from './VibeCardImg.vue'
import VibeCardTitle from './VibeCardTitle.vue'
import VibeCardText from './VibeCardText.vue'

const props = defineProps({
  variant: { type: String as () => Variant, default: undefined },
  border: { type: String as () => Variant, default: undefined },
  textVariant: { type: String as () => Variant, default: undefined },
  tag: { type: String as () => Tag, default: 'div' },
  // Shorthand props for quick card creation
  title: { type: String, default: undefined },
  body: { type: String, default: undefined },
  header: { type: String, default: undefined },
  footer: { type: String, default: undefined },
  headerImage: { type: String, default: undefined },
  headerImageAlt: { type: String, default: '' },
  footerImage: { type: String, default: undefined },
  footerImageAlt: { type: String, default: '' }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()

const cardClass = computed(() => {
  const classes = ['card']
  if (props.variant) classes.push(`bg-${props.variant}`)
  if (props.border) classes.push(`border-${props.border}`)
  if (props.textVariant) classes.push(`text-${props.textVariant}`)
  return classes.join(' ')
})

// Check if using shorthand mode (any shorthand props are provided)
const isShorthandMode = computed(() => {
  return !!(props.title || props.body || props.header || props.footer || props.headerImage || props.footerImage)
})

// Check if using slot mode (any slots are provided)
const isSlotMode = computed(() => {
  return !!(slots.default || slots.header || slots.footer || slots.body)
})
</script>

<template>
  <component :is="tag" :class="cardClass">
    <!-- Shorthand mode: auto-generate card structure from props -->
    <template v-if="isShorthandMode && !isSlotMode">
      <VibeCardImg v-if="headerImage" top :src="headerImage" :alt="headerImageAlt" />
      <VibeCardHeader v-if="header">{{ header }}</VibeCardHeader>
      <VibeCardBody v-if="title || body">
        <VibeCardTitle v-if="title">{{ title }}</VibeCardTitle>
        <VibeCardText v-if="body">{{ body }}</VibeCardText>
      </VibeCardBody>
      <VibeCardFooter v-if="footer">{{ footer }}</VibeCardFooter>
      <VibeCardImg v-if="footerImage" bottom :src="footerImage" :alt="footerImageAlt" />
    </template>

    <!-- Slot mode: full composable control -->
    <template v-else>
      <slot />
    </template>
  </component>
</template>
