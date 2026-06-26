<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  errors: { type: Object as () => Record<string, string>, required: true }
})

const emit = defineEmits<{
  (e: 'focus', key: string): void
}>()

// Only list entries that have a non-empty error message.
const entries = computed(() =>
  Object.entries(props.errors).filter(([, msg]) => msg)
)
</script>

<template>
  <!-- WCAG 3.3.1: top-of-form error summary announced to screen readers via role=alert -->
  <div
    v-if="entries.length"
    role="alert"
    aria-live="polite"
    class="alert alert-danger"
  >
    <strong>Please fix the following:</strong>
    <ul class="mb-0">
      <li v-for="[key, msg] in entries" :key="key">
        <!-- href anchors to the field element; click emits 'focus' for programmatic control -->
        <a :href="`#field-${key}`" @click.prevent="emit('focus', key)">{{ msg }}</a>
      </li>
    </ul>
  </div>
</template>
