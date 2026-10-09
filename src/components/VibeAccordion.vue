<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstanceMap } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, onMounted, watch, nextTick, ref } from 'vue'
import type { AccordionItem, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { isDev } from '../composables/useEventBus'

interface BootstrapCollapse {
  show: () => void
  hide: () => void
  toggle: () => void
  dispose: () => void
}

const _generatedId = useId('accordion')

const props = defineProps({
  id: { type: String, default: undefined },
  flush: { type: Boolean, default: false },
  items: { type: Array as () => AccordionItem[], required: true },
  alwaysOpen: { type: Boolean, default: false }
})

const computedId = computed(() => props.id || _generatedId)

// #139: item.id is optional. Resolve a stable id per item (explicit id wins,
// otherwise derive one from the accordion id + index) for the panel id,
// data-bs-target, aria wiring, and collapse tracking.
const resolvedItems = computed(() =>
  props.items.map((item, index) => ({
    item,
    id: item.id || `${computedId.value}-panel-${index}`,
  }))
)

// CSS-special characters break Bootstrap's internal querySelector (e.g. #my.id).
const CSS_SPECIAL_CHARS = /[ .:#[\](){}+~>,|^$*?=]/

// DEV-only: warn for ids that will break Bootstrap's querySelector. Covers both the
// accordion container id and every item.id (used in data-bs-target / data-bs-parent).
const warnUnsafeIds = () => {
  if (!isDev()) return
  if (props.id && CSS_SPECIAL_CHARS.test(props.id)) {
    console.warn(`[VibeAccordion] id "${props.id}" contains CSS-special characters. Bootstrap's querySelector will fail. Use only alphanumeric characters, hyphens, and underscores.`)
  }
  for (const item of props.items) {
    if (item.id && CSS_SPECIAL_CHARS.test(item.id)) {
      console.warn(`[VibeAccordion] item.id "${item.id}" contains CSS-special characters. Bootstrap's querySelector will fail for this panel. Use only alphanumeric characters, hyphens, and underscores.`)
    }
  }
}
warnUnsafeIds()

const emit = defineEmits<{
  (e: 'item-click', payload: { item: AccordionItem; index: number }): void
  (e: 'show', id: string): void
  (e: 'shown', id: string): void
  (e: 'hide', id: string): void
  (e: 'hidden', id: string): void
  (e: 'component-error', error: ComponentError): void
}>()

// #147: type the title/content slots.
defineSlots<{
  title?: (props: { item: AccordionItem; index: number }) => unknown
  content?: (props: { item: AccordionItem; index: number }) => unknown
}>()

const accordionRef = useTemplateRef<HTMLElement>('accordionRef')

// Per-panel event identity: listeners attach directly to the panel, so the
// shared map handlers recover the entry id from the event target.
const idOf = (event: Event): string => (event.currentTarget as HTMLElement).id

// One Bootstrap Collapse per panel, owned by the shared keyed map (#247):
// lazy construction, per-element collapse listeners, dispose-all on teardown
// and on items change, unmount-race guards.
const collapseOwners = useBootstrapInstanceMap<BootstrapCollapse>({
  create: (el, bootstrap) =>
    new bootstrap.Collapse(el, {
      toggle: false,
      parent: props.alwaysOpen ? undefined : `#${computedId.value}`
    }) as unknown as BootstrapCollapse,
  disposeInstance: (collapse) => collapse.dispose(),
  events: {
    'show.bs.collapse': ((event: Event) => onShow(idOf(event))) as EventListener,
    'shown.bs.collapse': ((event: Event) => onShown(idOf(event))) as EventListener,
    'hide.bs.collapse': ((event: Event) => onHide(idOf(event))) as EventListener,
    'hidden.bs.collapse': ((event: Event) => onHidden(idOf(event))) as EventListener
  },
  componentName: 'VibeAccordion',
  onError: (error) => reportComponentError(emit, error)
})

// Live expanded state per entry id. Seeded from the prop so SSR and pre-JS
// paint agree with the announcement; flipped by the Bootstrap show/hide
// events after init (reactive Set membership is tracked in render).
const expandedIds = ref(new Set<string>())
for (const entry of resolvedItems.value) {
  if (entry.item.show) expandedIds.value.add(entry.id)
}

const onShow = (id: string) => {
  expandedIds.value.add(id)
  emit('show', id)
}
const onShown = (id: string) => emit('shown', id)
const onHide = (id: string) => {
  expandedIds.value.delete(id)
  emit('hide', id)
}
const onHidden = (id: string) => emit('hidden', id)

const initItems = async (): Promise<void> => {
  if (!accordionRef.value) return

  const collapseEls = accordionRef.value.querySelectorAll('.accordion-collapse')
  const seenIds = new Set<string>()
  for (const el of collapseEls) {
    const id = el.id
    if (seenIds.has(id)) {
      console.warn(`[VibeAccordion] Duplicate item.id "${id}" detected — only the first occurrence is initialised. Ensure each item has a unique id.`)
      continue
    }
    seenIds.add(id)
    // Only initialize untracked panels; ensure() reuses live entries.
    const htmlEl = el as HTMLElement
    const inst = await collapseOwners.ensure(htmlEl)

    // Check initial state from props (match on the resolved id).
    const entry = resolvedItems.value.find(e => e.id === id)
    if (entry?.item.show) {
      inst?.show()
    }
  }
}

onMounted(initItems)

watch([() => props.items, () => props.alwaysOpen], async () => {
  try {
    warnUnsafeIds()
    // Tear down every tracked panel, then rebuild after paint. disposeAll
    // detaches listeners plus disposes.
    collapseOwners.disposeAll()

    // Await both nextTick and initItems so errors surface instead of being silently dropped.
    // The previous nextTick(() => initItems()) discarded the inner Promise.
    await nextTick()
    await initItems()
  } catch (error) {
    reportComponentError(emit, {
      message: 'Error reinitialising accordion items.',
      componentName: 'VibeAccordion',
      originalError: error
    })
  }
}, { deep: false })

const handleItemClick = (item: AccordionItem, index: number) => {
  emit('item-click', { item, index })
}

// _unsafe_bsInstances is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on these directly WILL break this component.
// Keyed by panel element (previously by entry id); identity only, no lifecycle.
defineExpose({ refresh: initItems, _unsafe_bsInstances: collapseOwners.instances })
</script>

<template>
  <div ref="accordionRef" :id="computedId" :class="['accordion', { 'accordion-flush': flush }]">
    <div
      v-for="(entry, index) in resolvedItems"
      :key="entry.id"
      class="accordion-item"
    >
      <h2 class="accordion-header">
        <button
          :class="['accordion-button', { collapsed: !entry.item.show }]"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#${entry.id}`"
          :aria-expanded="expandedIds.has(entry.id)"
          :aria-controls="entry.id"
          @click="handleItemClick(entry.item, index)"
        >
          <slot name="title" :item="entry.item" :index="index">
            {{ entry.item.title }}
          </slot>
        </button>
      </h2>
      <div
        :id="entry.id"
        :class="['accordion-collapse', 'collapse', { show: expandedIds.has(entry.id) }]"
        :data-bs-parent="alwaysOpen ? undefined : `#${computedId}`"
      >
        <div class="accordion-body">
          <slot name="content" :item="entry.item" :index="index">
            {{ entry.item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
