<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'

export interface StepperStep {
  label: string
  description?: string
  disabled?: boolean
  icon?: string
}

type StepperGuard = (currentIndex: number, direction: 'next' | 'prev') => boolean | Promise<boolean>

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  steps: { type: Array as PropType<StepperStep[]>, required: true },
  linear: { type: Boolean, default: true },
  vertical: { type: Boolean, default: false },
  beforeNext: { type: Function as PropType<StepperGuard>, default: undefined },
  beforePrev: { type: Function as PropType<StepperGuard>, default: undefined },
  nextText: { type: String, default: 'Next' },
  prevText: { type: String, default: 'Back' },
  finishText: { type: String, default: 'Finish' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', index: number): void
  (e: 'finish'): void
}>()

const stepperClass = computed(() => {
  const c = ['vibe-stepper']
  if (props.vertical) c.push('vibe-stepper-vertical')
  return c.join(' ')
})

const transitioning = ref(false)

const isLast = computed(() => props.modelValue >= props.steps.length - 1)
const isFirst = computed(() => props.modelValue <= 0)

const stepClass = (idx: number): string => {
  const c = ['vibe-stepper-step']
  if (idx === props.modelValue) c.push('vibe-stepper-active')
  if (idx < props.modelValue) c.push('vibe-stepper-completed')
  if (props.steps[idx]?.disabled) c.push('vibe-stepper-disabled')
  if (props.linear && idx > props.modelValue) c.push('vibe-stepper-locked')
  return c.join(' ')
}

const canJumpTo = (idx: number): boolean => {
  if (props.steps[idx]?.disabled) return false
  if (!props.linear) return true
  return idx <= props.modelValue
}

const runGuard = async (
  guard: StepperGuard | undefined,
  direction: 'next' | 'prev'
): Promise<boolean> => {
  if (!guard) return true
  const result = guard(props.modelValue, direction)
  return result instanceof Promise ? await result : result
}

const goNext = async () => {
  if (transitioning.value) return
  if (isLast.value) {
    emit('finish')
    return
  }
  transitioning.value = true
  try {
    const allowed = await runGuard(props.beforeNext, 'next')
    if (!allowed) return
    emit('update:modelValue', props.modelValue + 1)
  } finally {
    transitioning.value = false
  }
}

const goPrev = async () => {
  if (transitioning.value) return
  if (isFirst.value) return
  transitioning.value = true
  try {
    const allowed = await runGuard(props.beforePrev, 'prev')
    if (!allowed) return
    emit('update:modelValue', props.modelValue - 1)
  } finally {
    transitioning.value = false
  }
}

const jumpTo = async (idx: number) => {
  if (transitioning.value) return
  if (!canJumpTo(idx)) return
  if (idx === props.modelValue) return
  transitioning.value = true
  try {
    const direction: 'next' | 'prev' = idx > props.modelValue ? 'next' : 'prev'
    const guard = direction === 'next' ? props.beforeNext : props.beforePrev
    const allowed = await runGuard(guard, direction)
    if (!allowed) return
    emit('update:modelValue', idx)
  } finally {
    transitioning.value = false
  }
}

const activeStep = computed(() => props.steps[props.modelValue])
</script>

<template>
  <div :class="stepperClass">
    <ol class="vibe-stepper-header">
      <li
        v-for="(step, idx) in steps"
        :key="idx"
        :class="stepClass(idx)"
        :tabindex="canJumpTo(idx) || idx === modelValue ? 0 : -1"
        :aria-disabled="(canJumpTo(idx) || idx === modelValue) ? undefined : 'true'"
        @click="jumpTo(idx)"
      >
        <span class="vibe-stepper-marker">
          <slot name="marker" :index="idx" :step="step" :active="idx === modelValue">
            {{ idx + 1 }}
          </slot>
        </span>
        <span class="vibe-stepper-label">
          <slot name="label" :index="idx" :step="step">
            {{ step.label }}
          </slot>
          <small v-if="step.description" class="vibe-stepper-description">{{ step.description }}</small>
        </span>
      </li>
    </ol>

    <div class="vibe-stepper-body">
      <slot name="step" :index="modelValue" :step="activeStep" />
    </div>

    <div class="vibe-stepper-actions">
      <slot name="actions" :next="goNext" :prev="goPrev" :is-first="isFirst" :is-last="isLast">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="isFirst"
          data-stepper-prev
          @click="goPrev"
        >
          {{ prevText }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          data-stepper-next
          @click="goNext"
        >
          {{ isLast ? finishText : nextText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.vibe-stepper-header {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  gap: 0;
}

.vibe-stepper-vertical .vibe-stepper-header {
  flex-direction: column;
  gap: 0.5rem;
}

.vibe-stepper-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  position: relative;
  color: var(--bs-secondary-color, #6c757d);
}

.vibe-stepper-step:not(:last-child)::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--bs-border-color, #dee2e6);
  margin-left: 0.75rem;
}

.vibe-stepper-vertical .vibe-stepper-step:not(:last-child)::after {
  display: none;
}

.vibe-stepper-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background-color: var(--bs-secondary-bg, #e9ecef);
  font-weight: 600;
  flex-shrink: 0;
}

.vibe-stepper-active .vibe-stepper-marker {
  background-color: var(--bs-primary, #0d6efd);
  color: white;
}

.vibe-stepper-completed .vibe-stepper-marker {
  background-color: var(--bs-success, #198754);
  color: white;
}

.vibe-stepper-active {
  color: var(--bs-body-color, inherit);
  font-weight: 600;
}

.vibe-stepper-locked,
.vibe-stepper-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.vibe-stepper-label {
  display: flex;
  flex-direction: column;
}

.vibe-stepper-description {
  font-size: 0.85em;
  color: var(--bs-secondary-color, #6c757d);
  font-weight: normal;
}

.vibe-stepper-body {
  margin-bottom: 1.5rem;
}

.vibe-stepper-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
