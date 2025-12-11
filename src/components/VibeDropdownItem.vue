<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  divider: { type: Boolean, default: false },
  header: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'component-error'])

const tag = computed(() => {
  if (props.divider) return 'hr'
  if (props.header) return 'h6'
  if (props.href) return 'a'
  if (props.to) return 'router-link'
  return 'button'
})

const itemClass = computed(() => {
  if (props.divider) return 'dropdown-divider'
  if (props.header) return 'dropdown-header'

  const classes = ['dropdown-item']
  if (props.active) classes.push('active')
  if (props.disabled) classes.push('disabled')
  return classes.join(' ')
})

const handleClick = (event: Event) => {
  if (!props.disabled && !props.divider && !props.header) {
    emit('click', event)
  }
}
</script>

<template>
  <li v-if="!divider && !header">
    <component
      :is="tag"
      :class="itemClass"
      :href="href"
      :to="to"
      :type="tag === 'button' ? 'button' : undefined"
      :disabled="disabled"
      @click="handleClick"
    >
      <slot />
    </component>
  </li>
  <component v-else :is="tag" :class="itemClass">
    <slot />
  </component>
</template>
