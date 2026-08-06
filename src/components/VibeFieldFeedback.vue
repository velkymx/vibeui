<script setup lang="ts">
import type { PropType } from 'vue'
import type { ValidationState } from '../types'

/**
 * The help text and valid/invalid feedback that every form control renders below
 * itself. Internal to the library — not registered globally and not part of the
 * public API; controls import it directly.
 *
 * Kept as a component rather than a composable because the duplication was in the
 * markup: the Bootstrap classes, the `display: block` override that makes feedback
 * visible without a sibling `.is-invalid`, and the role="alert" that announces
 * errors without requiring refocus (WCAG 4.1.3).
 */
defineProps({
  helpId: { type: String, required: true },
  feedbackId: { type: String, required: true },
  helpText: { type: String, default: undefined },
  validationState: { type: String as PropType<ValidationState>, default: null },
  validationMessage: { type: String, default: undefined },
  /** Fallback error text when the consumer supplies no validationMessage. */
  invalidMessage: { type: String, default: 'Please provide a valid value.' },
  showHelp: { type: Boolean, default: false },
  showFeedback: { type: Boolean, default: false }
})

// Multiple roots: the control decides where these land, so nothing should fall through.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div v-if="showHelp" :id="helpId" class="form-text">
    <slot name="help">{{ helpText }}</slot>
  </div>
  <template v-if="showFeedback">
    <div v-if="validationState === 'valid'" :id="feedbackId" class="valid-feedback" :style="{ display: 'block' }">
      {{ validationMessage || 'Looks good!' }}
    </div>
    <!-- role="alert" announces errors to SR users without requiring refocus (WCAG 4.1.3) -->
    <div v-if="validationState === 'invalid'" :id="feedbackId" class="invalid-feedback" role="alert" :style="{ display: 'block' }">
      {{ validationMessage || invalidMessage }}
    </div>
  </template>
</template>
