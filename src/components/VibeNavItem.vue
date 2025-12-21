<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  // Tab-specific props
  tab: { type: Boolean, default: false },
  target: { type: String, default: undefined }
})

const emit = defineEmits(['click', 'component-error'])

const linkTag = computed(() => {
  // For tabs, always use button if no href/to specified
  if (props.tab && !props.href && !props.to) return 'button'
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
  <li class="nav-item" :role="tab ? 'presentation' : undefined">
    <component
      :is="linkTag"
      :class="linkClass"
      :href="href"
      :to="to"
      :type="linkTag === 'button' ? 'button' : undefined"
      :data-bs-toggle="tab ? 'tab' : undefined"
      :data-bs-target="tab && target ? target : undefined"
      :role="tab ? 'tab' : undefined"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled"
      :aria-selected="tab ? active : undefined"
      @click="handleClick"
    >
      <slot />
    </component>
  </li>
</template>
