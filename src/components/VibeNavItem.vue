<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined }
})

const emit = defineEmits(['click', 'component-error'])

const linkTag = computed(() => {
  if (props.href) return 'a'
  if (props.to) return 'router-link'
  return 'a'
})

const linkClass = computed(() => {
  const classes = ['nav-link']
  if (props.active) classes.push('active')
  if (props.disabled) classes.push('disabled')
  return classes.join(' ')
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <li class="nav-item">
    <component
      :is="linkTag"
      :class="linkClass"
      :href="href"
      :to="to"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled"
      @click="handleClick"
    >
      <slot />
    </component>
  </li>
</template>
