<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import type { ButtonVariant, Size, ButtonType, ComponentError } from '../types'
import { linkBindings } from '../utils/linkBindings'
import { safeHref } from '../utils/safeHref'
import { reportComponentError } from '../utils/reportComponentError'
import VibeSpinner from './VibeSpinner.vue'

const props = defineProps({
  variant: { type: String as () => ButtonVariant, default: 'primary' },
  size: { type: String as () => Size, default: undefined },
  outline: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String as () => ButtonType, default: 'button' },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  active: { type: Boolean, default: false },
  focusRing: { type: Boolean, default: false },
  // #94: controlled loading. Consumer owns the boolean and keeps using @click.
  loading: { type: Boolean, default: false },
  // #94: auto-runner. Called on click; if it returns a promise the button owns
  // the loading lifecycle (spinner + disabled + aria-busy) until it settles.
  action: { type: Function as PropType<(event: MouseEvent) => unknown>, default: undefined },
  // #94: optional label swap while loading (e.g. "Saving..."), no layout shift otherwise.
  loadingText: { type: String, default: undefined }
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'component-error', error: ComponentError): void
}>()

// #140: DEV-only guard against the common Bootstrap habit of variant="outline-*".
// VibeUI models outline as a boolean prop, so an "outline-primary" variant is not
// a valid value; point the consumer at the correct form.
if (import.meta.env.DEV && typeof props.variant === 'string' && props.variant.startsWith('outline-')) {
  const base = props.variant.slice('outline-'.length)
  console.warn(
    `[VibeButton] variant="${props.variant}" is not valid. ` +
    `Use the boolean prop instead: variant="${base}" outline.`
  )
}

// Loading driven by the :action auto-runner. Controlled `loading` always wins
// (see isLoading), so a consumer-owned boolean overrides the internal state.
const actionLoading = ref(false)
const isLoading = computed(() => props.loading || actionLoading.value)

// Root ref used only for the DEV-only a11y check below.
const rootRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null)

// DEV-only: warn when the button has content but no visible text and no
// aria-label/aria-labelledby — screen readers would only announce "button" (WCAG 4.1.2).
// We inspect the rendered DOM in onMounted instead of invoking slots.default() in setup:
// calling a slot outside the render function trips Vue's "Slot invoked outside of the
// render function" warning and skips slot dependency tracking. Reading the final DOM also
// catches text nested inside wrapper elements, which the vnode scan missed.
onMounted(() => {
  if (!import.meta.env.DEV) return
  const el = (rootRef.value && '$el' in rootRef.value ? rootRef.value.$el : rootRef.value) as HTMLElement | null
  if (!el) return
  // el.children (elements only) — ignores the comment anchor Vue leaves for an empty slot.
  const hasElementContent = el.children.length > 0
  const hasText = (el.textContent ?? '').trim().length > 0
  const hasLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
  if (hasElementContent && !hasText && !hasLabel) {
    console.warn(
      '[VibeButton] Icon-only buttons require an aria-label or aria-labelledby ' +
      'attribute for screen reader accessibility (WCAG 4.1.2).'
    )
  }
})

// An href that fails sanitizing is dropped entirely rather than rendered as a dead
// anchor, so the element falls through to `to` or to a plain button.
const sanitizedHref = computed(() => safeHref(props.href))

const tag = computed(() => {
  if (sanitizedHref.value) return 'a'
  // When disabled, render a span instead of router-link to block internal navigation
  if (props.to) return props.disabled ? 'span' : 'router-link'
  return 'button'
})

// `to` is only meaningful on the router-link tag — a disabled button renders a
// span, which must not receive a stray `to` attribute.
const rootBindings = computed(() => linkBindings(sanitizedHref.value, tag.value === 'router-link' ? props.to : undefined))

const buttonClass = computed(() => {
  const classes = ['btn']

  if (props.variant === 'link') {
    classes.push('btn-link')
  } else if (props.outline) {
    classes.push(`btn-outline-${props.variant}`)
  } else {
    classes.push(`btn-${props.variant}`)
  }

  if (props.size) classes.push(`btn-${props.size}`)
  if (props.active) classes.push('active')
  if (props.focusRing) classes.push('focus-ring')
  // Bootstrap uses the 'disabled' CSS class for non-button elements
  if ((props.disabled || isLoading.value) && tag.value !== 'button') classes.push('disabled')

  return classes.join(' ')
})

const handleClick = (event: MouseEvent) => {
  // Block interaction while disabled or loading: this is also the re-entrancy
  // guard that kills double-submit for the :action runner.
  if (props.disabled || isLoading.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
  if (props.action) runAction(event)
}

function runAction(event: MouseEvent) {
  let result: unknown
  try {
    result = props.action!(event)
  } catch (error) {
    // Synchronous throw: report and bail without ever entering the loading state.
    reportAction(error)
    return
  }
  // Only a thenable drives the loading lifecycle; a sync action just runs.
  if (!result || typeof (result as PromiseLike<unknown>).then !== 'function') return
  actionLoading.value = true
  Promise.resolve(result)
    .catch(reportAction)
    // Always clear loading, whether the action resolved or rejected.
    .finally(() => { actionLoading.value = false })
}

function reportAction(error: unknown) {
  reportComponentError(emit, {
    message: 'VibeButton action rejected.',
    componentName: 'VibeButton',
    originalError: error
  })
}
</script>

<template>
  <component
    :is="tag"
    ref="rootRef"
    :class="buttonClass"
    :type="tag === 'button' ? type : undefined"
    v-bind="rootBindings"
    :disabled="tag === 'button' ? (disabled || isLoading) : undefined"
    :aria-disabled="disabled || isLoading || undefined"
    :aria-busy="isLoading || undefined"
    @click="handleClick"
  >
    <!-- Spinner inherits currentColor (no variant class), so it stays contrast-
         correct on both solid and outline buttons. sm to fit the label height. -->
    <VibeSpinner v-if="isLoading" type="border" size="sm" class="me-2" />
    <template v-if="isLoading && loadingText">{{ loadingText }}</template>
    <slot v-else />
  </component>
</template>

<style scoped>
/*
 * WCAG 1.4.3: Bootstrap's default disabled opacity (0.65) drops contrast below 3:1.
 * Override with full-opacity body colors so the label stays readable at ≥ 4.5:1
 * in both light and dark mode (Bootstrap's body / tertiary-bg tokens flip automatically).
 */
.btn:disabled,
.btn.disabled {
  color: var(--bs-body-color) !important;
  background-color: var(--bs-tertiary-bg) !important;
  border-color: var(--bs-border-color) !important;
  opacity: 1 !important;
}
</style>
