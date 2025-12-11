<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Size, ButtonType } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant, default: 'primary' },
  size: { type: String as () => Size, default: undefined },
  outline: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String as () => ButtonType, default: 'button' },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  active: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'component-error'])

const tag = computed(() => {
  if (props.href) return 'a'
  if (props.to) return 'router-link'
  return 'button'
})

const buttonClass = computed(() => {
  const classes = ['btn']

  if (props.outline) {
    classes.push(`btn-outline-${props.variant}`)
  } else {
    classes.push(`btn-${props.variant}`)
  }

  if (props.size) classes.push(`btn-${props.size}`)
  if (props.active) classes.push('active')

  return classes.join(' ')
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <component
    :is="tag"
    :class="buttonClass"
    :type="href || to ? undefined : type"
    :href="href"
    :to="to"
    :disabled="disabled"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </component>
</template>
