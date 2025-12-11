<script setup lang="ts">
const props = defineProps({
  active: { type: Boolean, default: false },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined }
})

const emit = defineEmits(['component-error'])

const tag = props.href ? 'a' : props.to ? 'router-link' : 'span'
</script>

<template>
  <li :class="['breadcrumb-item', { active }]" :aria-current="active ? 'page' : undefined">
    <component :is="tag" :href="href" :to="to">
      <slot />
    </component>
  </li>
</template>
