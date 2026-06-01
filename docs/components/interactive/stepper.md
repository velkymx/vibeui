# VibeStepper

Multi-step wizard with linear / non-linear modes and per-step validation guards. Use for sprint setup, initiative gates, onboarding flows.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Number` | `0` | Active step index (v-model) |
| `steps` | `StepperStep[]` | required | Step descriptors (see below) |
| `linear` | `Boolean` | `true` | Forbid clicking ahead of current step |
| `vertical` | `Boolean` | `false` | Vertical layout |
| `beforeNext` | `(currentIndex, 'next') => boolean \| Promise<boolean>` | `undefined` | Guard for advancing |
| `beforePrev` | `(currentIndex, 'prev') => boolean \| Promise<boolean>` | `undefined` | Guard for going back |
| `nextText` | `String` | `'Next'` | Default action button label |
| `prevText` | `String` | `'Back'` | |
| `finishText` | `String` | `'Finish'` | Replaces `nextText` on the last step |

### Step descriptor

```ts
interface StepperStep {
  label: string
  description?: string  // small caption under the label
  disabled?: boolean
  icon?: string         // reserved; use marker slot for now
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number` | Active step changed |
| `finish` | — | Emitted when next is clicked on the last step |

### Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `step` | `{ index, step }` | Body for the active step |
| `marker` | `{ index, step, active }` | Override the step's marker (default: number) |
| `label` | `{ index, step }` | Override the step header label |
| `actions` | `{ next, prev, isFirst, isLast }` | Replace default footer buttons |

## Examples

```vue
<script setup>
import { ref } from 'vue'
const active = ref(0)
const steps = [
  { label: 'Account', description: 'Basics' },
  { label: 'Profile' },
  { label: 'Confirm' }
]

async function validateStep(index) {
  // call server, validate fields...
  return true
}
</script>

<template>
  <VibeStepper
    v-model="active"
    :steps="steps"
    :before-next="validateStep"
    @finish="submit"
  >
    <template #step="{ index }">
      <component :is="forms[index]" />
    </template>
  </VibeStepper>
</template>
```

### Non-linear (free navigation)

```vue
<VibeStepper :steps="steps" v-model="active" :linear="false" />
```
