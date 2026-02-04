# VibeCarousel

Data-driven slideshow component for cycling through images or content. Requires Bootstrap JS.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
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
| `slide` | - | Emitted when slide transition starts |
| `slid` | - | Emitted when slide transition completes |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `caption` | `{ item, index }` | Custom caption rendering |

## Usage

### Basic Carousel

```vue
<template>
  <VibeCarousel id="carousel1" :items="carouselItems" />
</template>

<script setup>
const carouselItems = [
  {
    src: '/images/slide1.jpg',
    alt: 'First slide',
    active: true
  },
  {
    src: '/images/slide2.jpg',
    alt: 'Second slide'
  },
  {
    src: '/images/slide3.jpg',
    alt: 'Third slide'
  }
]
</script>
```

### With Captions

```vue
<template>
  <VibeCarousel id="carousel-captions" :items="carouselItems" />
</template>

<script setup>
const carouselItems = [
  {
    src: '/images/slide1.jpg',
    alt: 'First slide',
    caption: 'First Slide',
    captionText: 'Description for the first slide',
    active: true
  },
  {
    src: '/images/slide2.jpg',
    alt: 'Second slide',
    caption: 'Second Slide',
    captionText: 'Description for the second slide'
  },
  {
    src: '/images/slide3.jpg',
    alt: 'Third slide',
    caption: 'Third Slide',
    captionText: 'Description for the third slide'
  }
]
</script>
```

### Fade Transition

```vue
<template>
  <VibeCarousel id="carousel-fade" fade :items="carouselItems" />
</template>
```

### Auto-playing

```vue
<template>
  <VibeCarousel
    id="carousel-auto"
    ride="carousel"
    :interval="3000"
    :items="carouselItems"
  />
</template>
```

### Without Controls or Indicators

```vue
<template>
  <VibeCarousel
    id="carousel-minimal"
    :controls="false"
    :indicators="false"
    :items="carouselItems"
  />
</template>
```

### Dark Variant

For use on light backgrounds:

```vue
<template>
  <VibeCarousel id="carousel-dark" dark :items="carouselItems" />
</template>
```

### Custom Captions

Use the `caption` scoped slot for rich captions:

```vue
<template>
  <VibeCarousel id="carousel-custom" :items="carouselItems">
    <template #caption="{ item, index }">
      <div class="p-3 bg-dark bg-opacity-75 rounded">
        <h3>{{ item.caption }}</h3>
        <p class="mb-0">{{ item.captionText }}</p>
        <VibeButton size="sm" variant="primary" class="mt-2">
          Learn More
        </VibeButton>
      </div>
    </template>
  </VibeCarousel>
</template>
```

### Different Intervals Per Slide

```vue
<template>
  <VibeCarousel id="carousel-intervals" ride="carousel" :items="carouselItems" />
</template>

<script setup>
const carouselItems = [
  {
    src: '/images/slide1.jpg',
    alt: 'Slow slide',
    interval: 10000, // 10 seconds
    active: true
  },
  {
    src: '/images/slide2.jpg',
    alt: 'Fast slide',
    interval: 2000 // 2 seconds
  },
  {
    src: '/images/slide3.jpg',
    alt: 'Default speed'
    // Uses carousel's default interval
  }
]
</script>
```

### With Event Handling

```vue
<template>
  <VibeCarousel
    id="carousel-events"
    :items="carouselItems"
    @slide="handleSlide"
    @slid="handleSlid"
  />
</template>

<script setup>
const carouselItems = [
  { src: '/images/slide1.jpg', alt: 'Slide 1', active: true },
  { src: '/images/slide2.jpg', alt: 'Slide 2' },
  { src: '/images/slide3.jpg', alt: 'Slide 3' }
]

const handleSlide = () => {
  console.log('Slide transition started')
}

const handleSlid = () => {
  console.log('Slide transition completed')
}
</script>
```

### Responsive Example

```vue
<template>
  <VibeContainer>
    <VibeRow>
      <VibeCol :cols="12" :lg="8" class="mx-auto">
        <VibeCarousel id="carousel-responsive" :items="carouselItems" />
      </VibeCol>
    </VibeRow>
  </VibeContainer>
</template>
```

**Note:** Requires Bootstrap JavaScript to be included in your project.

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
