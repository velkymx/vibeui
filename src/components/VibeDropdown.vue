<script setup lang="ts">
import { computed } from 'vue'
import type { Variant, Size, Direction, DropdownItem } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  text: { type: String, default: 'Dropdown' },
  variant: { type: String as () => Variant, default: 'primary' },
  size: { type: String as () => Size, default: undefined },
  split: { type: Boolean, default: false },
  direction: { type: String as () => Direction, default: 'down' },
  menuEnd: { type: Boolean, default: false },
  items: { type: Array as () => DropdownItem[], required: true }
})

const emit = defineEmits(['item-click', 'component-error'])

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

const getItemClass = (item: DropdownItem) => {
  const classes = ['dropdown-item']
  if (item.active) classes.push('active')
  if (item.disabled) classes.push('disabled')
  return classes.join(' ')
}

const handleItemClick = (item: DropdownItem, index: number, event: Event) => {
  if (!item.disabled && !item.divider && !item.header) {
    emit('item-click', { item, index, event })
  }
}
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
      <!-- Slot for custom button content -->
      <slot name="button">{{ text }}</slot>
    </button>
    <ul :class="menuClass" :aria-labelledby="id">
      <template v-for="(item, index) in items" :key="index">
        <!-- Divider -->
        <li v-if="item.divider">
          <hr class="dropdown-divider">
        </li>

        <!-- Header -->
        <li v-else-if="item.header">
          <h6 class="dropdown-header">
            <slot name="header" :item="item" :index="index">
              {{ item.text }}
            </slot>
          </h6>
        </li>

        <!-- Regular item -->
        <li v-else>
          <component
            :is="item.href ? 'a' : item.to ? 'router-link' : 'button'"
            :class="getItemClass(item)"
            :href="item.href"
            :to="item.to"
            :type="!item.href && !item.to ? 'button' : undefined"
            :disabled="item.disabled"
            @click="handleItemClick(item, index, $event)"
          >
            <!-- Scoped slot for custom item rendering -->
            <slot name="item" :item="item" :index="index">
              {{ item.text }}
            </slot>
          </component>
        </li>
      </template>
    </ul>
  </div>
</template>
