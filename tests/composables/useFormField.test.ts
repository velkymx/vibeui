import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import VibeFormGroup from '../../src/components/VibeFormGroup.vue'
import VibeFormSelect from '../../src/components/VibeFormSelect.vue'
import VibeFormCheckbox from '../../src/components/VibeFormCheckbox.vue'
import VibeFormRadio from '../../src/components/VibeFormRadio.vue'
import VibeFormSwitch from '../../src/components/VibeFormSwitch.vue'
import VibeFormTextarea from '../../src/components/VibeFormTextarea.vue'
import VibeFormSpinbutton from '../../src/components/VibeFormSpinbutton.vue'
import VibeFormDatepicker from '../../src/components/VibeFormDatepicker.vue'
import VibeFormInput from '../../src/components/VibeFormInput.vue'

// Every control shares one id/visibility/aria contract via useFormField. These
// tests pin the parts that had drifted apart across the individual components.
const controls: Array<[string, unknown, string]> = [
  ['VibeFormInput', VibeFormInput, 'input'],
  ['VibeFormSelect', VibeFormSelect, 'select'],
  ['VibeFormTextarea', VibeFormTextarea, 'textarea'],
  ['VibeFormCheckbox', VibeFormCheckbox, 'input'],
  ['VibeFormRadio', VibeFormRadio, 'input'],
  ['VibeFormSwitch', VibeFormSwitch, 'input'],
  ['VibeFormSpinbutton', VibeFormSpinbutton, 'input'],
  ['VibeFormDatepicker', VibeFormDatepicker, 'input']
]

describe('useFormField — shared form control contract', () => {
  describe('aria-describedby points at the group help text (WCAG 1.3.1)', () => {
    for (const [name, Control, selector] of controls) {
      it(`${name} references the group's help element`, () => {
        const wrapper = mount(VibeFormGroup, {
          props: { label: 'Field', helpText: 'Group level help' },
          slots: { default: () => h(Control as never) }
        })

        const groupHelp = wrapper.find('.form-text')
        expect(groupHelp.exists()).toBe(true)

        const describedBy = wrapper.find(selector).attributes('aria-describedby')
        expect(describedBy, `${name} has no aria-describedby`).toBeTruthy()
        expect(describedBy!.split(' ')).toContain(groupHelp.attributes('id'))
      })
    }
  })

  describe('own help and feedback ids follow one formula', () => {
    for (const [name, Control, selector] of controls) {
      it(`${name} derives -help and -feedback from its own id`, () => {
        const wrapper = mount(Control as never, {
          props: {
            id: 'fixed',
            helpText: 'Own help',
            validationState: 'invalid',
            validationMessage: 'Own error'
          }
        })

        expect(wrapper.find('#fixed-help').exists(), `${name} help id`).toBe(true)
        expect(wrapper.find('#fixed-feedback').exists(), `${name} feedback id`).toBe(true)

        const describedBy = wrapper.find(selector).attributes('aria-describedby')!.split(' ')
        expect(describedBy).toContain('fixed-help')
        expect(describedBy).toContain('fixed-feedback')
      })
    }
  })

  it('does not repeat an id when the control and its group both describe it', () => {
    const wrapper = mount(VibeFormGroup, {
      props: { label: 'Field', helpText: 'Group help' },
      slots: { default: () => h(VibeFormInput as never, { helpText: 'Own help' }) }
    })

    const ids = wrapper.find('input').attributes('aria-describedby')!.split(' ')
    expect(new Set(ids).size).toBe(ids.length)
  })
})
