<script setup lang="ts">
const props = defineProps({
  active: { type: Boolean, default: false },
  interval: { type: Number, default: undefined },
  imgSrc: { type: String, default: undefined },
  imgAlt: { type: String, default: '' },
  caption: { type: String, default: undefined },
  captionText: { type: String, default: undefined }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <div :class="['carousel-item', { active }]" :data-bs-interval="interval">
    <img v-if="imgSrc" :src="imgSrc" class="d-block w-100" :alt="imgAlt" />
    <slot name="img" />
    <div v-if="caption || captionText || $slots.caption" class="carousel-caption d-none d-md-block">
      <slot name="caption">
        <h5 v-if="caption">{{ caption }}</h5>
        <p v-if="captionText">{{ captionText }}</p>
      </slot>
    </div>
    <slot />
  </div>
</template>
