<script setup lang="ts">
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  top: { type: Boolean, default: false },
  bottom: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])

const imgClass = props.top ? 'card-img-top' : props.bottom ? 'card-img-bottom' : 'card-img'
</script>

<template>
  <img :src="src" :alt="alt" :class="imgClass" />
</template>
