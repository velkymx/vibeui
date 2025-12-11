# VibeCarousel & VibeCarouselSlide

Slideshow component for cycling through images or content. Requires Bootstrap JS.

## VibeCarousel

Carousel container.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | Required | Unique identifier |
| `controls` | `Boolean` | `true` | Show prev/next controls |
| `indicators` | `Boolean` | `true` | Show slide indicators |
| `ride` | `Boolean\|String` | `false` | Auto-play: `false`, `true`, or `'carousel'` |
| `interval` | `Number\|Boolean` | `5000` | Slide interval in ms |
| `keyboard` | `Boolean` | `true` | Keyboard navigation |
| `pause` | `String\|Boolean` | `'hover'` | Pause on hover |
| `wrap` | `Boolean` | `true` | Continuous cycling |
| `touch` | `Boolean` | `true` | Touch swipe support |
| `dark` | `Boolean` | `false` | Dark variant indicators/controls |
| `fade` | `Boolean` | `false` | Fade transition instead of slide |
| `items` | `CarouselItem[]` | `undefined` | Array of carousel items (shorthand mode) |

#### CarouselItem Interface

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

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `slide` | - | Emitted when slide starts |
| `slid` | - | Emitted when slide completes |

## VibeCarouselSlide

Individual carousel slide.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Active slide |
| `interval` | `Number` | `undefined` | Slide-specific interval |
| `imgSrc` | `String` | `undefined` | Image source URL |
| `imgAlt` | `String` | `''` | Image alt text |
| `caption` | `String` | `undefined` | Caption heading |
| `captionText` | `String` | `undefined` | Caption text |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Slide content |
| `img` | Custom image content |
| `caption` | Custom caption content |

## Usage

### Shorthand Mode (Array-Based)

```vue
<template>
  <VibeCarousel id="carousel1" :items="carouselItems" />
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

### Composable Mode (Slot-Based)

```vue
<template>
  <VibeCarousel id="carouselExample">
    <VibeCarouselSlide
      active
      img-src="/images/slide1.jpg"
      img-alt="First slide"
    />
    <VibeCarouselSlide
      img-src="/images/slide2.jpg"
      img-alt="Second slide"
    />
    <VibeCarouselSlide
      img-src="/images/slide3.jpg"
      img-alt="Third slide"
    />
  </VibeCarousel>
</template>
```

### With Captions

```vue
<template>
  <VibeCarousel id="carouselCaptions">
    <VibeCarouselSlide
      active
      img-src="/images/slide1.jpg"
      img-alt="First slide"
      caption="First Slide"
      caption-text="Description for first slide"
    />
    <VibeCarouselSlide
      img-src="/images/slide2.jpg"
      img-alt="Second slide"
      caption="Second Slide"
      caption-text="Description for second slide"
    />
  </VibeCarousel>
</template>
```

### Fade Transition

```vue
<template>
  <VibeCarousel id="carouselFade" fade>
    <VibeCarouselSlide active img-src="/images/slide1.jpg" />
    <VibeCarouselSlide img-src="/images/slide2.jpg" />
    <VibeCarouselSlide img-src="/images/slide3.jpg" />
  </VibeCarousel>
</template>
```

### Auto-playing

```vue
<template>
  <VibeCarousel id="carouselAuto" ride="carousel" :interval="3000">
    <VibeCarouselSlide active img-src="/images/slide1.jpg" />
    <VibeCarouselSlide img-src="/images/slide2.jpg" />
    <VibeCarouselSlide img-src="/images/slide3.jpg" />
  </VibeCarousel>
</template>
```

### Without Controls

```vue
<template>
  <VibeCarousel id="carouselNoControls" :controls="false" :indicators="false">
    <VibeCarouselSlide active img-src="/images/slide1.jpg" />
    <VibeCarouselSlide img-src="/images/slide2.jpg" />
  </VibeCarousel>
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
