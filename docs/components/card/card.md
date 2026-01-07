# VibeCard

Flexible content container component for displaying headers, bodies, footers, and images.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `undefined` | Background color variant |
| `border` | `Variant` | `undefined` | Border color variant |
| `textVariant` | `Variant` | `undefined` | Text color variant |
| `tag` | `String` | `'div'` | HTML tag to render |
| `title` | `String` | `undefined` | Card title |
| `body` | `String` | `undefined` | Card body text |
| `header` | `String` | `undefined` | Card header text |
| `footer` | `String` | `undefined` | Card footer text |
| `imgSrc` | `String` | `undefined` | Image URL |
| `imgAlt` | `String` | `''` | Image alt text |
| `imgTop` | `Boolean` | `true` | Display image at top |
| `imgBottom` | `Boolean` | `false` | Display image at bottom |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Additional body content |
| `header` | Custom header content |
| `title` | Custom title content |
| `body` | Custom body content |
| `footer` | Custom footer content |

## Usage

### Basic Card

```vue
<template>
  <VibeCard
    title="Card Title"
    body="This is the card body text. Quick and easy!"
  />
</template>
```

### Card with Header and Footer

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

### Card with Image

```vue
<template>
  <VibeCard
    img-src="/path/to/image.jpg"
    img-alt="Card image"
    title="Card with Image"
    body="This card has an image at the top."
  />
</template>
```

### Colored Cards

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

### Border Variants

```vue
<template>
  <div>
    <VibeCard
      border="primary"
      title="Primary Border"
      body="Card with primary border."
    />

    <VibeCard
      border="danger"
      title="Danger Border"
      body="Card with danger border."
    />
  </div>
</template>
```

### Custom Content with Slots

Use named slots for complex content:

```vue
<template>
  <VibeCard>
    <template #header>
      <strong>Featured</strong>
    </template>

    <template #title>
      Special Title Treatment
    </template>

    <template #body>
      <p>With supporting text below as a natural lead-in.</p>
    </template>

    <!-- Additional body content via default slot -->
    <VibeButton variant="primary">Go somewhere</VibeButton>

    <template #footer>
      <small class="text-muted">Last updated 3 mins ago</small>
    </template>
  </VibeCard>
</template>
```

### Horizontal Card

Use the default slot with Bootstrap grid:

```vue
<template>
  <VibeCard>
    <div class="row g-0">
      <div class="col-md-4">
        <img src="/path/to/image.jpg" alt="..." class="card-img">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">Horizontal Card</h5>
          <p class="card-text">
            This is a wider card with supporting text.
          </p>
          <p class="card-text">
            <small class="text-muted">Last updated 3 mins ago</small>
          </p>
        </div>
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
      <VibeCard
        img-src="/path/to/image1.jpg"
        img-alt="Card 1"
        title="Card 1"
        body="Card content here."
      />
    </div>
    <div class="col">
      <VibeCard
        img-src="/path/to/image2.jpg"
        img-alt="Card 2"
        title="Card 2"
        body="Card content here."
      />
    </div>
    <div class="col">
      <VibeCard
        img-src="/path/to/image3.jpg"
        img-alt="Card 3"
        title="Card 3"
        body="Card content here."
      />
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
