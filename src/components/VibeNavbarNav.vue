<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstanceMap } from '../composables/useBootstrapInstance'
import { computed, useTemplateRef, watch, onMounted, nextTick } from 'vue'
import type { NavItem, DropdownItem, ComponentError } from '../types'
import { linkBindings } from '../utils/linkBindings'
import { safeHref } from '../utils/safeHref'
import { dropdownItemKey } from '../utils/dropdownItemKey'

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

// #147: type item slots.
defineSlots<{
  item?: (props: { item: NavItem; index: number }) => unknown
  'dropdown-item'?: (props: { item: NavItem; child: DropdownItem; index: number; childIndex: number }) => unknown
  default?: () => unknown
}>()

const navbarNavRef = useTemplateRef<HTMLElement>('navbarNavRef')

// One Bootstrap Dropdown per toggle element, owned by the shared keyed map
// (#247). No listeners to manage; unmount-race guards plus dispose-all on
// teardown and on items change come from the map.
const dropdownOwners = useBootstrapInstanceMap<BootstrapDropdown>({
  create: (el, bootstrap) => new bootstrap.Dropdown(el) as unknown as BootstrapDropdown,
  disposeInstance: (dropdown) => dropdown.dispose(),
  componentName: 'VibeNavbarNav',
  onError: (error) => reportComponentError(emit, error)
})

const initDropdowns = async (): Promise<void> => {
  if (!navbarNavRef.value) return
  const toggleEls = navbarNavRef.value.querySelectorAll<HTMLElement>('[data-bs-toggle="dropdown"]')
  for (const el of toggleEls) {
    if (!dropdownOwners.has(el)) void dropdownOwners.ensure(el)
  }
}

onMounted(initDropdowns)

// deep: false — dropdown presence depends on items array identity, not leaf values.
// Replacing the items array (the data-driven update pattern) changes identity and
// triggers a rebuild; deep traversal only added cost for leaf mutations that do not
// affect dropdown structure.
watch(() => props.items, async () => {
  dropdownOwners.disposeAll()
  await nextTick()
  await initDropdowns()
}, { deep: false })

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

// An href that fails sanitizing is dropped entirely rather than rendered as a dead
// anchor, so the item falls through to `to` or to a plain button.
const getItemTag = (item: NavItem | DropdownItem) => {
  if (safeHref(item.href)) return 'a'
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

// Per-item render data, computed once per items change instead of re-running
// tag/class/link resolution on every render (see #198). Dropdown children are
// included so nested rows resolve from the same maps.
const linkMeta = computed(() => {
  const itemCls = new Map<NavItem, string>()
  const linkCls = new Map<NavItem, string>()
  const tag = new Map<NavItem | DropdownItem, string>()
  const links = new Map<NavItem | DropdownItem, Record<string, unknown>>()
  const dropCls = new Map<DropdownItem, string>()
  for (const item of props.items ?? []) {
    itemCls.set(item, getItemClass(item))
    linkCls.set(item, getLinkClass(item))
    tag.set(item, getItemTag(item))
    links.set(item, linkBindings(safeHref(item.href), item.to))
    for (const child of item.children ?? []) {
      tag.set(child, getItemTag(child))
      dropCls.set(child, getDropdownItemClass(child))
      links.set(child, linkBindings(safeHref(child.href), child.to))
    }
  }
  return { itemCls, linkCls, tag, links, dropCls }
})
</script>

<template>
  <component :is="tag" ref="navbarNavRef" class="navbar-nav">
    <!-- Data-driven mode: generate from items array -->
    <template v-if="items && items.length > 0">
      <li v-for="(item, index) in items" :key="dropdownItemKey(item, index, 'VibeNavbarNav')" :class="linkMeta.itemCls.get(item)">

        <!-- Dropdown item -->
        <template v-if="item.children?.length">
          <button
            type="button"
            :class="linkMeta.linkCls.get(item)"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <slot name="item" :item="item" :index="index">
              {{ item.text }}
            </slot>
          </button>
          <ul class="dropdown-menu">
            <template v-for="(child, childIndex) in item.children" :key="dropdownItemKey(child, childIndex, 'VibeNavbarNav')">
              <li v-if="child.divider">
                <hr class="dropdown-divider">
              </li>
              <li v-else-if="child.header">
                <h6 class="dropdown-header">{{ child.text }}</h6>
              </li>
              <li v-else>
                <component
                  :is="linkMeta.tag.get(child)"
                  :class="linkMeta.dropCls.get(child)"
                  v-bind="linkMeta.links.get(child)"
                  :type="linkMeta.tag.get(child) === 'button' ? 'button' : undefined"
                  @click="handleDropdownItemClick(item, index, child, childIndex, $event)"
                >
                  <slot name="dropdown-item" :item="item" :child="child" :index="index" :childIndex="childIndex">
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
          :is="linkMeta.tag.get(item)"
          :class="linkMeta.linkCls.get(item)"
          v-bind="linkMeta.links.get(item)"
          :type="linkMeta.tag.get(item) === 'button' ? 'button' : undefined"
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
