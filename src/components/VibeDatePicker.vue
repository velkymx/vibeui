<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { useId } from '../composables/useId'

type IsoDate = string // YYYY-MM-DD
type DateValue = IsoDate | null
type RangeValue = [DateValue, DateValue]

const props = defineProps({
  modelValue: {
    type: [String, Array, null] as PropType<DateValue | RangeValue>,
    default: null
  },
  range: { type: Boolean, default: false },
  min: { type: String as PropType<IsoDate>, default: undefined },
  max: { type: String as PropType<IsoDate>, default: undefined },
  disabledDates: { type: Array as PropType<IsoDate[]>, default: () => [] },
  format: {
    type: Function as PropType<(iso: IsoDate) => string>,
    default: undefined
  },
  placeholder: { type: String, default: 'Select date' },
  weekStart: { type: Number, default: 0 }, // 0 = Sunday
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateValue | RangeValue): void
  (e: 'open'): void
  (e: 'close'): void
}>()

const computedId = computed(() => props.id || useId('datepicker'))

const pad = (n: number) => String(n).padStart(2, '0')
const toIso = (d: Date): IsoDate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromIso = (iso: IsoDate): Date => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const isOpen = ref(false)
const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())
const focusedIso = ref<IsoDate | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

const lowDate = computed<DateValue>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue[0]
  return props.modelValue
})

const highDate = computed<DateValue>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue[1]
  return null
})

watch(
  () => lowDate.value,
  (val) => {
    if (val) {
      const d = fromIso(val)
      viewYear.value = d.getFullYear()
      viewMonth.value = d.getMonth()
    }
  },
  { immediate: true }
)

const isDisabled = (iso: IsoDate): boolean => {
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return props.disabledDates.includes(iso)
}

interface DayCell {
  iso: IsoDate
  day: number
  inMonth: boolean
  disabled: boolean
  isToday: boolean
  isSelected: boolean
  isFocused: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
}

const monthGrid = computed<DayCell[]>(() => {
  const cells: DayCell[] = []
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  const dayOfWeek = firstOfMonth.getDay()
  const offset = (dayOfWeek - props.weekStart + 7) % 7
  const start = new Date(viewYear.value, viewMonth.value, 1 - offset)
  const todayIso = toIso(today)

  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = toIso(d)
    const inMonth = d.getMonth() === viewMonth.value
    const lo = lowDate.value
    const hi = highDate.value
    const isSelected = iso === lo || iso === hi
    const isInRange = props.range && lo !== null && hi !== null && iso > lo && iso < hi
    cells.push({
      iso,
      day: d.getDate(),
      inMonth,
      disabled: isDisabled(iso),
      isToday: iso === todayIso,
      isSelected,
      isFocused: iso === focusedIso.value,
      isInRange,
      isRangeStart: props.range && iso === lo,
      isRangeEnd: props.range && iso === hi
    })
  }
  return cells
})

const monthLabel = computed(() => {
  const date = new Date(viewYear.value, viewMonth.value, 1)
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
})

const weekdayLabels = computed(() => {
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, 7 + ((i + props.weekStart) % 7))
    labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }))
  }
  return labels
})

const inputDisplay = computed(() => {
  const fmt = props.format || ((iso: IsoDate) => iso)
  if (props.range) {
    const lo = lowDate.value ? fmt(lowDate.value) : ''
    const hi = highDate.value ? fmt(highDate.value) : ''
    if (!lo && !hi) return ''
    return `${lo} → ${hi}`
  }
  return lowDate.value ? fmt(lowDate.value) : ''
})

const togglePopover = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) emit('open')
  else emit('close')
}

const closePopover = () => {
  if (isOpen.value) {
    isOpen.value = false
    emit('close')
  }
}

const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

const selectDate = (cell: DayCell) => {
  if (cell.disabled) return
  if (!props.range) {
    emit('update:modelValue', cell.iso)
    closePopover()
    return
  }

  const lo = lowDate.value
  const hi = highDate.value
  if (!lo || (lo && hi)) {
    emit('update:modelValue', [cell.iso, null])
    return
  }
  if (cell.iso < lo) {
    emit('update:modelValue', [cell.iso, lo])
  } else {
    emit('update:modelValue', [lo, cell.iso])
    closePopover()
  }
}

const cellClass = (cell: DayCell): string => {
  const c = ['vibe-datepicker-day']
  if (!cell.inMonth) c.push('vibe-datepicker-day-outside')
  if (cell.disabled) c.push('vibe-datepicker-day-disabled')
  if (cell.isToday) c.push('vibe-datepicker-day-today')
  if (cell.isSelected) c.push('vibe-datepicker-day-selected')
  if (cell.isFocused) c.push('vibe-datepicker-day-focused')
  if (cell.isInRange) c.push('vibe-datepicker-day-in-range')
  if (cell.isRangeStart) c.push('vibe-datepicker-day-range-start')
  if (cell.isRangeEnd) c.push('vibe-datepicker-day-range-end')
  return c.join(' ')
}

const setFocusedDate = async (iso: IsoDate) => {
  focusedIso.value = iso
  const d = fromIso(iso)
  if (d.getFullYear() !== viewYear.value || d.getMonth() !== viewMonth.value) {
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
  }
  await nextTick()
  const el = popoverRef.value?.querySelector<HTMLElement>(`[data-iso="${iso}"]`)
  el?.focus()
}

const shiftFocusedDays = async (days: number) => {
  const baseIso = focusedIso.value || lowDate.value || toIso(today)
  const d = fromIso(baseIso)
  d.setDate(d.getDate() + days)
  await setFocusedDate(toIso(d))
}

