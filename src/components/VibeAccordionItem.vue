<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  parentId: { type: String, required: true },
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['component-error'])

const collapseClass = computed(() => {
  return props.show ? 'accordion-collapse collapse show' : 'accordion-collapse collapse'
})
</script>

<template>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button
        :class="['accordion-button', { collapsed: !show }]"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="`#${id}`"
        :aria-expanded="show"
        :aria-controls="id"
      >
        {{ title }}
      </button>
    </h2>
    <div
      :id="id"
      :class="collapseClass"
      :data-bs-parent="`#${parentId}`"
    >
      <div class="accordion-body">
        <slot />
      </div>
    </div>
  </div>
</template>
