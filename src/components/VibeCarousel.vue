<script setup lang="ts">
import { computed } from 'vue'
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
        :key="`indicator-${index}`"
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
        :key="index"
        :class="['carousel-item', { active: item.active || index === 0 }]"
        :data-bs-interval="item.interval"
      >
        <img :src="item.src" :alt="item.alt || ''" class="d-block w-100">
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
