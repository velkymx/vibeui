# VibeCarousel

Data-driven slideshow component for cycling through images or content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | `Auto-generated` | Unique identifier |
| `modelValue` | `Number` | `0` | Active slide index (v-model) |
| `controls` | `Boolean` | `true` | Show prev/next controls |
| `indicators` | `Boolean` | `true` | Show slide indicators |
| `ride` | `Boolean\|String` | `false` | Auto-play: `false`, `true`, or `'carousel'` |
| `interval` | `Number\|Boolean` | `5000` | Slide interval in ms (`false` to disable) |
| `keyboard` | `Boolean` | `true` | Keyboard navigation |
| `pause` | `String\|Boolean` | `'hover'` | Pause on hover (`'hover'` or `false`) |
| `wrap` | `Boolean` | `true` | Continuous cycling |
| `touch` | `Boolean` | `true` | Touch swipe support |
| `dark` | `Boolean` | `false` | Dark variant indicators/controls |
| `fade` | `Boolean` | `false` | Fade transition instead of slide |
| `items` | `CarouselItem[]` | Required | Array of carousel items |

### CarouselItem Interface

```typescript
interface CarouselItem {
  src: string
  alt?: string
  caption?: string
  captionText?: string
  active?: boolean
  interval?: number
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number` | Emitted when the active slide changes |
| `slide` | `Event` | Emitted when slide transition starts (Bootstrap `slide.bs.carousel`) |
| `slid` | `Event` | Emitted when slide transition completes (Bootstrap `slid.bs.carousel`) |
| `component-error` | `ComponentError` | Emitted if Bootstrap JS fails to load |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `caption` | `{ item, index }` | Custom caption rendering |

## Usage

### Reactive Usage (v-model)

```vue
<template>
  <div>
    <VibeCarousel v-model="currentSlide" :items="carouselItems" />
    
    <div class="mt-3">
      <VibeButton @click="currentSlide = 0">Go to Slide 1</VibeButton>
      <VibeButton @click="currentSlide = 1">Go to Slide 2</VibeButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const currentSlide = ref(0)
const carouselItems = [
  { src: '/img/slide-1.jpg', caption: 'First slide', captionText: 'Intro copy' },
  { src: '/img/slide-2.jpg', caption: 'Second slide' }
]
</script>
```

### Basic Carousel

```vue
<template>
  <VibeCarousel :items="carouselItems" />
</template>

<script setup>
const carouselItems = [
  { src: '/img/slide-1.jpg', alt: 'A scenic view' },
  { src: '/img/slide-2.jpg', alt: 'A city street' }
]
</script>
```

## Important Notes

**Automatic Initialization:** This component automatically initializes Bootstrap's Carousel functionality when it is mounted, provided that Bootstrap's JavaScript is available in your project.

**`item.src` is required:** Every slide is an image slide — each item must provide a `src`. Captions and alt text are optional (an accessible fallback `alt` is generated from `alt` → `caption` → `captionText` → `"Carousel slide N"`).

**Empty items:** An empty `items` array is handled gracefully — the carousel simply renders no slides.

**Escape Hatch:** The exposed `_unsafe_bsInstance` template ref gives raw access to the underlying Bootstrap Carousel instance. It is **not** part of the stable API — calling `dispose()` or other lifecycle methods on it directly **will** break the component. To re-initialize after manual changes, call the exposed `refresh()` method instead.

## Bootstrap CSS Classes

- `.carousel`
- `.carousel-inner`
- `.carousel-item`
- `.carousel-control-prev`
- `.carousel-control-next`
- `.carousel-indicators`
- `.carousel-caption`
- `.carousel-dark`
- `.carousel-fade`
