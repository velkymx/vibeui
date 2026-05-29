<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { NavItem, DropdownItem, ComponentError } from '../types'

interface BootstrapDropdown {
  dispose: () => void
}

const props = defineProps({
  tag: { type: String, default: 'ul' },
  items: { type: Array as () => NavItem[], default: undefined }
})

const emit = defineEmits<{
  (e: 'item-click', payload: { item: NavItem; index: number; event: Event }): void
  (e: 'dropdown-item-click', payload: { item: NavItem; itemIndex: number; child: DropdownItem; childIndex: number; event: Event }): void
  (e: 'component-error', error: ComponentError): void
}>()

const navbarNavRef = ref<HTMLElement | null>(null)
const bsDropdowns = new Map<HTMLElement, BootstrapDropdown>()

const initDropdowns = async () => {
  if (!navbarNavRef.value) return
  try {
    const bootstrap = await import('bootstrap')
    const Dropdown = bootstrap.Dropdown
    const toggleEls = navbarNavRef.value.querySelectorAll<HTMLElement>('[data-bs-toggle="dropdown"]')
    toggleEls.forEach(el => {
      if (!bsDropdowns.has(el)) {
        bsDropdowns.set(el, new Dropdown(el) as BootstrapDropdown)
      }
    })
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Dropdowns will use data attributes only.',
      componentName: 'VibeNavbarNav',
      originalError: error
    })
  }
}

onMounted(initDropdowns)

onBeforeUnmount(() => {
  bsDropdowns.forEach(d => d.dispose())
  bsDropdowns.clear()
})

watch(() => props.items, async () => {
  bsDropdowns.forEach(d => d.dispose())
  bsDropdowns.clear()
  await nextTick()
  await initDropdowns()
}, { deep: true })

const getItemClass = (item: NavItem) => {
  const classes = ['nav-item']
  if (item.children?.length) classes.push('dropdown')
  return classes.join(' ')
}

const getLinkClass = (item: NavItem) => {
  const classes = ['nav-link']
  if (item.active) classes.push('active')
  if (item.disabled) classes.push('disabled')
  if (item.children?.length) classes.push('dropdown-toggle')
  return classes.join(' ')
}

const getItemTag = (item: NavItem) => {
  if (item.href) return 'a'
  if (item.to) return 'router-link'
  return 'button'
}

const getDropdownItemClass = (child: DropdownItem) => {
  const classes = ['dropdown-item']
  if (child.active) classes.push('active')
  if (child.disabled) classes.push('disabled')
  return classes.join(' ')
}

const handleItemClick = (item: NavItem, index: number, event: Event) => {
  if (!item.disabled) {
    emit('item-click', { item, index, event })
  }
}

const handleDropdownItemClick = (item: NavItem, itemIndex: number, child: DropdownItem, childIndex: number, event: Event) => {
  if (!child.disabled && !child.divider && !child.header) {
    emit('dropdown-item-click', { item, itemIndex, child, childIndex, event })
  }
}
</script>

<template>
  <component :is="tag" ref="navbarNavRef" class="navbar-nav">
    <!-- Data-driven mode: generate from items array -->
    <template v-if="items && items.length > 0">
      <li v-for="(item, index) in items" :key="item.href || item.text || String(index)" :class="getItemClass(item)">

        <!-- Dropdown item -->
        <template v-if="item.children?.length">
          <button
            type="button"
            :class="getLinkClass(item)"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <slot name="item" :item="item" :index="index">
              {{ item.text }}
            </slot>
          </button>
          <ul class="dropdown-menu">
            <template v-for="(child, childIndex) in item.children" :key="child.href || child.text || String(childIndex)">
              <li v-if="child.divider">
                <hr class="dropdown-divider">
              </li>
              <li v-else-if="child.header">
                <h6 class="dropdown-header">{{ child.text }}</h6>
              </li>
              <li v-else>
                <component
                  :is="child.href ? 'a' : child.to ? 'router-link' : 'button'"
                  :class="getDropdownItemClass(child)"
                  :href="child.href"
                  :to="child.to"
                  :type="!child.href && !child.to ? 'button' : undefined"
                  @click="handleDropdownItemClick(item, index, child, childIndex, $event)"
                >
                  <slot name="dropdown-item" :item="item" :child="child" :index="index" :child-index="childIndex">
                    {{ child.text }}
                  </slot>
                </component>
              </li>
            </template>
          </ul>
        </template>

        <!-- Regular nav-link -->
        <component
          v-else
          :is="getItemTag(item)"
          :class="getLinkClass(item)"
          :href="item.href || undefined"
          :to="item.to"
          :type="!item.href && !item.to ? 'button' : undefined"
          :aria-current="item.active ? 'page' : undefined"
          :aria-disabled="item.disabled"
          @click="handleItemClick(item, index, $event)"
        >
          <slot name="item" :item="item" :index="index">
            {{ item.text }}
          </slot>
        </component>

      </li>
    </template>

    <!-- Slot mode: for custom navbar content -->
    <slot v-else />
  </component>
</template>
