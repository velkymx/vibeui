# VibeSlider

Cross-browser range slider with consistent look and full keyboard support. Single mode binds a number; range mode binds `[low, high]` with handles that cannot cross.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Number \| [Number, Number]` | `0` | Slider value (v-model) |
| `min` | `Number` | `0` | |
| `max` | `Number` | `100` | |
| `step` | `Number` | `1` | Snap step |
| `range` | `Boolean` | `false` | Two-handle range mode |
| `vertical` | `Boolean` | `false` | Vertical orientation |
| `disabled` | `Boolean` | `false` | |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number \| [Number, Number]` | New value |
| `change` | Same | Alias |

## Keyboard

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowUp` | +1 step |
| `ArrowLeft` / `ArrowDown` | –1 step |
| `Home` | Jump to `min` |
| `End` | Jump to `max` |
| `PageUp` | +10 steps |
| `PageDown` | –10 steps |

## Examples

### Single value

```vue
<VibeSlider v-model="volume" :min="0" :max="100" :step="5" />
```

### Range

```vue
<VibeSlider v-model="priceRange" range :min="0" :max="500" />
```

### Vertical

```vue
<VibeSlider v-model="value" vertical />
```

## Accessibility

Each handle has `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `tabindex="0"`. Disabled state sets `aria-disabled="true"`.
