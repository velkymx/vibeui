<script setup lang="ts" generic="T = string">
import { useTemplateRef, ref, computed, watch, onWatcherCleanup, onBeforeUnmount, type PropType, type Ref } from 'vue'
import { useVibeDefaults, resolveProp } from '../composables/vibeDefaults'
import { useId } from '../composables/useId'
import { useDebouncedRef } from '../composables/useDebouncedRef'

type SourceFn<T> = (query: string) => T[] | Promise<T[]>

const props = defineProps({
  modelValue: { type: String, default: '' },
  source: {
    type: [Array, Function] as PropType<T[] | SourceFn<T>>,
    required: true
  },
  minChars: { type: Number, default: 1 },
  debounce: { type: Number, default: undefined },
  placeholder: { type: String, default: '' },
  label: { type: String, default: undefined },
  id: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  itemText: {
    type: Function as PropType<(item: T) => string>,
    default: undefined
  },
  maxResults: { type: Number, default: 10 }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', item: T): void
  (e: 'error', error: unknown): void
}>()

// Consumer attributes (aria-label, name, data-*) belong on the native combobox
// input, not the positioned wrapper (which owns rootRef). Mirrors VibeFormInput.
defineOptions({ inheritAttrs: false })

const _generatedId = useId('autocomplete')
const computedId = computed(() => props.id || _generatedId)
const listboxId = computed(() => `${computedId.value}-listbox`)

const inputValue = ref(props.modelValue)
const results: Ref<T[]> = ref([]) as Ref<T[]>
const highlightedIndex = ref(-1)
const isOpen = ref(false)
// #158: debounced query mirror; the pending timer clears on scope dispose
// (replaces the hand-rolled timer). Latest write wins; delay <= 0 commits sync.
// #159: explicit prop wins, then the global default, then the builtin.
const vibeDefaults = useVibeDefaults()
const debouncedQuery = useDebouncedRef('', () => resolveProp(props.debounce, vibeDefaults.debounce, 200))
const rootRef = useTemplateRef<HTMLElement>('rootRef')
// Current-run invalidation (#150): every new search marks the previous run
// stale, whichever path started it (debounced watcher, focus, keyboard, or
// explicit cancel). Watcher runs register the kill through onWatcherCleanup,
// which Vue invokes when the watcher re-triggers or stops.
let cancelCurrent: (() => void) | null = null
const beginRun = (): (() => boolean) => {
  cancelCurrent?.()
  let stale = false
  cancelCurrent = () => { stale = true }
  return () => stale
}

watch(
  () => props.modelValue,
  (val) => {
    if (val !== inputValue.value) inputValue.value = val
  }
)

let _warnedObjectLabel = false
const labelOf = (item: T): string => {
  if (props.itemText) return props.itemText(item)
  if (typeof item !== 'string' && !_warnedObjectLabel) {
    _warnedObjectLabel = true
    console.warn('[VibeAutocomplete] Item is an object but no itemText prop was provided — labelOf falls back to String(item) which produces "[object Object]". Pass an itemText function: :itemText="item => item.name"')
  }
  return typeof item === 'string' ? item : String(item)
}

// Row labels computed once per results change instead of re-running labelOf
// (plus its DEV warning check) three times per row on every render (see #198).
const resultLabels = computed(() => new Map(results.value.map((item) => [item, labelOf(item)])))

const filterArray = (arr: T[], query: string): T[] => {
  const q = query.toLowerCase()
  return arr.filter(item => labelOf(item).toLowerCase().includes(q)).slice(0, props.maxResults)
}

const previousHighlightLabel = (): string | null => {
  if (highlightedIndex.value < 0) return null
  const item = results.value[highlightedIndex.value]
  return item === undefined ? null : labelOf(item)
}

const reseatHighlight = (previousLabel: string | null) => {
  if (previousLabel === null) {
    highlightedIndex.value = -1
    return
  }
  const idx = results.value.findIndex(item => labelOf(item) === previousLabel)
  highlightedIndex.value = idx
}

let isUnmounted = false

const runQuery = async (query: string, isStale: () => boolean = () => false) => {
  const previousLabel = previousHighlightLabel()
  if (typeof props.source === 'function') {
    try {
      const out = await (props.source as SourceFn<T>)(query)
      if (isStale() || isUnmounted) return
      results.value = out.slice(0, props.maxResults)
    } catch (error) {
      // Source function rejected: clear stale results and close so the user
      // isn't left looking at outdated suggestions, but emit so the consumer
      // can show a retry (silent close is indistinguishable from no matches).
      if (isStale() || isUnmounted) return
      results.value = []
      isOpen.value = false
      emit('error', error)
      return
    }
  } else {
    // Array sources resolve synchronously, so no stale check can trip here;
    // the beginRun() calls at each call site still invalidate async predecessors.
    results.value = filterArray(props.source as T[], query)
  }
  if (isUnmounted) return
  reseatHighlight(previousLabel)
  isOpen.value = true
}

const cancelInFlight = () => {
  cancelCurrent?.()
  cancelCurrent = null
}

const scheduleQuery = (query: string) => {
  debouncedQuery.value = query
}

// Watch through a fresh array so every commit notifies: watch() skips the
// callback when the value is unchanged, but every input event schedules a query
// (matches the pre-#158 per-keystroke timer behavior).
watch(() => [debouncedQuery.value], ([query]) => {
  const isStale = beginRun()
  onWatcherCleanup(() => { cancelCurrent?.() })
  void runQuery(query, isStale)
})

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
  if (target.value.length < props.minChars) {
    cancelInFlight()
    results.value = []
    isOpen.value = false
    return
  }
  scheduleQuery(target.value)
}

