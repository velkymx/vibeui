<script setup lang="ts">
import { useSlots } from 'vue'
import type { CarouselItem } from '../types'
import VibeCarouselSlide from './VibeCarouselSlide.vue'

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
  items: { type: Array as () => CarouselItem[], default: undefined }
})

const emit = defineEmits(['slide', 'slid', 'component-error'])

const slots = useSlots()
</script>

<template>
  <div
    :id="id"
    :class="['carousel', 'slide', { 'carousel-dark': dark, 'carousel-fade': fade }]"
    :data-bs-ride="ride === true ? 'carousel' : ride"
    :data-bs-interval="interval"
    :data-bs-keyboard="keyboard"
    :data-bs-pause="pause"
    :data-bs-wrap="wrap"
    :data-bs-touch="touch"
  >
    <!-- Shorthand mode: generate from items array -->
    <template v-if="items && items.length > 0 && !slots.default">
      <div v-if="indicators" class="carousel-indicators">
        <button
          v-for="(item, index) in items"
          :key="`indicator-${index}`"
          type="button"
          :data-bs-target="`#${id}`"
          :data-bs-slide-to="index"
          :class="{ active: item.active || index === 0 }"
          :aria-current="item.active || index === 0"
          :aria-label="`Slide ${index + 1}`"
        ></button>
      </div>
      <div class="carousel-inner">
        <VibeCarouselSlide
          v-for="(item, index) in items"
          :key="index"
          :active="item.active || index === 0"
          :interval="item.interval"
          :img-src="item.src"
          :img-alt="item.alt"
          :caption="item.caption"
          :caption-text="item.captionText"
        />
      </div>
    </template>

    <!-- Slot mode: full control -->
    <template v-else>
      <div v-if="indicators" class="carousel-indicators">
        <slot name="indicators" />
      </div>
      <div class="carousel-inner">
        <slot />
      </div>
    </template>

    <button
      v-if="controls"
      class="carousel-control-prev"
      type="button"
      :data-bs-target="`#${id}`"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button
      v-if="controls"
      class="carousel-control-next"
      type="button"
      :data-bs-target="`#${id}`"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>
