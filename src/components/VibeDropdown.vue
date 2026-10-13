<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, watch, onMounted } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import type { Variant, Size, Direction, DropdownItem, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { safeHref } from '../utils/safeHref'
import { linkBindings } from '../utils/linkBindings'
import { dropdownItemKey } from '../utils/dropdownItemKey'

interface BootstrapDropdown {
  show: () => void
  hide: () => void
  toggle: () => void
  update: () => void
  dispose: () => void
}

// Hoisted to setup so the id is owned by this instance and stable (see note in
// other Vibe components — useId() in a defineProps default factory is fragile).
const _generatedId = useId('dropdown')

const props = defineProps({
  id: { type: String, default: undefined },
  text: { type: String, default: 'Dropdown' },
  variant: { type: String as () => Variant, default: undefined },
  size: { type: String as () => Size, default: undefined },
  split: { type: Boolean, default: false },
  direction: { type: String as () => Direction, default: 'down' },
  menuEnd: { type: Boolean, default: false },
  items: { type: Array as () => DropdownItem[], required: true },
  autoClose: { type: [Boolean, String], default: true },
  showEmpty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No options' }
})
// #159: explicit prop wins, then the global default, then the builtin.
// Declared before every resolver that closes over it: a computed getter is
// lazy, so the old order happened to work, but it breaks the moment any
// resolver is evaluated eagerly (see #199).
const vibeDefaults = useVibeDefaults()

const resolvedSize = computed(() => resolveProp(props.size, vibeDefaults.size, undefined))

const resolvedVariant = computed(() => resolveProp(props.variant, vibeDefaults.variant, 'primary'))


const emit = defineEmits<{
  (e: 'item-click', payload: { item: DropdownItem; index: number; event: Event }): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

// #147: type the dropdown slots.
defineSlots<{
  button?: () => unknown
  header?: (props: { item: DropdownItem; index: number }) => unknown
  item?: (props: { item: DropdownItem; index: number }) => unknown
}>()

const computedId = computed(() => props.id || _generatedId)

const dropdownRef = useTemplateRef<HTMLElement>('dropdownRef')

const dropdownClass = computed(() => {
  if (props.direction === 'up') return 'dropup'
  if (props.direction === 'end') return 'dropend'
  if (props.direction === 'start') return 'dropstart'
  return 'dropdown'
})

const buttonClass = computed(() => {
  const classes = ['btn', `btn-${resolvedVariant.value}`]
  if (resolvedSize.value) classes.push(`btn-${resolvedSize.value}`)
  return classes.join(' ')
})

const menuClass = computed(() => {
  const classes = ['dropdown-menu']
  if (props.menuEnd) classes.push('dropdown-menu-end')
  return classes.join(' ')
})

const getItemClass = (item: DropdownItem): string => {
  const classes = ['dropdown-item']
  if (item.active) classes.push('active')
  if (item.disabled) classes.push('disabled')
  return classes.join(' ')
}

const onShow = () => emit('show')
const onShown = () => emit('shown')
const onHide = () => emit('hide')
const onHidden = () => emit('hidden')

// Instance lifecycle owned by the shared composable (#247). The Bootstrap
// instance attaches to the .dropdown-toggle child (queried at call time, so a
// re-rendered toggle resolves fresh); listeners ride the attached element.
const { init: initDropdown, instance: bsDropdown } = useBootstrapInstance<BootstrapDropdown>({
  resolveElement: () => dropdownRef.value?.querySelector('.dropdown-toggle') ?? null,
  create: (el, bootstrap) =>
    new bootstrap.Dropdown(el, {
      autoClose: props.autoClose
    }) as unknown as BootstrapDropdown,
  disposeInstance: (dropdown) => dropdown.dispose(),
  events: {
    'show.bs.dropdown': onShow as EventListener,
    'shown.bs.dropdown': onShown as EventListener,
    'hide.bs.dropdown': onHide as EventListener,
    'hidden.bs.dropdown': onHidden as EventListener
  },
  componentName: 'VibeDropdown',
  onError: (error) => reportComponentError(emit, error)
})

onMounted(initDropdown)

// Re-init when autoClose changes so the Bootstrap instance reflects the new config
watch(() => props.autoClose, () => {
  void initDropdown()
})

const handleItemClick = (item: DropdownItem, index: number, event: Event) => {
  if (!item.disabled && !item.divider && !item.header) {
    emit('item-click', { item, index, event })
  }
}

const show = () => bsDropdown.value?.show()
const hide = () => bsDropdown.value?.hide()
const toggle = () => bsDropdown.value?.toggle()

defineExpose({ show, hide, toggle })
</script>

<template>
  <div ref="dropdownRef" :class="dropdownClass">
    <button
      v-if="!split"
      :id="computedId"
      :class="[buttonClass, 'dropdown-toggle']"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :disabled="items.length === 0 || undefined"
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
        :id="computedId"
        type="button"
        :class="[buttonClass, 'dropdown-toggle', 'dropdown-toggle-split']"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :disabled="items.length === 0 || undefined"
        :data-bs-auto-close="autoClose"
      >
        <span class="visually-hidden">Toggle Dropdown</span>
      </button>
    </template>

    <ul :class="menuClass" :aria-labelledby="computedId">
      <li v-if="items.length === 0 && showEmpty" class="dropdown-item-text text-body-secondary">
        {{ emptyText }}
      </li>
      <template v-for="(item, index) in items" :key="dropdownItemKey(item, index, 'VibeDropdown')">
        <li v-if="item.divider"><hr class="dropdown-divider"></li>
        <li v-else-if="item.header">
          <h6 class="dropdown-header">
            <slot name="header" :item="item" :index="index">{{ item.text }}</slot>
          </h6>
        </li>
        <li v-else>
          <component
            :is="safeHref(item.href) ? 'a' : item.to ? 'router-link' : 'button'"
            :class="getItemClass(item)"
            v-bind="linkBindings(safeHref(item.href), item.to)"
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
