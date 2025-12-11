# Card Components

Flexible content container with multiple sub-components for headers, bodies, footers, images, titles, and text.

## VibeCard

Main card container component. Supports both **shorthand prop-based** and **composable slot-based** usage.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `undefined` | Background color variant |
| `border` | `Variant` | `undefined` | Border color variant |
| `textVariant` | `Variant` | `undefined` | Text color variant |
| `tag` | `String` | `'div'` | HTML tag to render |
| **Shorthand Props** | | | |
| `title` | `String` | `undefined` | Card title (auto-renders VibeCardTitle) |
| `body` | `String` | `undefined` | Card body text (auto-renders VibeCardText) |
| `header` | `String` | `undefined` | Card header text (auto-renders VibeCardHeader) |
| `footer` | `String` | `undefined` | Card footer text (auto-renders VibeCardFooter) |
| `headerImage` | `String` | `undefined` | Header image URL (auto-renders VibeCardImg at top) |
| `headerImageAlt` | `String` | `''` | Header image alt text |
| `footerImage` | `String` | `undefined` | Footer image URL (auto-renders VibeCardImg at bottom) |
| `footerImageAlt` | `String` | `''` | Footer image alt text |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Card content (for composable mode with sub-components) |

## Sub-Components

- **VibeCardHeader** - Card header section
- **VibeCardBody** - Card body section (main content)
- **VibeCardFooter** - Card footer section
- **VibeCardImg** - Card images
- **VibeCardTitle** - Card title heading
- **VibeCardText** - Card text paragraph

## Usage

VibeCard supports **two usage patterns**:

1. **Shorthand Mode** - Quick and easy with props
2. **Composable Mode** - Full control with sub-components

### Shorthand Mode (Quick & Easy)

Perfect for simple cards - just pass props:

```vue
<template>
  <!-- Simple card with title and body -->
  <VibeCard
    variant="primary"
    title="Card Title"
    body="This is the card body text. Quick and easy!"
  />

  <!-- Card with everything -->
  <VibeCard
    variant="success"
    header="Featured"
    headerImage="/path/to/image.jpg"
    headerImageAlt="Card image"
    title="Complete Card"
    body="Card with all the features using just props."
    footer="Last updated 3 mins ago"
  />
</template>
```

### Composable Mode (Full Control)

For complex cards with custom content:

```vue
<template>
  <VibeCard>
    <VibeCardBody>
      <VibeCardTitle>Card Title</VibeCardTitle>
      <VibeCardText>
        Card content goes here. This is some sample text.
      </VibeCardText>
      <VibeButton variant="primary">Go somewhere</VibeButton>
    </VibeCardBody>
  </VibeCard>
</template>
```

### Shorthand: Header and Footer

```vue
<template>
  <VibeCard
    header="Featured"
    title="Special title treatment"
    body="With supporting text below as a natural lead-in."
    footer="2 days ago"
  />
</template>
```

Or with composable mode:

```vue
<template>
  <VibeCard>
    <VibeCardHeader>Featured</VibeCardHeader>
    <VibeCardBody>
      <VibeCardTitle>Special title treatment</VibeCardTitle>
      <VibeCardText>
        With supporting text below as a natural lead-in.
      </VibeCardText>
      <VibeButton variant="primary">Go somewhere</VibeButton>
    </VibeCardBody>
    <VibeCardFooter class="text-muted">2 days ago</VibeCardFooter>
  </VibeCard>
</template>
```

### Shorthand: Card with Image

```vue
<template>
  <VibeCard
    headerImage="/path/to/image.jpg"
    headerImageAlt="Card image"
    title="Card with Image"
    body="This card has an image at the top."
  />
</template>
```

Or with composable mode:

```vue
<template>
  <VibeCard>
    <VibeCardImg top src="/path/to/image.jpg" alt="Card image" />
    <VibeCardBody>
      <VibeCardTitle>Card with Image</VibeCardTitle>
      <VibeCardText>
        This card has an image at the top.
      </VibeCardText>
    </VibeCardBody>
  </VibeCard>
</template>
```

### Shorthand: Colored Cards

```vue
<template>
  <div>
    <VibeCard
      variant="primary"
      text-variant="white"
      title="Primary Card"
      body="Card with primary background."
    />

    <VibeCard
      variant="success"
      text-variant="white"
      title="Success Card"
      body="Card with success background."
    />
  </div>
</template>
```

Or with composable mode:

```vue
<template>
  <div>
    <VibeCard variant="primary" text-variant="white">
      <VibeCardBody>
        <VibeCardTitle>Primary Card</VibeCardTitle>
        <VibeCardText>Card with primary background.</VibeCardText>
      </VibeCardBody>
    </VibeCard>

    <VibeCard variant="success" text-variant="white">
      <VibeCardBody>
        <VibeCardTitle>Success Card</VibeCardTitle>
        <VibeCardText>Card with success background.</VibeCardText>
      </VibeCardBody>
    </VibeCard>
  </div>
</template>
```

### Border Variants

```vue
<template>
  <div>
    <VibeCard border="primary">
      <VibeCardBody>
        <VibeCardTitle>Primary Border</VibeCardTitle>
        <VibeCardText>Card with primary border.</VibeCardText>
      </VibeCardBody>
    </VibeCard>

    <VibeCard border="danger">
      <VibeCardBody>
        <VibeCardTitle>Danger Border</VibeCardTitle>
        <VibeCardText>Card with danger border.</VibeCardText>
      </VibeCardBody>
    </VibeCard>
  </div>
</template>
```

### Horizontal Card

```vue
<template>
  <VibeCard>
    <div class="row g-0">
      <div class="col-md-4">
        <VibeCardImg src="/path/to/image.jpg" alt="..." />
      </div>
      <div class="col-md-8">
        <VibeCardBody>
          <VibeCardTitle>Horizontal Card</VibeCardTitle>
          <VibeCardText>
            This is a wider card with supporting text.
          </VibeCardText>
          <VibeCardText>
            <small class="text-muted">Last updated 3 mins ago</small>
          </VibeCardText>
        </VibeCardBody>
      </div>
    </div>
  </VibeCard>
</template>
```

### Card Grid

```vue
<template>
  <div class="row row-cols-1 row-cols-md-3 g-4">
    <div class="col">
      <VibeCard>
        <VibeCardImg top src="/path/to/image1.jpg" alt="..." />
        <VibeCardBody>
          <VibeCardTitle>Card 1</VibeCardTitle>
          <VibeCardText>Card content here.</VibeCardText>
        </VibeCardBody>
      </VibeCard>
    </div>
    <div class="col">
      <VibeCard>
        <VibeCardImg top src="/path/to/image2.jpg" alt="..." />
        <VibeCardBody>
          <VibeCardTitle>Card 2</VibeCardTitle>
          <VibeCardText>Card content here.</VibeCardText>
        </VibeCardBody>
      </VibeCard>
    </div>
    <div class="col">
      <VibeCard>
        <VibeCardImg top src="/path/to/image3.jpg" alt="..." />
        <VibeCardBody>
          <VibeCardTitle>Card 3</VibeCardTitle>
          <VibeCardText>Card content here.</VibeCardText>
        </VibeCardBody>
      </VibeCard>
    </div>
  </div>
</template>
```

## Bootstrap CSS Classes

- `.card`
- `.card-header`
- `.card-body`
- `.card-footer`
- `.card-img-top`
- `.card-img-bottom`
- `.card-img`
- `.card-title`
- `.card-text`
- `.bg-{variant}`
- `.border-{variant}`
- `.text-{variant}`
