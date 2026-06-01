<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { NavItem } from '../types'

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
  tag: { type: String, default: 'ul' }
})

const emit = defineEmits(['item-click', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const navRef = ref<HTMLElement | null>(null)
const bsTabs = new Map<HTMLElement, BootstrapTab>()

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

const onShow = (event: any) => emit('show', event)
const onShown = (event: any) => emit('shown', event)
const onHide = (event: any) => emit('hide', event)
const onHidden = (event: any) => emit('hidden', event)

const initTabs = async () => {
  if (!navRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const Tab = bootstrap.Tab

    const tabTriggerEls = navRef.value.querySelectorAll('[data-bs-toggle="tab"], [data-bs-toggle="pill"]')
    tabTriggerEls.forEach((el) => {
      const htmlEl = el as HTMLElement
      // Only initialize if not already tracked
      if (!bsTabs.has(htmlEl)) {
        const bsTab = new Tab(htmlEl) as BootstrapTab
        bsTabs.set(htmlEl, bsTab)

        htmlEl.addEventListener('show.bs.tab', onShow)
        htmlEl.addEventListener('shown.bs.tab', onShown)
        htmlEl.addEventListener('hide.bs.tab', onHide)
        htmlEl.addEventListener('hidden.bs.tab', onHidden)
      }
    })
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Nav will use basic Vue logic.',
      componentName: 'VibeNav',
      originalError: error
    })
  }
}

onMounted(initTabs)

onBeforeUnmount(() => {
  bsTabs.forEach((bsTab, el) => {
    el.removeEventListener('show.bs.tab', onShow)
    el.removeEventListener('shown.bs.tab', onShown)
    el.removeEventListener('hide.bs.tab', onHide)
    el.removeEventListener('hidden.bs.tab', onHidden)
    bsTab.dispose()
  })
  bsTabs.clear()
})

// Watch for items changes to re-initialize tabs
watch(() => props.items, async () => {
  await nextTick()
  await initTabs()
}, { deep: true })

const handleItemClick = (item: NavItem, index: number, event: Event) => {
  if (!item.disabled) {
    emit('item-click', { item, index, event })
  }
}

defineExpose({ bsInstances: bsTabs, refresh: initTabs })
</script>

<template>
  <component :is="tag" ref="navRef" :class="navClass">
    <li
      v-for="(item, index) in items"
      :key="index"
      class="nav-item"
      :class="{ dropdown: item.children && item.children.length > 0 }"
    >
      <template v-if="item.children && item.children.length > 0">
        <a
          class="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          href="#"
          role="button"
          aria-expanded="false"
          :class="{ active: item.active, disabled: item.disabled }"
        >
          {{ item.text }}
        </a>
        <ul class="dropdown-menu">
          <li v-for="(child, childIndex) in item.children" :key="childIndex">
            <template v-if="child.divider">
              <hr class="dropdown-divider">
            </template>
            <template v-else-if="child.header">
              <h6 class="dropdown-header">{{ child.text }}</h6>
            </template>
            <template v-else>
              <component
                :is="child.href ? 'a' : child.to ? 'router-link' : 'button'"
                class="dropdown-item"
                :class="{ active: child.active, disabled: child.disabled }"
                :href="child.href"
                :to="child.to"
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
          :is="item.href ? 'a' : item.to ? 'router-link' : 'button'"
          class="nav-link"
          :class="{ active: item.active, disabled: item.disabled }"
          :href="item.href"
          :to="item.to"
          :type="!item.href && !item.to ? 'button' : undefined"
          :aria-current="item.active ? 'page' : undefined"
          :data-bs-toggle="(tabs || pills) && (item.href && item.href.startsWith('#')) ? (tabs ? 'tab' : 'pill') : undefined"
          :data-bs-target="item.href && item.href.startsWith('#') ? item.href : undefined"
          @click="handleItemClick(item, index, $event)"
        >
          {{ item.text }}
        </component>
      </template>
    </li>
  </component>
</template>
