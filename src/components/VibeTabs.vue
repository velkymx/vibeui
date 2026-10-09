<script setup lang="ts">
import { computed, nextTick, provide, reactive, ref, useTemplateRef, watch, type PropType } from 'vue'
import { TABS_CONTEXT_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'

type TabsVariant = 'tabs' | 'pills' | 'underline'

interface TabRecord {
  name: string
  label: string
  disabled: boolean
}

const props = defineProps({
  modelValue: { type: String, default: undefined },
  variant: { type: String as PropType<TabsVariant>, default: 'tabs' },
  fill: { type: Boolean, default: false },
  justified: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  lazy: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'update:modelValue', name: string): void
  (e: 'change', name: string): void
}>()

const registry = reactive<TabRecord[]>([])
const internalActive = ref<string | undefined>(props.modelValue)
const visited = reactive(new Set<string>())
// Strip-unique prefix for tab/panel ids: names are unique within a strip but
// two strips can share names, so bare name-derived ids would collide.
const stripId = useId('tabs')
const tabId = (name: string): string => `vibe-tab-${stripId}-${name}`
const panelId = (name: string): string => `vibe-panel-${stripId}-${name}`
// Seed the initially-active tab (set via v-model at mount) so `lazy` renders it
// immediately — otherwise it's never marked visited until the tab is switched.
if (props.modelValue !== undefined) visited.add(props.modelValue)

const activeName = computed(() => internalActive.value)

watch(
  () => props.modelValue,
  (val) => {
    if (val === undefined) {
      // Explicit deselection from parent — clear internalActive
      internalActive.value = undefined
    } else if (val !== internalActive.value) {
      internalActive.value = val
      visited.add(val)
    }
  }
)

const setActive = (name: string) => {
  if (internalActive.value === name) return
  internalActive.value = name
  visited.add(name)
  emit('update:modelValue', name)
  emit('change', name)
}

const tablistRef = useTemplateRef<HTMLElement>('tablistRef')

// APG tabs keyboard model: arrows move within the strip (roving tabindex),
// Home/End jump. Click and keyboard share setActive so activation, visited
// tracking, and emits behave identically. Vertical strips use Up/Down.
const onTabKeydown = (event: KeyboardEvent, name: string): void => {
  const order = registry.filter(t => !t.disabled).map(t => t.name)
  const at = order.indexOf(name)
  if (at === -1) return
  const forward = props.vertical ? 'ArrowDown' : 'ArrowRight'
  const backward = props.vertical ? 'ArrowUp' : 'ArrowLeft'
  let next: string | null = null
  if (event.key === forward) next = order[(at + 1) % order.length] ?? null
  else if (event.key === backward) next = order[(at - 1 + order.length) % order.length] ?? null
  else if (event.key === 'Home') next = order[0] ?? null
  else if (event.key === 'End') next = order[order.length - 1] ?? null
  if (!next) return
  event.preventDefault()
  setActive(next)
  // Roving tabindex moves focus with activation (automatic activation, like click).
  // Index into the FULL strip: `order` skips disabled tabs, but the DOM
  // querySelectorAll does not, so an order index would land on the wrong
  // button whenever a disabled tab precedes the destination.
  const target = registry.findIndex(t => t.name === next)
  nextTick(() => {
    const el = tablistRef.value?.querySelectorAll('[role="tab"]')?.[target] as HTMLElement | undefined
    el?.focus()
  })
}

const navClass = computed(() => {
  const c = ['nav']
  if (props.variant === 'tabs') c.push('nav-tabs')
  else if (props.variant === 'pills') c.push('nav-pills')
  else if (props.variant === 'underline') c.push('nav-underline')
  if (props.fill) c.push('nav-fill')
  if (props.justified) c.push('nav-justified')
  if (props.vertical) c.push('flex-column')
  return c.join(' ')
})

const containerClass = computed(() => (props.vertical ? 'd-flex' : ''))

provide(TABS_CONTEXT_KEY, {
  register: (name: string, label: string, disabled: boolean) => {
    if (registry.find(t => t.name === name)) return
    registry.push({ name, label, disabled })
    if (internalActive.value === undefined && !disabled) {
      internalActive.value = name
      visited.add(name)
      // Wrap in nextTick to avoid emitting during child onMounted (mid-parent-render-cycle)
      nextTick(() => emit('update:modelValue', name))
    }
  },
  unregister: (name: string) => {
    const wasActive = internalActive.value === name
    // Filter by reference instead of splice-by-index to be safe for concurrent unmounts
    const newRegistry = registry.filter(r => r.name !== name)
    registry.splice(0, registry.length, ...newRegistry)
    // Clear visited so a remounted tab with lazy:true doesn't render immediately —
    // it must be re-activated first. Without this, hasBeenActive stays true forever.
    visited.delete(name)
    if (wasActive) {
      const next = registry.find(t => !t.disabled)
      const nextName = next?.name
      internalActive.value = nextName
      if (nextName !== undefined) {
        visited.add(nextName)
        emit('update:modelValue', nextName)
        emit('change', nextName)
      }
    }
  },
  isActive: (name: string) => internalActive.value === name,
  hasBeenActive: (name: string) => visited.has(name),
  tabId,
  panelId,
  // Sync a tab whose props changed after mount (label/disabled/name). Mutates
  // the existing entry in place so strip order is preserved; renames move the
  // active/visited markers so no ghost entry is left behind.
  update: (prevName: string, name: string, label: string, disabled: boolean) => {
    const existing = registry.find(t => t.name === prevName)
    if (existing) {
      existing.name = name
      existing.label = label
      existing.disabled = disabled
      if (internalActive.value === prevName) internalActive.value = name
      if (visited.has(prevName)) {
        visited.delete(prevName)
        visited.add(name)
      }
    } else {
      if (!registry.find(t => t.name === name)) {
        registry.push({ name, label, disabled })
      }
    }
  },
  // Reading via getter so child VibeTab re-evaluates when props.lazy changes.
  get lazy() { return props.lazy }
})
</script>

<template>
  <div :class="['vibe-tabs', containerClass]">
    <ul :class="navClass" role="tablist" ref="tablistRef">
      <li
        v-for="tab in registry"
        :key="tab.name"
        class="nav-item"
        role="presentation"
      >
        <button
          type="button"
          class="nav-link"
          :class="{ active: tab.name === activeName, disabled: tab.disabled }"
          :disabled="tab.disabled"
          :tabindex="tab.name === activeName ? 0 : -1"
          :id="tabId(tab.name)"
          :aria-controls="panelId(tab.name)"
          :aria-selected="tab.name === activeName"
          role="tab"
          @click="setActive(tab.name)"
          @keydown="onTabKeydown($event, tab.name)"
        >
          {{ tab.label }}
        </button>
      </li>
    </ul>
    <div class="tab-content" :class="{ 'flex-grow-1 ms-3': vertical }">
      <slot />
    </div>
  </div>
</template>
