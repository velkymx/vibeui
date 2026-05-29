<script setup lang="ts">
import { safeHref } from '../utils/safeHref'

const props = defineProps({
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined }
})

import type { ComponentError } from '../types'

const emit = defineEmits<{
  (e: 'component-error', error: ComponentError): void
}>()

const tag = safeHref(props.href) ? 'a' : props.to ? 'router-link' : 'span'
</script>

<template>
  <component :is="tag" class="navbar-brand" :href="safeHref(href)" :to="to">
    <slot />
  </component>
</template>
