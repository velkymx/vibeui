<script setup lang="ts">
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'

const props = defineProps({
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined }
})

const tag = safeHref(props.href) ? 'a' : props.to ? 'router-link' : 'span'
</script>

<template>
  <component :is="tag" class="navbar-brand" v-bind="linkBindings(safeHref(href), to)">
    <slot />
  </component>
</template>
