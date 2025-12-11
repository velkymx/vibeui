<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Variant, Size, Direction, DropdownItem } from '../types'
import VibeDropdownItem from './VibeDropdownItem.vue'

const props = defineProps({
  id: { type: String, required: true },
  text: { type: String, default: 'Dropdown' },
  variant: { type: String as () => Variant, default: 'primary' },
  size: { type: String as () => Size, default: undefined },
  split: { type: Boolean, default: false },
  direction: { type: String as () => Direction, default: 'down' },
  menuEnd: { type: Boolean, default: false },
  items: { type: Array as () => DropdownItem[], default: undefined }
})

const emit = defineEmits(['component-error'])

const slots = useSlots()

const dropdownClass = computed(() => {
  if (props.direction === 'up') return 'dropup'
  if (props.direction === 'end') return 'dropend'
  if (props.direction === 'start') return 'dropstart'
  return 'dropdown'
})

const buttonClass = computed(() => {
  const classes = ['btn', `btn-${props.variant}`]
  if (props.size) classes.push(`btn-${props.size}`)
  return classes.join(' ')
})

const menuClass = computed(() => {
  const classes = ['dropdown-menu']
  if (props.menuEnd) classes.push('dropdown-menu-end')
  return classes.join(' ')
})
</script>

<template>
  <div :class="dropdownClass">
    <button
      :id="id"
      :class="[buttonClass, 'dropdown-toggle']"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      {{ text }}
    </button>
    <ul :class="menuClass" :aria-labelledby="id">
      <!-- Shorthand mode: generate from items array -->
      <template v-if="items && items.length > 0 && !slots.default">
        <VibeDropdownItem
          v-for="(item, index) in items"
          :key="index"
          :href="item.href"
          :to="item.to"
          :active="item.active"
          :disabled="item.disabled"
          :divider="item.divider"
          :header="item.header"
        >
          {{ item.text }}
        </VibeDropdownItem>
      </template>

      <!-- Slot mode: full control -->
      <slot v-else />
    </ul>
  </div>
</template>
