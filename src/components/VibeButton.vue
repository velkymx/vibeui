<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonVariant, Size, ButtonType, ComponentError } from '../types'

const props = defineProps({
  variant: { type: String as () => ButtonVariant, default: 'primary' },
  size: { type: String as () => Size, default: undefined },
  outline: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String as () => ButtonType, default: 'button' },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  active: { type: Boolean, default: false },
  focusRing: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'component-error', error: ComponentError): void
}>()

const tag = computed(() => {
  if (props.href) return 'a'
  // When disabled, render a span instead of router-link to block internal navigation
  if (props.to) return props.disabled ? 'span' : 'router-link'
  return 'button'
})

const buttonClass = computed(() => {
  const classes = ['btn']

  if (props.variant === 'link') {
    classes.push('btn-link')
  } else if (props.outline) {
    classes.push(`btn-outline-${props.variant}`)
  } else {
    classes.push(`btn-${props.variant}`)
  }

  if (props.size) classes.push(`btn-${props.size}`)
  if (props.active) classes.push('active')
  if (props.focusRing) classes.push('focus-ring')
  // Bootstrap uses the 'disabled' CSS class for non-button elements
  if (props.disabled && tag.value !== 'button') classes.push('disabled')

  return classes.join(' ')
})

const handleClick = (event: Event) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    :class="buttonClass"
    :type="href || to ? undefined : type"
    :href="href"
    :to="to || undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
  >
    <slot />
  </component>
</template>
