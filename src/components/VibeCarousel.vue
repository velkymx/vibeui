<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, ref, onMounted, watch, nextTick } from 'vue'
import type { CarouselItem, ComponentError } from '../types'
import { useId } from '../composables/useId'

// Bootstrap's slide/slid events are DOM Events carrying extra fields, so the type
// extends Event — this lets the listeners be plain EventListeners while still
// exposing `to`/`from`/`direction` after a narrowing cast.
interface CarouselEvent extends Event {
  from: number
  to: number
  direction: 'left' | 'right'
}

interface BootstrapCarousel {
  to: (index: number) => void
  next: () => void
  prev: () => void
  pause: () => void
  cycle: () => void
  dispose: () => void
}

// Hoisted to setup so the id is owned by this instance and stable — calling useId()
// inside a defineProps default factory runs during prop normalization, which is
// fragile across Vue versions and inconsistent with the rest of the library.
const _generatedId = useId('carousel')

const props = defineProps({
  id: { type: String, default: undefined },
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
  items: { type: Array as () => CarouselItem[], required: true },
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No slides' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', index: number): void
  (e: 'slide', event: Event): void
  (e: 'slid', event: Event): void
  (e: 'component-error', error: ComponentError): void
}>()

// #147: type the caption slot.
defineSlots<{
  caption?: (props: { item: CarouselItem; index: number }) => unknown
}>()

const carouselRef = useTemplateRef<HTMLElement>('carouselRef')
const activeIndex = ref(props.modelValue)

// Consumer-supplied id wins; otherwise the stable generated id.
const computedId = computed(() => props.id || _generatedId)

const carouselClass = computed(() => {
  const classes = ['carousel', 'slide']
  if (props.dark) classes.push('carousel-dark')
  if (props.fade) classes.push('carousel-fade')
  return classes.join(' ')
})

const onSlide = (event: Event) => {
  emit('slide', event)
}

const onSlid = (event: Event) => {
  const { to } = event as CarouselEvent
  activeIndex.value = to
  emit('update:modelValue', to)
  emit('slid', event)
}

// Instance lifecycle owned by the shared composable (#247): lazy async
// construction, per-instance slide listeners, dispose plus nulling, and
// unmount-race guards (queued reinits served internally). Empty-items
// teardown plus the post-construction slide-to stay in the wrapper.
const { init: initInstance, destroy, instance: bsCarousel } = useBootstrapInstance<BootstrapCarousel>({
  // No slides, or a torn-down ref, means nothing to construct: resolve null
  // (covers both the pre-await and the emptied-mid-import cases) so Bootstrap
  // is never handed an empty inner.
  resolveElement: () => (props.items.length > 0 ? carouselRef.value : null),
  create: (el, bootstrap) =>
    new bootstrap.Carousel(el, {
      interval: props.interval,
      keyboard: props.keyboard,
      pause: props.pause,
      ride: props.ride === true ? 'carousel' : props.ride,
      wrap: props.wrap,
      touch: props.touch
    }) as unknown as BootstrapCarousel,
  disposeInstance: (carousel) => carousel.dispose(),
  events: {
    'slide.bs.carousel': onSlide as EventListener,
    'slid.bs.carousel': onSlid as EventListener
  },
  componentName: 'VibeCarousel',
  onError: (error) => reportComponentError(emit, error)
})

const initCarousel = async (): Promise<void> => {
  // No slides: tear down any live instance (the composable no-ops on a null
  // element without disposing) rather than handing Bootstrap an empty inner.
  if (!props.items.length) {
    destroy()
    return
  }
  await initInstance()
  if (props.modelValue !== 0) {
    bsCarousel.value?.to(props.modelValue)
  }
}

onMounted(initCarousel)

watch(() => props.modelValue, (newIndex) => {
  if (bsCarousel.value && newIndex !== activeIndex.value) {
    bsCarousel.value.to(newIndex)
  }
})

watch(() => props.items, async () => {
  activeIndex.value = 0
  await nextTick()
  // Queued reinits are served inside the composable; no manual flags needed.
  await initCarousel()
}, { deep: false })

const getImageAlt = (item: CarouselItem, index: number): string => {
  if (item.alt) return item.alt
  if (item.caption) return item.caption
  if (item.captionText) return item.captionText
  return `Carousel slide ${index + 1}`
}

// _unsafe_bsInstance is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on it directly WILL break this component.
defineExpose({ refresh: initCarousel, _unsafe_bsInstance: bsCarousel })
</script>

<template>
  <div
    ref="carouselRef"
    :id="computedId"
    :class="carouselClass"
    :data-bs-ride="ride === true ? 'carousel' : ride"
    :data-bs-interval="interval"
    :data-bs-keyboard="keyboard"
    :data-bs-pause="pause"
    :data-bs-wrap="wrap"
    :data-bs-touch="touch"
  >
    <!-- Indicators -->
    <div v-if="indicators && items.length > 0" class="carousel-indicators">
      <button
        v-for="(item, index) in items"
        :key="item.src ?? index"
        type="button"
        :data-bs-target="`#${computedId}`"
        :data-bs-slide-to="index"
        :class="{ active: index === activeIndex }"
        :aria-current="index === activeIndex"
        :aria-label="`Slide ${index + 1}`"
      />
    </div>

    <!-- Slides -->
    <div class="carousel-inner">
      <div v-if="items.length === 0 && showEmpty" class="carousel-item active">
        <p class="text-center text-body-secondary p-4">{{ emptyText }}</p>
      </div>
      <div
        v-for="(item, index) in items"
        :key="item.src ?? index"
        :class="['carousel-item', { active: index === activeIndex }]"
        :data-bs-interval="item.interval"
      >
        <img v-if="item.src" :src="item.src" :alt="getImageAlt(item, index)" class="d-block w-100">
        <div v-if="item.caption || item.captionText || $slots.caption" class="carousel-caption d-none d-md-block">
          <slot name="caption" :item="item" :index="index">
            <h5 v-if="item.caption">{{ item.caption }}</h5>
            <p v-if="item.captionText">{{ item.captionText }}</p>
          </slot>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <template v-if="controls && items.length > 0">
      <button class="carousel-control-prev" type="button" :data-bs-target="`#${computedId}`" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true" />
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" :data-bs-target="`#${computedId}`" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true" />
        <span class="visually-hidden">Next</span>
      </button>
    </template>
  </div>
</template>
