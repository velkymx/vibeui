<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { CarouselItem } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  controls: { type: Boolean, default: true },
  indicators: { type: Boolean, default: true },
  ride: { type: [Boolean, String], default: false },
  interval: { type: [Number, Boolean], default: 5000 },
  keyboard: { type: Boolean, default: true },
  pause: { type: [String, Boolean], default: 'hover' },
  wrap: { type: Boolean, default: true },
  touch: { type: Boolean, default: true },
  dark: { type: Boolean, default: false },
  fade: { type: Boolean, default: false },
  items: { type: Array as () => CarouselItem[], required: true }
})

const emit = defineEmits(['slide', 'slid', 'component-error'])

const carouselClass = computed(() => {
  const classes = ['carousel', 'slide']
  if (props.dark) classes.push('carousel-dark')
  if (props.fade) classes.push('carousel-fade')
  return classes.join(' ')
})

/**
 * Get accessible alt text for carousel images.
 * Falls back to caption text if no alt is provided.
 * Warns in development if neither is available.
 */
const getImageAlt = (item: CarouselItem, index: number): string => {
  // Use explicit alt if provided
  if (item.alt) return item.alt

  // Fall back to caption as alt text
  if (item.caption) return item.caption

  // Use caption text if available
  if (item.captionText) return item.captionText

  // Provide a generic description
  return `Carousel slide ${index + 1}`
}

// Warn about missing alt text in development
onMounted(() => {
  if (import.meta.env.DEV) {
    props.items.forEach((item, index) => {
      if (!item.alt && !item.caption && !item.captionText) {
        console.warn(
          `[VibeCarousel] Accessibility warning: Slide ${index + 1} has no alt text, caption, or captionText. ` +
          `Consider adding an 'alt' property for better screen reader support.`
        )
      }
    })
  }
})
</script>

<template>
  <div
    :id="id"
    :class="carouselClass"
    :data-bs-ride="ride === true ? 'carousel' : ride"
    :data-bs-interval="interval"
    :data-bs-keyboard="keyboard"
    :data-bs-pause="pause"
    :data-bs-wrap="wrap"
    :data-bs-touch="touch"
  >
    <!-- Indicators -->
    <div v-if="indicators" class="carousel-indicators">
      <button
        v-for="(item, index) in items"
        :key="`indicator-${item.src}-${index}`"
        type="button"
        :data-bs-target="`#${id}`"
        :data-bs-slide-to="index"
        :class="{ active: item.active || index === 0 }"
        :aria-current="item.active || index === 0"
        :aria-label="`Slide ${index + 1}`"
      />
    </div>

    <!-- Slides -->
    <div class="carousel-inner">
      <div
        v-for="(item, index) in items"
        :key="`slide-${item.src}-${index}`"
        :class="['carousel-item', { active: item.active || index === 0 }]"
        :data-bs-interval="item.interval"
      >
        <img :src="item.src" :alt="getImageAlt(item, index)" class="d-block w-100">
        <div v-if="item.caption || item.captionText || $slots.caption" class="carousel-caption d-none d-md-block">
          <!-- Scoped slot for custom caption -->
          <slot name="caption" :item="item" :index="index">
            <h5 v-if="item.caption">{{ item.caption }}</h5>
            <p v-if="item.captionText">{{ item.captionText }}</p>
          </slot>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <button
      v-if="controls"
      class="carousel-control-prev"
      type="button"
      :data-bs-target="`#${id}`"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true" />
      <span class="visually-hidden">Previous</span>
    </button>
    <button
      v-if="controls"
      class="carousel-control-next"
      type="button"
      :data-bs-target="`#${id}`"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true" />
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>
