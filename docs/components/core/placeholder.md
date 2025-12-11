# VibePlaceholder

Placeholder loading component with optional animations.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `Variant` | `undefined` | Background color variant |
| `size` | `Size` | `undefined` | Placeholder size: `'sm'` or `'lg'` |
| `animation` | `PlaceholderAnimation` | `undefined` | Animation type: `'glow'` or `'wave'` |
| `width` | `String\|Number` | `undefined` | Width as percentage or CSS value |
| `tag` | `String` | `'span'` | HTML tag to render |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `component-error` | `Object` | Emitted when an error occurs |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Placeholder content (typically empty) |

## Usage

### Basic Placeholder

```vue
<template>
  <VibePlaceholder width="75" />
</template>
```

### Placeholder Card

```vue
<template>
  <VibeCard>
    <VibeCardBody>
      <VibeCardTitle>
        <VibePlaceholder width="100" />
      </VibeCardTitle>
      <VibeCardText>
        <VibePlaceholder width="100" />
        <VibePlaceholder width="100" />
        <VibePlaceholder width="75" />
      </VibeCardText>
    </VibeCardBody>
  </VibeCard>
</template>
```

### With Glow Animation

```vue
<template>
  <div>
    <VibePlaceholder animation="glow" width="100" />
    <VibePlaceholder animation="glow" width="75" />
  </div>
</template>
```

### With Wave Animation

```vue
<template>
  <div>
    <VibePlaceholder animation="wave" width="100" />
    <VibePlaceholder animation="wave" width="90" />
    <VibePlaceholder animation="wave" width="80" />
  </div>
</template>
```

### Colored Placeholders

```vue
<template>
  <div>
    <VibePlaceholder variant="primary" width="100" />
    <VibePlaceholder variant="success" width="75" />
    <VibePlaceholder variant="danger" width="50" />
  </div>
</template>
```

### Sizes

```vue
<template>
  <div>
    <VibePlaceholder size="lg" width="100" />
    <VibePlaceholder width="100" />
    <VibePlaceholder size="sm" width="100" />
  </div>
</template>
```

### Loading State Example

```vue
<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const data = ref(null)

onMounted(async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  data.value = { title: 'Article Title', content: 'Article content...' }
  loading.value = false
})
</script>

<template>
  <VibeCard>
    <VibeCardBody>
      <template v-if="loading">
        <VibePlaceholder animation="glow" width="100" />
        <VibePlaceholder animation="glow" width="100" />
        <VibePlaceholder animation="glow" width="75" />
      </template>
      <template v-else>
        <VibeCardTitle>{{ data.title }}</VibeCardTitle>
        <VibeCardText>{{ data.content }}</VibeCardText>
      </template>
    </VibeCardBody>
  </VibeCard>
</template>
```

## Bootstrap CSS Classes

- `.placeholder`
- `.bg-{variant}`
- `.placeholder-{size}`
- `.placeholder-{animation}`
