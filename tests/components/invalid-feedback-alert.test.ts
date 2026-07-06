import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { ref } from 'vue'
import VibeFormInput from '../../src/components/VibeFormInput.vue'
import VibeFormTextarea from '../../src/components/VibeFormTextarea.vue'
import VibeFormSelect from '../../src/components/VibeFormSelect.vue'
import VibeFormCheckbox from '../../src/components/VibeFormCheckbox.vue'
import VibeFormRadio from '../../src/components/VibeFormRadio.vue'
import VibeFormSwitch from '../../src/components/VibeFormSwitch.vue'
import VibeFormDatepicker from '../../src/components/VibeFormDatepicker.vue'
import VibeFormSpinbutton from '../../src/components/VibeFormSpinbutton.vue'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'

// VibeFormWysiwyg reads breakpoints at setup; mock so it mounts in happy-dom
// (same mock as VibeFormWysiwyg.test.ts).
vi.mock('../../src/composables/useBreakpoints', () => ({
  useBreakpoints: vi.fn(() => ({
    isMobile: ref(false),
    isXs: ref(false),
    isSm: ref(false),
    isMd: ref(false),
    isLg: ref(false),
    isXl: ref(false),
    isXxl: ref(false),
    isTablet: ref(false)
  }))
}))

// WCAG 4.1.3: errors surfaced after a failed submit must be announced by screen
// readers without the user re-focusing the field. VibeFormGroup already renders
// its invalid-feedback with role="alert"; every form control's STANDALONE
// feedback path (used outside a VibeFormGroup) must match.
const cases: Array<[string, Component, Record<string, unknown>]> = [
  ['VibeFormInput', VibeFormInput, {}],
  ['VibeFormTextarea', VibeFormTextarea, {}],
  ['VibeFormSelect', VibeFormSelect, {}],
  ['VibeFormCheckbox', VibeFormCheckbox, {}],
  ['VibeFormRadio', VibeFormRadio, { name: 'group', value: 'a' }],
  ['VibeFormSwitch', VibeFormSwitch, {}],
  ['VibeFormDatepicker', VibeFormDatepicker, {}],
  ['VibeFormSpinbutton', VibeFormSpinbutton, {}],
  ['VibeFormWysiwyg', VibeFormWysiwyg, {}]
]

describe('standalone invalid-feedback is a live region (WCAG 4.1.3)', () => {
  it.each(cases)('%s renders invalid-feedback with role="alert"', (_name, component, extraProps) => {
    const wrapper = mount(component, {
      props: {
        ...extraProps,
        validationState: 'invalid',
        validationMessage: 'Bad value'
      }
    })

    const feedback = wrapper.find('.invalid-feedback')
    expect(feedback.exists()).toBe(true)
    expect(feedback.text()).toContain('Bad value')
    expect(feedback.attributes('role')).toBe('alert')
  })

  it('valid-feedback does NOT get role="alert" (success is not an interruption)', () => {
    const wrapper = mount(VibeFormInput, {
      props: {
        validationState: 'valid',
        validationMessage: 'Looks good!'
      }
    })

    const feedback = wrapper.find('.valid-feedback')
    expect(feedback.exists()).toBe(true)
    expect(feedback.attributes('role')).toBeUndefined()
  })
})
