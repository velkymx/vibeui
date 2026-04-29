<script setup lang="ts" generic="T = string">
import { ref, computed, watch, onBeforeUnmount, type PropType, type Ref } from 'vue'
import { useId } from '../composables/useId'

type SourceFn<T> = (query: string) => T[] | Promise<T[]>

const props = defineProps({
  modelValue: { type: String, default: '' },
  source: {
    type: [Array, Function] as PropType<T[] | SourceFn<T>>,
    required: true
  },
  minChars: { type: Number, default: 1 },
  debounce: { type: Number, default: 200 },
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
}>()

const computedId = computed(() => props.id || useId('autocomplete'))

const inputValue = ref(props.modelValue)
const results: Ref<T[]> = ref([]) as Ref<T[]>
const highlightedIndex = ref(-1)
const isOpen = ref(false)
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

watch(
  () => props.modelValue,
  (val) => {
    if (val !== inputValue.value) inputValue.value = val
  }
)

const labelOf = (item: T): string => {
  if (props.itemText) return props.itemText(item)
  return typeof item === 'string' ? item : String(item)
}

const filterArray = (arr: T[], query: string): T[] => {
  const q = query.toLowerCase()
  return arr.filter(item => labelOf(item).toLowerCase().includes(q)).slice(0, props.maxResults)
}

const runQuery = async (query: string) => {
  if (typeof props.source === 'function') {
    const out = await (props.source as SourceFn<T>)(query)
    results.value = out.slice(0, props.maxResults)
  } else {
    results.value = filterArray(props.source as T[], query)
  }
  highlightedIndex.value = -1
  isOpen.value = true
}

const scheduleQuery = (query: string) => {
  if (debounceTimer.value !== null) clearTimeout(debounceTimer.value)
  if (props.debounce <= 0) {
    void runQuery(query)
    return
  }
  debounceTimer.value = setTimeout(() => {
    void runQuery(query)
    debounceTimer.value = null
  }, props.debounce)
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
  if (target.value.length < props.minChars) {
    results.value = []
    isOpen.value = false
    return
  }
  scheduleQuery(target.value)
}

const onFocus = () => {
  if (inputValue.value.length >= props.minChars) {
    void runQuery(inputValue.value)
  }
}

const closeMenu = () => {
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
      void runQuery(inputValue.value)
      return
    }
    highlightedIndex.value = Math.min(results.value.length - 1, highlightedIndex.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
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

onBeforeUnmount(() => {
  if (debounceTimer.value !== null) clearTimeout(debounceTimer.value)
})

const showEmpty = computed(() => isOpen.value && inputValue.value.length >= props.minChars && results.value.length === 0)
</script>

<template>
  <div class="vibe-autocomplete">
    <label v-if="label" :for="computedId" class="form-label">{{ label }}</label>
    <input
      :id="computedId"
      class="form-control"
      type="text"
      autocomplete="off"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-autocomplete="'list'"
      role="combobox"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
      @blur="closeMenu"
    />
    <ul v-if="isOpen && results.length > 0" class="vibe-autocomplete-menu" role="listbox">
      <li
        v-for="(item, idx) in results"
        :key="idx"
        :class="[
          'vibe-autocomplete-item',
          idx === highlightedIndex ? 'vibe-autocomplete-item-highlighted' : ''
        ]"
        role="option"
        :aria-selected="idx === highlightedIndex"
        @mouseenter="highlightedIndex = idx"
        @mousedown.prevent="selectItem(item)"
      >
        <slot name="item" :item="item" :index="idx" :label="labelOf(item)">
          {{ labelOf(item) }}
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
