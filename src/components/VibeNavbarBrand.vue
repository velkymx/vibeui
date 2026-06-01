<script setup lang="ts">
const props = defineProps({
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined }
})

const emit = defineEmits(['component-error'])

const tag = props.href ? 'a' : props.to ? 'router-link' : 'span'
</script>

<template>
  <component :is="tag" class="navbar-brand" :href="href" :to="to">
    <slot />
  </component>
</template>
