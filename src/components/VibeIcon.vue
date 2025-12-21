<script setup lang="ts">
import { computed, type PropType } from 'vue'

const props = defineProps({
  // Icon name (e.g., 'house', 'heart-fill', 'star')
  icon: { type: String, required: true },

  // Size variants
  size: { type: String as PropType<'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x'>, default: undefined },

  // Font size (e.g., '1.5rem', '24px')
  fontSize: { type: String, default: undefined },

  // Color
  color: { type: String, default: undefined },

  // Custom class
  customClass: { type: String, default: undefined },

  // Flip and rotate
  flipH: { type: Boolean, default: false },
  flipV: { type: Boolean, default: false },
  rotate: { type: Number as PropType<90 | 180 | 270>, default: undefined }
})

const emit = defineEmits(['click', 'component-error'])

const iconClass = computed(() => {
  const classes = ['bi', `bi-${props.icon}`]

  // Size classes
  if (props.size) {
    // Handle numeric sizes (1x, 2x, etc)
    if (['1x', '2x', '3x', '4x', '5x'].includes(props.size)) {
      // These need custom font-size via style
    } else {
      // Bootstrap utilities for sm/lg
      classes.push(`bi-${props.size}`)
    }
  }

  // Custom class
  if (props.customClass) {
    classes.push(props.customClass)
  }

  return classes.join(' ')
})

const iconStyle = computed(() => {
  const style: Record<string, string> = {}

  // Font size handling
  if (props.fontSize) {
    style.fontSize = props.fontSize
  } else if (props.size) {
    // Map size prop to font-size
    const sizeMap: Record<string, string> = {
      '1x': '1rem',
      '2x': '2rem',
      '3x': '3rem',
      '4x': '4rem',
      '5x': '5rem'
    }
    if (sizeMap[props.size]) {
      style.fontSize = sizeMap[props.size]
    }
  }

  // Color
  if (props.color) {
    style.color = props.color
  }

  // Transforms
  const transforms: string[] = []
  if (props.flipH) transforms.push('scaleX(-1)')
  if (props.flipV) transforms.push('scaleY(-1)')
  if (props.rotate) transforms.push(`rotate(${props.rotate}deg)`)

  if (transforms.length > 0) {
    style.transform = transforms.join(' ')
    style.display = 'inline-block' // Required for transform
  }

  return Object.keys(style).length > 0 ? style : undefined
})

const handleClick = (event: Event) => {
  emit('click', event)
}
</script>

<template>
  <i
    :class="iconClass"
    :style="iconStyle"
    :aria-hidden="true"
    @click="handleClick"
  ></i>
</template>
