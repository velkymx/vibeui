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
  return 'button'
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <li :class="['page-item', { active, disabled }]">
    <component
      :is="linkTag"
      class="page-link"
      :href="href"
      :to="to"
      :type="linkTag === 'button' ? 'button' : undefined"
      :disabled="disabled && linkTag === 'button'"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled"
      @click="handleClick"
    >
      <slot />
    </component>
  </li>
</template>
