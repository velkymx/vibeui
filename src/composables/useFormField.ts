import { computed, inject, type ComputedRef } from 'vue'
import { FORM_GROUP_KEY } from '../injectionKeys'
import { useId } from './useId'
import type { FormGroupContext } from '../injectionKeys'

/**
 * The subset of props every form control shares. Controls declare these with
 * `defineProps` as usual and hand the resulting object straight to `useFormField`.
 */
export interface FormFieldProps {
  id?: string
  label?: string
  helpText?: string
  validationState?: string | null
  validationMessage?: string
}

export interface UseFormFieldOptions {
  /**
   * Extra reason for this control to render its own help slot, beyond `helpText`
   * (VibeFormTextarea's character counter is the only current case).
   */
  extraHelp?: () => boolean
}

export interface FormField {
  /** The enclosing VibeFormGroup, or null when the control is standalone. */
  formGroup: FormGroupContext | null
  /** Element id: explicit prop, else the group's claimed id, else a generated one. */
  computedId: ComputedRef<string>
  helpId: ComputedRef<string>
  feedbackId: ComputedRef<string>
  /** Space-separated ids for aria-describedby, or undefined when there are none. */
  ariaDescribedBy: ComputedRef<string | undefined>
  /** A control only renders these itself when the group is not already doing so. */
  shouldRenderLabel: ComputedRef<boolean>
  shouldRenderFeedback: ComputedRef<boolean>
  shouldRenderHelp: ComputedRef<boolean>
  /** Control's own validationState, or the group's when the control has none. */
  resolvedValidationState: ComputedRef<string | null>
  validationClass: ComputedRef<string | null>
  ariaInvalid: ComputedRef<boolean>
}

/**
 * The id, description and self-rendering rules shared by every form control.
 *
 * `consumeId()` is claimed once here, during setup: only the first control inside a
 * group takes the group's id, so two controls in one group never collide.
 */
export function useFormField(
  prefix: string,
  props: FormFieldProps,
  options: UseFormFieldOptions = {}
): FormField {
  const formGroup = inject(FORM_GROUP_KEY, null)

  const groupId = formGroup?.consumeId()
  const generatedId = useId(prefix)

  const computedId = computed(() => props.id || groupId || generatedId)
  const helpId = computed(() => `${computedId.value}-help`)
  const feedbackId = computed(() => `${computedId.value}-feedback`)

  const shouldRenderLabel = computed(() => !!props.label && !formGroup?.hasLabel.value)
  const shouldRenderFeedback = computed(() => !!props.validationState && !formGroup?.hasValidation.value)
  const shouldRenderHelp = computed(
    () => (!!props.helpText || !!options.extraHelp?.()) && !formGroup?.hasHelp.value
  )

  // A control adopts the group's validation state when it has none of its own,
  // so `<VibeFormGroup :validation-state>` marks the wrapped control invalid/valid.
  const resolvedValidationState = computed<string | null>(
    () => props.validationState ?? (formGroup?.hasValidation.value ? formGroup.validationState.value : null)
  )
  const validationClass = computed<string | null>(() =>
    resolvedValidationState.value === 'valid' ? 'is-valid'
      : resolvedValidationState.value === 'invalid' ? 'is-invalid'
        : null
  )
  const ariaInvalid = computed(() => resolvedValidationState.value === 'invalid')

  // WCAG 1.3.1 / 3.3.1: describe the control with its own help and feedback *and*
  // with the group's, since the common pattern puts those props on VibeFormGroup.
  // Keyed off what is actually rendered, so an id is never referenced without a
  // matching element — the group suppresses the control's own help and feedback.
  const ariaDescribedBy = computed(() => {
    const ids: string[] = []
    if (shouldRenderHelp.value) ids.push(helpId.value)
    if (shouldRenderFeedback.value) ids.push(feedbackId.value)
    if (formGroup?.helpId.value) ids.push(formGroup.helpId.value)
    if (formGroup?.feedbackId.value) ids.push(formGroup.feedbackId.value)
    return ids.length ? [...new Set(ids)].join(' ') : undefined
  })

  return {
    formGroup,
    computedId,
    helpId,
    feedbackId,
    ariaDescribedBy,
    shouldRenderLabel,
    shouldRenderFeedback,
    shouldRenderHelp,
    resolvedValidationState,
    validationClass,
    ariaInvalid
  }
}
