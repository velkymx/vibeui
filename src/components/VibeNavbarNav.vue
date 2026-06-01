<script setup lang="ts">
import type { NavItem, DropdownItem } from '../types'

const props = defineProps({
  tag: { type: String, default: 'ul' },
  items: { type: Array as () => NavItem[], default: undefined }
})

const emit = defineEmits(['item-click', 'dropdown-item-click', 'component-error'])

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
  return 'a'
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
  <component :is="tag" class="navbar-nav">
    <!-- Data-driven mode: generate from items array -->
    <template v-if="items && items.length > 0">
      <li v-for="(item, index) in items" :key="index" :class="getItemClass(item)">

        <!-- Dropdown item -->
        <template v-if="item.children?.length">
          <a
            :class="getLinkClass(item)"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <slot name="item" :item="item" :index="index">
              {{ item.text }}
            </slot>
          </a>
          <ul class="dropdown-menu">
            <template v-for="(child, childIndex) in item.children" :key="childIndex">
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
          :href="item.href"
          :to="item.to"
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
