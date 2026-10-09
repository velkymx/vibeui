<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstanceMap } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, onMounted, watch, nextTick } from 'vue'
import type { NavItem, ComponentError } from '../types'
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'
import { routeKey } from '../utils/routeKey'
import { dropdownItemKey } from '../utils/dropdownItemKey'

interface BootstrapTab {
  show: () => void
  dispose: () => void
}

const props = defineProps({
  items: { type: Array as () => NavItem[], required: true },
  pills: { type: Boolean, default: false },
  tabs: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  justified: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
  underline: { type: Boolean, default: false },
  tag: { type: String, default: 'ul' },
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No items' }
})

const emit = defineEmits<{
  (e: 'item-click', payload: { item: NavItem; index: number; event: Event }): void
  (e: 'show', event: Event): void
  (e: 'shown', event: Event): void
  (e: 'hide', event: Event): void
  (e: 'hidden', event: Event): void
  (e: 'component-error', error: ComponentError): void
}>()

// #147: type the item slot.
defineSlots<{
  item?: (props: { item: NavItem; index: number }) => unknown
}>()

const navRef = useTemplateRef<HTMLElement>('navRef')

const navClass = computed(() => {
  const classes = ['nav']
  if (props.pills) classes.push('nav-pills')
  if (props.tabs) classes.push('nav-tabs')
  if (props.vertical) classes.push('flex-column')
  if (props.justified) classes.push('nav-justified')
  if (props.fill) classes.push('nav-fill')
  if (props.underline) classes.push('nav-underline')
  return classes.join(' ')
})

const onShow = (event: Event) => emit('show', event)
const onShown = (event: Event) => emit('shown', event)
const onHide = (event: Event) => emit('hide', event)
const onHidden = (event: Event) => emit('hidden', event)

// One Bootstrap Tab per trigger element, owned by the shared keyed map (#247):
// lazy construction, per-element tab listeners, dispose-all on teardown and
// on items change, unmount-race guards. The escape-hatch expose reads the
// live instances map.
const tabOwners = useBootstrapInstanceMap<BootstrapTab>({
  create: (el, bootstrap) => new bootstrap.Tab(el) as unknown as BootstrapTab,
  disposeInstance: (tab) => tab.dispose(),
  events: {
    'show.bs.tab': onShow as EventListener,
    'shown.bs.tab': onShown as EventListener,
    'hide.bs.tab': onHide as EventListener,
    'hidden.bs.tab': onHidden as EventListener
  },
  componentName: 'VibeNav',
  onError: (error) => reportComponentError(emit, error)
})

const initTabs = async (): Promise<void> => {
  if (!navRef.value) return
  const tabTriggerEls = navRef.value.querySelectorAll<HTMLElement>(
    '[data-bs-toggle="tab"], [data-bs-toggle="pill"]'
  )
  // Only initialize untracked triggers; ensure() reuses live entries.
  for (const el of tabTriggerEls) {
    if (!tabOwners.has(el)) void tabOwners.ensure(el)
  }
}

onMounted(initTabs)

// Watch for items changes to re-initialize tabs
watch(() => props.items, async () => {
  tabOwners.disposeAll()
  await nextTick()
  await initTabs()
}, { deep: false })

const getTabTarget = (item: NavItem): string | undefined => {
  if (item.href?.startsWith('#')) return item.href
  if (item.target) return item.target
  if (typeof item.to === 'string') {
    const idx = item.to.indexOf('#')
    if (idx !== -1) return item.to.slice(idx)
  }
  return undefined
}

const handleItemClick = (item: NavItem, index: number, event: Event) => {
  if (!item.disabled) {
    emit('item-click', { item, index, event })
  }
}

const refresh = async () => {
  tabOwners.disposeAll()
  await nextTick()
  await initTabs()
}

// _unsafe_bsInstances is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on these directly WILL break this component.
defineExpose({ refresh, _unsafe_bsInstances: tabOwners.instances })
</script>

<template>
  <component :is="tag" ref="navRef" :class="navClass">
    <li v-if="items.length === 0 && showEmpty" class="nav-item disabled">{{ emptyText }}</li>
    <li
      v-for="(item, index) in items"
      :key="item.href || routeKey(item.to) || item.text || String(index)"
      class="nav-item"
      :class="{ dropdown: item.children && item.children.length > 0 }"
    >
      <template v-if="item.children && item.children.length > 0">
        <button
          type="button"
          class="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          :class="{ active: item.active, disabled: item.disabled }"
        >
          {{ item.text }}
        </button>
        <ul class="dropdown-menu">
          <li v-for="(child, childIndex) in item.children" :key="dropdownItemKey(child, childIndex, 'VibeNav')">
            <template v-if="child.divider">
              <hr class="dropdown-divider">
            </template>
            <template v-else-if="child.header">
              <h6 class="dropdown-header">{{ child.text }}</h6>
            </template>
            <template v-else>
              <component
                :is="safeHref(child.href) ? 'a' : child.to ? 'router-link' : 'button'"
                class="dropdown-item"
                :class="{ active: child.active, disabled: child.disabled }"
                v-bind="linkBindings(safeHref(child.href), child.to)"
                :type="!child.href && !child.to ? 'button' : undefined"
              >
                {{ child.text }}
              </component>
            </template>
          </li>
        </ul>
      </template>
      <template v-else>
        <component
          :is="safeHref(item.href) ? 'a' : item.to ? 'router-link' : 'button'"
          class="nav-link"
          :class="{ active: item.active, disabled: item.disabled }"
          v-bind="linkBindings(safeHref(item.href), item.to)"
          :type="!item.href && !item.to ? 'button' : undefined"
          :disabled="(!item.href && !item.to && item.disabled) || undefined"
          :aria-current="item.active ? 'page' : undefined"
          :data-bs-toggle="(tabs || pills) && getTabTarget(item) ? (tabs ? 'tab' : 'pill') : undefined"
          :data-bs-target="getTabTarget(item)"
          @click="handleItemClick(item, index, $event)"
        >
          <slot name="item" :item="item" :index="index">{{ item.text }}</slot>
        </component>
      </template>
    </li>
  </component>
</template>
