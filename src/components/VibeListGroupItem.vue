<script setup lang="ts">
import { computed } from 'vue'
import type { Variant } from '../types'

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  variant: { type: String as () => Variant, default: undefined },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  tag: { type: String, default: 'li' },
  action: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'component-error'])

const componentTag = computed(() => {
  if (props.href) return 'a'
  if (props.to) return 'router-link'
  if (props.action) return 'button'
  return props.tag
})

const itemClass = computed(() => {
  const classes = ['list-group-item']
  if (props.active) classes.push('active')
  if (props.disabled) classes.push('disabled')
  if (props.variant) classes.push(`list-group-item-${props.variant}`)
  if (props.action || props.href || props.to) classes.push('list-group-item-action')
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
    :is="componentTag"
    :class="itemClass"
    :href="href"
    :to="to"
    :type="componentTag === 'button' ? 'button' : undefined"
    :disabled="disabled"
    :aria-disabled="disabled"
    :aria-current="active ? 'true' : undefined"
    @click="handleClick"
  >
    <slot />
  </component>
</template>