const shiftFocusedMonths = async (months: number) => {
  const baseIso = focusedIso.value || lowDate.value || toIso(today)
  const d = fromIso(baseIso)
  const targetMonth = d.getMonth() + months
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12)
  const normalisedMonth = ((targetMonth % 12) + 12) % 12
  d.setFullYear(targetYear, normalisedMonth, Math.min(d.getDate(), 28))
  await setFocusedDate(toIso(d))
}

const handleGridKeydown = async (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      await shiftFocusedDays(1)
      break
    case 'ArrowLeft':
      event.preventDefault()
      await shiftFocusedDays(-1)
      break
    case 'ArrowDown':
      event.preventDefault()
      await shiftFocusedDays(7)
      break
    case 'ArrowUp':
      event.preventDefault()
      await shiftFocusedDays(-7)
      break
    case 'PageDown':
      event.preventDefault()
      await shiftFocusedMonths(1)
      break
    case 'PageUp':
      event.preventDefault()
      await shiftFocusedMonths(-1)
      break
    case 'Home': {
      event.preventDefault()
      const baseIso = focusedIso.value || lowDate.value || toIso(today)
      const d = fromIso(baseIso)
      const offset = (d.getDay() - props.weekStart + 7) % 7
      d.setDate(d.getDate() - offset)
      await setFocusedDate(toIso(d))
      break
    }
    case 'End': {
      event.preventDefault()
      const baseIso = focusedIso.value || lowDate.value || toIso(today)
      const d = fromIso(baseIso)
      const offset = (d.getDay() - props.weekStart + 7) % 7
      d.setDate(d.getDate() + (6 - offset))
      await setFocusedDate(toIso(d))
      break
    }
    case 'Enter':
    case ' ': {
      event.preventDefault()
      const iso = focusedIso.value
      if (!iso) break
      const cell = monthGrid.value.find(c => c.iso === iso)
      if (cell) selectDate(cell)
      break
    }
    case 'Escape':
      event.preventDefault()
      closePopover()
      break
  }
}

const onDocumentMousedown = (event: MouseEvent) => {
  if (!isOpen.value) return
  const root = rootRef.value
  if (root && event.target instanceof Node && root.contains(event.target)) return
  closePopover()
}

watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    focusedIso.value = lowDate.value || toIso(today)
    document.addEventListener('mousedown', onDocumentMousedown)
  } else {
    focusedIso.value = null
    document.removeEventListener('mousedown', onDocumentMousedown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', onDocumentMousedown)
  }
})

defineExpose({ open: () => { if (!isOpen.value) togglePopover() }, close: closePopover })
</script>

<template>
  <div class="vibe-datepicker" ref="rootRef">
    <label v-if="label" :for="computedId" class="form-label">{{ label }}</label>
    <input
      :id="computedId"
      type="text"
      readonly
      class="form-control"
      :value="inputDisplay"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-haspopup="'dialog'"
      :aria-expanded="isOpen"
      @click="togglePopover"
    />
    <div
      v-if="isOpen"
      ref="popoverRef"
      class="vibe-datepicker-popover"
      role="dialog"
      :aria-label="label || 'Date picker'"
      @keydown="handleGridKeydown"
    >
      <div class="vibe-datepicker-header">
        <button
          type="button"
          class="vibe-datepicker-nav"
          :aria-label="'Previous month'"
          data-prev-month
          @click="prevMonth"
        >‹</button>
        <span class="vibe-datepicker-title">{{ monthLabel }}</span>
        <button
          type="button"
          class="vibe-datepicker-nav"
          :aria-label="'Next month'"
          data-next-month
          @click="nextMonth"
        >›</button>
      </div>
      <div class="vibe-datepicker-weekdays">
        <span v-for="label in weekdayLabels" :key="label" class="vibe-datepicker-weekday">{{ label }}</span>
      </div>
      <div class="vibe-datepicker-grid">
        <button
          v-for="cell in monthGrid"
          :key="cell.iso"
          type="button"
          :class="cellClass(cell)"
          :data-iso="cell.iso"
          :disabled="cell.disabled"
          @click="selectDate(cell)"
        >
          {{ cell.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vibe-datepicker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.vibe-datepicker-popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1050;
  margin-top: 0.25rem;
  padding: 0.75rem;
  background-color: var(--bs-body-bg, white);
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  min-width: 280px;
}

.vibe-datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.vibe-datepicker-nav {
  background: none;
  border: 0;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.vibe-datepicker-title {
  font-weight: 600;
}

.vibe-datepicker-weekdays,
.vibe-datepicker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.vibe-datepicker-weekday {
  text-align: center;
  font-size: 0.75rem;
  color: var(--bs-secondary-color, #6c757d);
  padding: 0.25rem 0;
}

.vibe-datepicker-day {
  background: none;
  border: 0;
  border-radius: 0.25rem;
  padding: 0.4rem 0;
  cursor: pointer;
  font-size: 0.875rem;
}

.vibe-datepicker-day:hover:not(:disabled) {
  background-color: var(--bs-secondary-bg, #e9ecef);
}

.vibe-datepicker-day-outside {
  opacity: 0.4;
}

.vibe-datepicker-day-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.vibe-datepicker-day-today {
  font-weight: 700;
  text-decoration: underline;
}

.vibe-datepicker-day-selected,
.vibe-datepicker-day-range-start,
.vibe-datepicker-day-range-end {
  background-color: var(--bs-primary, #0d6efd);
  color: white;
}

.vibe-datepicker-day-in-range {
  background-color: var(--bs-primary-bg-subtle, #cfe2ff);
}
</style>
