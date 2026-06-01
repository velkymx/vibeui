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

const onShow = (id: string) => emit('show', id)
const onShown = (id: string) => emit('shown', id)
const onHide = (id: string) => emit('hide', id)
const onHidden = (id: string) => emit('hidden', id)

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

        el.addEventListener('show.bs.collapse', () => onShow(id))
        el.addEventListener('shown.bs.collapse', () => onShown(id))
        el.addEventListener('hide.bs.collapse', () => onHide(id))
        el.addEventListener('hidden.bs.collapse', () => onHidden(id))

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
  bsCollapses.forEach((bsCollapse, id) => {
    const el = document.getElementById(id)
    if (el) {
      el.removeEventListener('show.bs.collapse', () => onShow(id))
      el.removeEventListener('shown.bs.collapse', () => onShown(id))
      el.removeEventListener('hide.bs.collapse', () => onHide(id))
      el.removeEventListener('hidden.bs.collapse', () => onHidden(id))
    }
    bsCollapse.dispose()
  })
  bsCollapses.clear()
})

// Watch for changes in items array length or individual items
watch(() => props.items, async (newItems, oldItems) => {
  // If items were added, we need to initialize them
  if (newItems.length !== oldItems?.length) {
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
        // Only hide programmatically if not always-open (or handle as needed)
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
