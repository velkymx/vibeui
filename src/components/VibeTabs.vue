<script setup lang="ts">
import { computed, provide, reactive, ref, watch, type PropType } from 'vue'

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

const activeName = computed(() => internalActive.value)

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== internalActive.value) {
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

provide('vibeTabsContext', {
  register: (name: string, label: string, disabled: boolean) => {
    if (registry.find(t => t.name === name)) return
    registry.push({ name, label, disabled })
    if (internalActive.value === undefined && !disabled) {
      internalActive.value = name
      visited.add(name)
      emit('update:modelValue', name)
    }
  },
  unregister: (name: string) => {
    const idx = registry.findIndex(t => t.name === name)
    if (idx >= 0) registry.splice(idx, 1)
  },
  isActive: (name: string) => internalActive.value === name,
  hasBeenActive: (name: string) => visited.has(name),
  // Reading via getter so child VibeTab re-evaluates when props.lazy changes.
  get lazy() { return props.lazy }
})
</script>

<template>
  <div :class="['vibe-tabs', containerClass]">
    <ul :class="navClass" role="tablist">
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
          :aria-selected="tab.name === activeName"
          role="tab"
          @click="setActive(tab.name)"
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
