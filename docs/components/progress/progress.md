# VibeProgress & VibeProgressBar

Progress bars for showing task completion.

## VibeProgress

Progress container component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `String` | `undefined` | Custom height (e.g., `'20px'`, `'2rem'`) |

## VibeProgressBar

Progress bar component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Number` | `0` | Current progress value |
| `max` | `Number` | `100` | Maximum value |
| `variant` | `Variant` | `undefined` | Color variant |
| `striped` | `Boolean` | `false` | Striped pattern |
| `animated` | `Boolean` | `false` | Animated stripes |
| `label` | `String` | `undefined` | Custom label text |
| `showValue` | `Boolean` | `false` | Show value as percentage |

## Usage

### Basic Progress

```vue
<template>
  <VibeProgress>
    <VibeProgressBar :value="25" />
  </VibeProgress>
</template>
```

### With Label

```vue
<template>
  <VibeProgress>
    <VibeProgressBar :value="75" show-value />
  </VibeProgress>
</template>
```

### Custom Height

```vue
<template>
  <VibeProgress height="20px">
    <VibeProgressBar :value="50" />
  </VibeProgress>
</template>
```

### Colored Progress Bars

```vue
<template>
  <div>
    <VibeProgress>
      <VibeProgressBar :value="25" variant="success" />
    </VibeProgress>
    <VibeProgress>
      <VibeProgressBar :value="50" variant="info" />
    </VibeProgress>
    <VibeProgress>
      <VibeProgressBar :value="75" variant="warning" />
    </VibeProgress>
    <VibeProgress>
      <VibeProgressBar :value="100" variant="danger" />
    </VibeProgress>
  </div>
</template>
```

### Striped

```vue
<template>
  <VibeProgress>
    <VibeProgressBar :value="60" variant="success" striped />
  </VibeProgress>
</template>
```

### Animated Stripes

```vue
<template>
  <VibeProgress>
    <VibeProgressBar :value="75" variant="info" animated />
  </VibeProgress>
</template>
```

### Multiple Bars

```vue
<template>
  <VibeProgress>
    <VibeProgressBar :value="15" variant="success" />
    <VibeProgressBar :value="30" variant="warning" />
    <VibeProgressBar :value="20" variant="danger" />
  </VibeProgress>
</template>
```

### Dynamic Progress

```vue
<script setup>
import { ref, onMounted } from 'vue'

const progress = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 10
    } else {
      clearInterval(interval)
    }
  }, 500)
})
</script>

<template>
  <VibeProgress>
    <VibeProgressBar :value="progress" variant="primary" show-value />
  </VibeProgress>
</template>
```

## Bootstrap CSS Classes

- `.progress`
- `.progress-bar`
- `.bg-{variant}`
- `.progress-bar-striped`
- `.progress-bar-animated`
