<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import type { Variant, Size, Direction, DropdownItem } from '../types'
import { useId } from '../composables/useId'

interface BootstrapDropdown {
  show: () => void
  hide: () => void
  toggle: () => void
  update: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('dropdown') },
  text: { type: String, default: 'Dropdown' },
  variant: { type: String as () => Variant, default: 'primary' },
  size: { type: String as () => Size, default: undefined },
  split: { type: Boolean, default: false },
  direction: { type: String as () => Direction, default: 'down' },
  menuEnd: { type: Boolean, default: false },
  items: { type: Array as () => DropdownItem[], required: true },
  autoClose: { type: [Boolean, String], default: true }
})

const emit = defineEmits(['item-click', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const dropdownRef = ref<HTMLElement | null>(null)
const bsDropdown = ref<BootstrapDropdown | null>(null)

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

const onShow = () => emit('show')
const onShown = () => emit('shown')
const onHide = () => emit('hide')
const onHidden = () => emit('hidden')

onMounted(async () => {
  if (!dropdownRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const Dropdown = bootstrap.Dropdown
    
    const toggleEl = dropdownRef.value.querySelector('.dropdown-toggle') as HTMLElement
    if (toggleEl) {
      bsDropdown.value = new Dropdown(toggleEl, {
        autoClose: props.autoClose
      }) as BootstrapDropdown

      toggleEl.addEventListener('show.bs.dropdown', onShow)
      toggleEl.addEventListener('shown.bs.dropdown', onShown)
      toggleEl.addEventListener('hide.bs.dropdown', onHide)
      toggleEl.addEventListener('hidden.bs.dropdown', onHidden)
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Dropdown will use data attributes only.',
      componentName: 'VibeDropdown',
      originalError: error
    })
  }
})

onBeforeUnmount(() => {
  const toggleEl = dropdownRef.value?.querySelector('.dropdown-toggle') as HTMLElement
  if (toggleEl) {
    toggleEl.removeEventListener('show.bs.dropdown', onShow)
    toggleEl.removeEventListener('shown.bs.dropdown', onShown)
    toggleEl.removeEventListener('hide.bs.dropdown', onHide)
    toggleEl.removeEventListener('hidden.bs.dropdown', onHidden)
  }

  if (bsDropdown.value) {
    bsDropdown.value.dispose()
    bsDropdown.value = null
  }
})

const handleItemClick = (item: DropdownItem, index: number, event: Event) => {
  if (!item.disabled && !item.divider && !item.header) {
    emit('item-click', { item, index, event })
  }
}

// Programmatic control
const show = () => bsDropdown.value?.show()
const hide = () => bsDropdown.value?.hide()
const toggle = () => bsDropdown.value?.toggle()

defineExpose({ show, hide, toggle })
</script>

<template>
  <div ref="dropdownRef" :class="dropdownClass">
    <button
      v-if="!split"
      :id="id"
      :class="[buttonClass, 'dropdown-toggle']"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :data-bs-auto-close="autoClose"
    >
      <slot name="button">{{ text }}</slot>
    </button>
    
    <!-- Split button layout -->
    <template v-else>
      <button
        :class="buttonClass"
        type="button"
      >
        <slot name="button">{{ text }}</slot>
      </button>
      <button
        :id="id"
        type="button"
        :class="[buttonClass, 'dropdown-toggle', 'dropdown-toggle-split']"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :data-bs-auto-close="autoClose"
      >
        <span class="visually-hidden">Toggle Dropdown</span>
      </button>
    </template>

    <ul :class="menuClass" :aria-labelledby="id">
      <template v-for="(item, index) in items" :key="index">
        <li v-if="item.divider"><hr class="dropdown-divider"></li>
        <li v-else-if="item.header">
          <h6 class="dropdown-header">
            <slot name="header" :item="item" :index="index">{{ item.text }}</slot>
          </h6>
        </li>
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
            <slot name="item" :item="item" :index="index">{{ item.text }}</slot>
          </component>
        </li>
      </template>
    </ul>
  </div>
</template>
