<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import type { ValidationState } from '../types'
import { useId } from '../composables/useId'

const props = defineProps({
  label: { type: String, default: undefined },
  labelFor: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  validationState: { type: String as () => ValidationState, default: null },
  validationMessage: { type: String, default: undefined },
  helpText: { type: String, default: undefined },
  floating: { type: Boolean, default: false },
  row: { type: Boolean, default: false },
  labelCols: { type: [Number, String], default: undefined },
  labelAlign: { type: String as () => 'start' | 'center' | 'end', default: undefined }
})

const computedId = computed(() => props.labelFor || useId('form-group'))
const isIdConsumed = ref(false)

/**
 * Maturity Fix: "The First-Child Rule"
 * Allows children to 'consume' the Group ID. Only the first child to call this
 * gets the Group ID. Subsequent children get null, forcing them to generate their own.
 */
const consumeId = () => {
  if (isIdConsumed.value) return null
  isIdConsumed.value = true
  return computedId.value
}

provide('vibeFormGroup', {
  id: computedId,
  consumeId,
  hasLabel: computed(() => !!props.label),
  hasValidation: computed(() => !!props.validationState),
  hasHelp: computed(() => !!props.helpText)
})

const formGroupClass = computed(() => {
  const classes: string[] = []
  if (props.floating) {
    classes.push('form-floating')
  } else if (props.row) {
    classes.push('row', 'mb-3')
  } else {
    classes.push('mb-3')
  }
  return classes.join(' ')
})

const labelClass = computed(() => {
  const classes: string[] = []
  if (props.floating) {
    classes.push('form-label')
  } else if (props.row) {
    classes.push('col-form-label')
    if (props.labelCols) classes.push(`col-sm-${props.labelCols}`)
    if (props.labelAlign) classes.push(`text-${props.labelAlign}`)
  } else {
    classes.push('form-label')
  }
  return classes.join(' ')
})

const contentClass = computed(() => {
  if (props.row && props.labelCols) {
    const contentCols = 12 - Number(props.labelCols)
    return `col-sm-${contentCols}`
  }
  return ''
})

const feedbackId = computed(() => `${computedId.value}-feedback`)
</script>

<template>
  <div :class="formGroupClass">
    <label
      v-if="label && !floating"
      :for="computedId"
      :class="labelClass"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div v-if="row && labelCols" :class="contentClass">
      <slot />

      <div v-if="helpText && !validationMessage" :id="feedbackId" class="form-text">
        {{ helpText }}
      </div>
      <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide a valid value.' }}
      </div>
    </div>

    <template v-else>
      <slot />

      <label
        v-if="label && floating"
        :for="computedId"
        :class="labelClass"
      >
        {{ label }}
        <span v-if="required" class="text-danger">*</span>
      </label>

      <div v-if="helpText && !validationMessage" :id="feedbackId" class="form-text">
        {{ helpText }}
      </div>
      <div v-if="validationState === 'valid'" class="valid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Looks good!' }}
      </div>
      <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" :style="{ display: 'block' }">
        {{ validationMessage || 'Please provide a valid value.' }}
      </div>
    </template>
  </div>
</template>