const onFocus = () => {
  if (props.disabled) return
  if (inputValue.value.length >= props.minChars) {
    void runQuery(inputValue.value, beginRun())
  }
}

const closeMenu = () => {
  cancelInFlight()
  isOpen.value = false
  highlightedIndex.value = -1
}

const selectItem = (item: T) => {
  inputValue.value = labelOf(item)
  emit('update:modelValue', inputValue.value)
  emit('select', item)
  closeMenu()
}

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isOpen.value) {
      void runQuery(inputValue.value, beginRun())
      return
    }
    highlightedIndex.value = Math.min(results.value.length - 1, highlightedIndex.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) return
    highlightedIndex.value = Math.max(0, highlightedIndex.value - 1)
  } else if (event.key === 'Enter') {
    if (highlightedIndex.value >= 0 && results.value[highlightedIndex.value]) {
      event.preventDefault()
      selectItem(results.value[highlightedIndex.value])
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
  }
}

const onDocumentMousedown = (event: MouseEvent) => {
  if (!isOpen.value) return
  const root = rootRef.value
  if (root && event.target instanceof Node && root.contains(event.target)) return
  closeMenu()
}

watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    document.addEventListener('mousedown', onDocumentMousedown)
  } else {
    document.removeEventListener('mousedown', onDocumentMousedown)
  }
})

onBeforeUnmount(() => {
  isUnmounted = true
  cancelInFlight()
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', onDocumentMousedown)
  }
})

const showEmpty = computed(() => isOpen.value && inputValue.value.length >= props.minChars && results.value.length === 0)
</script>

<template>
  <div class="vibe-autocomplete" ref="rootRef">
    <label v-if="label" :for="computedId" class="form-label">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="computedId"
      class="form-control"
      type="text"
      autocomplete="off"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-autocomplete="'list'"
      :aria-controls="isOpen && results.length > 0 ? listboxId : undefined"
      :aria-activedescendant="highlightedIndex >= 0 ? `${computedId}-option-${highlightedIndex}` : undefined"
      role="combobox"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
    />
    <ul v-if="isOpen && results.length > 0" :id="listboxId" class="vibe-autocomplete-menu" role="listbox">
      <li
        v-for="(item, idx) in results"
        :key="resultLabels.get(item) + ' ' + idx"
        :id="`${computedId}-option-${idx}`"
        :class="[
          'vibe-autocomplete-item',
          idx === highlightedIndex ? 'vibe-autocomplete-item-highlighted' : ''
        ]"
        role="option"
        :aria-selected="idx === highlightedIndex"
        @mouseenter="highlightedIndex = idx"
        @click="selectItem(item)"
      >
        <slot name="item" :item="item" :index="idx" :label="resultLabels.get(item)">
          {{ resultLabels.get(item) }}
        </slot>
      </li>
    </ul>
    <div v-else-if="showEmpty" class="vibe-autocomplete-empty">
      <slot name="empty">No results</slot>
    </div>
  </div>
</template>

<style scoped>
.vibe-autocomplete {
  position: relative;
}

.vibe-autocomplete-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  background-color: var(--bs-body-bg, white);
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
}

.vibe-autocomplete-item {
  padding: 0.375rem 0.75rem;
  cursor: pointer;
}

.vibe-autocomplete-item-highlighted {
  background-color: var(--bs-primary-bg-subtle, #cfe2ff);
}

.vibe-autocomplete-empty {
  padding: 0.5rem 0.75rem;
  color: var(--bs-secondary-color, #6c757d);
  font-style: italic;
}
</style>
