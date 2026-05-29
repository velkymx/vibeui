<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { AccordionItem, ComponentError } from '../types'
import { useId } from '../composables/useId'

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

if (import.meta.env.DEV && props.id && /[ .:#[\](){}+~>,|^$*?=]/.test(props.id)) {
  console.warn(`[VibeAccordion] id "${props.id}" contains CSS-special characters. Bootstrap's querySelector will fail. Use only alphanumeric characters, hyphens, and underscores.`)
}

const emit = defineEmits<{
  (e: 'item-click', payload: { item: AccordionItem; index: number }): void
  (e: 'show', id: string): void
  (e: 'shown', id: string): void
  (e: 'hide', id: string): void
  (e: 'hidden', id: string): void
  (e: 'component-error', error: ComponentError): void
}>()

const accordionRef = ref<HTMLElement | null>(null)
const bsCollapses = new Map<string, BootstrapCollapse>()
const collapseElements = new Map<string, HTMLElement>()
let initInFlight = false
let pendingReinit = false

interface CollapseHandlers {
  show: EventListener
  shown: EventListener
  hide: EventListener
  hidden: EventListener
}
const collapseHandlers = new Map<string, CollapseHandlers>()

const onShow = (id: string) => emit('show', id)
const onShown = (id: string) => emit('shown', id)
const onHide = (id: string) => emit('hide', id)
const onHidden = (id: string) => emit('hidden', id)

const disposeItem = (id: string) => {
  const el = collapseElements.get(id)
  const h = collapseHandlers.get(id)
  if (el && h) {
    el.removeEventListener('show.bs.collapse', h.show)
    el.removeEventListener('shown.bs.collapse', h.shown)
    el.removeEventListener('hide.bs.collapse', h.hide)
    el.removeEventListener('hidden.bs.collapse', h.hidden)
  }
  collapseElements.delete(id)
  collapseHandlers.delete(id)
  bsCollapses.get(id)?.dispose()
  bsCollapses.delete(id)
}

const initItems = async () => {
  if (!accordionRef.value) return
  if (initInFlight) {
    pendingReinit = true
    return
  }
  initInFlight = true
  pendingReinit = false

  try {
    const bootstrap = await import('bootstrap')
    const Collapse = bootstrap.Collapse

    const collapseEls = accordionRef.value.querySelectorAll('.accordion-collapse')
    collapseEls.forEach((el) => {
      const id = el.id
      // Only initialize if not already tracked
      if (!bsCollapses.has(id)) {
        const htmlEl = el as HTMLElement
        collapseElements.set(id, htmlEl)
        const bsCollapse = new Collapse(htmlEl, {
          toggle: false,
          parent: props.alwaysOpen ? undefined : `#${computedId.value}`
        }) as BootstrapCollapse

        bsCollapses.set(id, bsCollapse)

        const handlers: CollapseHandlers = {
          show: () => onShow(id),
          shown: () => onShown(id),
          hide: () => onHide(id),
          hidden: () => onHidden(id)
        }
        collapseHandlers.set(id, handlers)

        el.addEventListener('show.bs.collapse', handlers.show)
        el.addEventListener('shown.bs.collapse', handlers.shown)
        el.addEventListener('hide.bs.collapse', handlers.hide)
        el.addEventListener('hidden.bs.collapse', handlers.hidden)

        // Check initial state from props
        const item = props.items.find(i => i.id === id)
        if (item?.show) {
          bsCollapse.show()
        }
      }
    })
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Accordion will use data attributes only.',
      componentName: 'VibeAccordion',
      originalError: error
    })
  } finally {
    initInFlight = false
    if (pendingReinit) {
      pendingReinit = false
      void initItems()
    }
  }
}

onMounted(initItems)

onBeforeUnmount(() => {
  bsCollapses.forEach((_, id) => disposeItem(id))
})

watch([() => props.items, () => props.alwaysOpen], async () => {
  // Snapshot keys first — disposeItem mutates bsCollapses/collapseElements/collapseHandlers
  // internally via .delete(). Iterating the live Map during mutation is safe per spec but
  // produces confusing dead .clear() calls after; snapshot makes the intent explicit.
  const ids = [...bsCollapses.keys()]
  for (const id of ids) {
    disposeItem(id)
  }
  // All Maps are empty after the loop (disposeItem calls .delete() on each).
  // These clears are retained as defensive guards against any future partial dispose paths.
  bsCollapses.clear()
  collapseElements.clear()

  // Await both nextTick and initItems so errors surface instead of being silently dropped.
  // The previous nextTick(() => initItems()) discarded the inner Promise.
  await nextTick()
  await initItems()
}, { deep: false })

const handleItemClick = (item: AccordionItem, index: number) => {
  emit('item-click', { item, index })
}

// _unsafe_bsInstances is an escape hatch, NOT part of the stable API.
// Calling dispose()/other lifecycle methods on these directly WILL break this component.
defineExpose({ refresh: initItems, _unsafe_bsInstances: bsCollapses })
</script>

<template>
  <div ref="accordionRef" :id="computedId" :class="['accordion', { 'accordion-flush': flush }]">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="accordion-item"
    >
      <h2 class="accordion-header">
        <button
          :class="['accordion-button', { collapsed: !item.show }]"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#${item.id}`"
          :aria-expanded="item.show"
          :aria-controls="item.id"
          @click="handleItemClick(item, index)"
        >
          <slot name="title" :item="item" :index="index">
            {{ item.title }}
          </slot>
        </button>
      </h2>
      <div
        :id="item.id"
        :class="['accordion-collapse', 'collapse']"
        :data-bs-parent="alwaysOpen ? undefined : `#${computedId}`"
      >
        <div class="accordion-body">
          <slot name="content" :item="item" :index="index">
            {{ item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
