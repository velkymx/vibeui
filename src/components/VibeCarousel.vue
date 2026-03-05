<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { CarouselItem } from '../types'
import { useId } from '../composables/useId'

interface BootstrapCarousel {
  to: (index: number) => void
  next: () => void
  prev: () => void
  pause: () => void
  cycle: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('carousel') },
  modelValue: { type: Number, default: 0 },
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

const emit = defineEmits(['update:modelValue', 'slide', 'slid', 'component-error'])

const carouselRef = ref<HTMLElement | null>(null)
const bsCarousel = ref<BootstrapCarousel | null>(null)
const activeIndex = ref(props.modelValue)

const carouselClass = computed(() => {
  const classes = ['carousel', 'slide']
  if (props.dark) classes.push('carousel-dark')
  if (props.fade) classes.push('carousel-fade')
  return classes.join(' ')
})

const onSlide = (event: any) => {
  emit('slide', event)
}

const onSlid = (event: any) => {
  activeIndex.value = event.to
  emit('update:modelValue', event.to)
  emit('slid', event)
}

const initCarousel = async () => {
  if (!carouselRef.value) return

  // Dispose existing instance before re-initializing
  if (bsCarousel.value) {
    bsCarousel.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    const Carousel = bootstrap.Carousel

    bsCarousel.value = new Carousel(carouselRef.value, {
      interval: props.interval,
      keyboard: props.keyboard,
      pause: props.pause,
      ride: props.ride === true ? 'carousel' : props.ride,
      wrap: props.wrap,
      touch: props.touch
    }) as BootstrapCarousel

    carouselRef.value.addEventListener('slide.bs.carousel', onSlide)
    carouselRef.value.addEventListener('slid.bs.carousel', onSlid)

    if (props.modelValue !== 0) {
      bsCarousel.value.to(props.modelValue)
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Carousel will use data attributes only.',
      componentName: 'VibeCarousel',
      originalError: error
    })
  }
}

onMounted(initCarousel)

onBeforeUnmount(() => {
  if (carouselRef.value) {
    carouselRef.value.removeEventListener('slide.bs.carousel', onSlide)
    carouselRef.value.removeEventListener('slid.bs.carousel', onSlid)
  }

  if (bsCarousel.value) {
    bsCarousel.value.dispose()
    bsCarousel.value = null
  }
})

watch(() => props.modelValue, (newIndex) => {
  if (bsCarousel.value && newIndex !== activeIndex.value) {
    bsCarousel.value.to(newIndex)
  }
})

// Re-initialize if items change
watch(() => props.items, async () => {
  await nextTick()
  await initCarousel()
}, { deep: true })

const getImageAlt = (item: CarouselItem, index: number): string => {
  if (item.alt) return item.alt
  if (item.caption) return item.caption
  if (item.captionText) return item.captionText
  return `Carousel slide ${index + 1}`
}

defineExpose({ bsInstance: bsCarousel, refresh: initCarousel })
</script>

<template>
  <div
    ref="carouselRef"
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
        v-for="(_, index) in items"
        :key="`indicator-${index}`"
        type="button"
        :data-bs-target="`#${id}`"
        :data-bs-slide-to="index"
        :class="{ active: index === activeIndex }"
        :aria-current="index === activeIndex"
        :aria-label="`Slide ${index + 1}`"
      />
    </div>

    <!-- Slides -->
    <div class="carousel-inner">
      <div
        v-for="(item, index) in items"
        :key="`slide-${index}`"
        :class="['carousel-item', { active: index === activeIndex }]"
        :data-bs-interval="item.interval"
      >
        <img :src="item.src" :alt="getImageAlt(item, index)" class="d-block w-100">
        <div v-if="item.caption || item.captionText || $slots.caption" class="carousel-caption d-none d-md-block">
          <slot name="caption" :item="item" :index="index">
            <h5 v-if="item.caption">{{ item.caption }}</h5>
            <p v-if="item.captionText">{{ item.captionText }}</p>
          </slot>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <template v-if="controls">
      <button class="carousel-control-prev" type="button" :data-bs-target="`#${id}`" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true" />
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" :data-bs-target="`#${id}`" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true" />
        <span class="visually-hidden">Next</span>
      </button>
    </template>
  </div>
</template>
