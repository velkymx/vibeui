<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { AccordionItem } from '../types'
import { useId } from '../composables/useId'

interface BootstrapCollapse {
  show: () => void
  hide: () => void
  toggle: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('accordion') },
  flush: { type: Boolean, default: false },
  items: { type: Array as () => AccordionItem[], required: true },
  alwaysOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['item-click', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const accordionRef = ref<HTMLElement | null>(null)
const bsCollapses = new Map<string, BootstrapCollapse>()

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
  const el = document.getElementById(id)
  const h = collapseHandlers.get(id)
  if (el && h) {
    el.removeEventListener('show.bs.collapse', h.show)
    el.removeEventListener('shown.bs.collapse', h.shown)
    el.removeEventListener('hide.bs.collapse', h.hide)
    el.removeEventListener('hidden.bs.collapse', h.hidden)
  }
  collapseHandlers.delete(id)
  bsCollapses.get(id)?.dispose()
  bsCollapses.delete(id)
}

const initItems = async () => {
  if (!accordionRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const Collapse = bootstrap.Collapse

    const collapseEls = accordionRef.value.querySelectorAll('.accordion-collapse')
    collapseEls.forEach((el) => {
      const id = el.id
      // Only initialize if not already tracked
      if (!bsCollapses.has(id)) {
        const bsCollapse = new Collapse(el as HTMLElement, {
          toggle: false,
          parent: props.alwaysOpen ? undefined : `#${props.id}`
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
  }
}

onMounted(initItems)

onBeforeUnmount(() => {
  bsCollapses.forEach((_, id) => disposeItem(id))
})

// Watch for changes in items array length or individual items
watch(() => props.items, async (newItems, oldItems) => {
  // Dispose Collapse instances for removed items
  const newIds = new Set(newItems.map(i => i.id))
  oldItems?.forEach(oldItem => {
    if (!newIds.has(oldItem.id)) {
      disposeItem(oldItem.id)
    }
  })

  // If items were added, initialize them
  if (newItems.length > (oldItems?.length ?? 0)) {
    await nextTick()
    await initItems()
  }

  // Handle programmatic show/hide changes
  newItems.forEach(item => {
    const bsCollapse = bsCollapses.get(item.id)
    if (bsCollapse) {
      if (item.show) {
        bsCollapse.show()
      } else if (!props.alwaysOpen) {
        bsCollapse.hide()
      }
    }
  })
}, { deep: true })

const handleItemClick = (item: AccordionItem, index: number) => {
  emit('item-click', { item, index })
}

defineExpose({ bsInstances: bsCollapses, refresh: initItems })
</script>

<template>
  <div ref="accordionRef" :id="id" :class="['accordion', { 'accordion-flush': flush }]">
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
        :class="['accordion-collapse', 'collapse', { show: item.show }]"
        :data-bs-parent="alwaysOpen ? undefined : `#${id}`"
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
