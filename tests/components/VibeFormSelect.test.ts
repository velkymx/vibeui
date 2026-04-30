import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormSelect from '../../src/components/VibeFormSelect.vue'
import type { FormSelectOption } from '../../src/types'

describe('VibeFormSelect', () => {
  const mockOptions: FormSelectOption[] = [
    { text: 'Option 1', value: '1' },
    { text: 'Option 2', value: '2' },
    { text: 'Option 3', value: '3', disabled: true }
  ]

  it('renders select with correct structure', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'test-select',
        options: mockOptions
      }
    })

    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('.form-select').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'country',
        label: 'Select Country',
        options: []
      }
    })

    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Select Country')
    expect(label.attributes('for')).toBe('country')
  })

  it('renders options from array', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions
      }
    })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe('Option 1')
  })

  it('marks disabled options', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions
      }
    })

    const options = wrapper.findAll('option')
    expect(options[2].attributes('disabled')).toBeDefined()
  })

  it('renders placeholder option', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        placeholder: 'Choose an option'
      }
    })

    const options = wrapper.findAll('option')
    expect(options[0].text()).toBe('Choose an option')
    expect(options[0].attributes('value')).toBe('')
    expect(options[0].attributes('disabled')).toBeDefined()
  })

  it('sets disabled attribute', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        disabled: true
      }
    })

    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })

  it('sets multiple attribute', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        multiple: true
      }
    })

    expect(wrapper.find('select').attributes('multiple')).toBeDefined()
  })

  it('sets htmlSize attribute', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        htmlSize: 5
      }
    })

    expect(wrapper.find('select').attributes('size')).toBe('5')
  })

  it('applies size class', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        size: 'lg'
      }
    })

    expect(wrapper.find('select').classes()).toContain('form-select-lg')
  })

  it('applies validation state classes', () => {
    const validWrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        validationState: 'valid'
      }
    })

    expect(validWrapper.find('select').classes()).toContain('is-valid')

    const invalidWrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        validationState: 'invalid'
      }
    })

    expect(invalidWrapper.find('select').classes()).toContain('is-invalid')
  })

  it('renders help text', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        helpText: 'Select one option'
      }
    })

    expect(wrapper.find('.form-text').text()).toBe('Select one option')
  })

  it('renders validation messages', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: [],
        validationState: 'invalid',
        validationMessage: 'This field is required'
      }
    })

    expect(wrapper.find('.invalid-feedback').text()).toBe('This field is required')
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        options: mockOptions,
        modelValue: ''
      }
    })

    const select = wrapper.find('select').element as HTMLSelectElement
    select.selectedIndex = Array.from(select.options).findIndex(o => o.text === 'Option 2')
    await wrapper.find('select').trigger('input')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[][]
    expect(emitted[0][0]).toBe('2')
  })

  it('shows required indicator', () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        id: 'select',
        label: 'Country',
        options: [],
        required: true
      }
    })

    expect(wrapper.find('.text-danger').text()).toBe('*')
  })

  describe('null / undefined / boolean option values', () => {
    it('accepts null value and emits null on selection', async () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: '— None —', value: null },
            { text: 'Alpha', value: 'a' }
          ],
          modelValue: 'a'
        }
      })

      const options = wrapper.findAll('option')
      expect(options).toHaveLength(2)

      const select = wrapper.find('select').element as HTMLSelectElement
      select.selectedIndex = 0
      await wrapper.find('select').trigger('input')
      await wrapper.find('select').trigger('change')

      const emitted = wrapper.emitted('update:modelValue') as unknown[][]
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toBeNull()
    })

    it('accepts undefined value and emits undefined on selection', async () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: '— Not set —', value: undefined },
            { text: 'Beta', value: 'b' }
          ],
          modelValue: 'b'
        }
      })

      const select = wrapper.find('select').element as HTMLSelectElement
      select.selectedIndex = 0
      await wrapper.find('select').trigger('input')

      const emitted = wrapper.emitted('update:modelValue') as unknown[][]
      expect(emitted[0][0]).toBeUndefined()
    })

    it('accepts boolean values and preserves type on emit', async () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: 'Yes', value: true },
            { text: 'No', value: false }
          ],
          modelValue: true
        }
      })

      const select = wrapper.find('select').element as HTMLSelectElement
      select.selectedIndex = 1
      await wrapper.find('select').trigger('input')

      const emitted = wrapper.emitted('update:modelValue') as unknown[][]
      expect(emitted[0][0]).toBe(false)
      expect(typeof emitted[0][0]).toBe('boolean')
    })

    it('preserves selection of null modelValue across renders', () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: '— None —', value: null },
            { text: 'A', value: 'a' }
          ],
          modelValue: null
        }
      })

      const select = wrapper.find('select').element as HTMLSelectElement
      expect(select.selectedIndex).toBe(0)
    })

    it('still emits string values unchanged for plain string options', async () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: mockOptions,
          modelValue: ''
        }
      })

      const select = wrapper.find('select').element as HTMLSelectElement
      // selectedIndex 1 = first real option after no placeholder. With our default-selected nothing, just pick option text 'Option 2'
      const targetIdx = Array.from(select.options).findIndex(o => o.text === 'Option 2')
      select.selectedIndex = targetIdx
      await wrapper.find('select').trigger('input')

      const emitted = wrapper.emitted('update:modelValue') as unknown[][]
      expect(emitted[0][0]).toBe('2')
    })
  })

  describe('C2/C3 sentinel refactor', () => {
    it('does NOT emit NUL bytes in DOM <option> value attribute', () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: 'None', value: null },
            { text: 'Yes', value: true },
            { text: 'A', value: 'a' }
          ]
        }
      })

      const optionEls = Array.from(wrapper.find('select').element.querySelectorAll('option'))
      for (const opt of optionEls) {
        const v = opt.getAttribute('value') ?? ''
        expect(v.includes('\0'), `option value contains NUL byte: ${JSON.stringify(v)}`).toBe(false)
        expect(v.includes('__vibe_null__'), `option value contains in-band sentinel: ${v}`).toBe(false)
      }
    })

    it('disambiguates user-supplied string that previously collided with sentinels', async () => {
      // A consumer with the exact previous sentinel string should NOT decode to null/undefined/bool.
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: 'Real string', value: '__vibe_null__' },
            { text: 'Other', value: 'other' }
          ],
          modelValue: 'other'
        }
      })

      const select = wrapper.find('select').element as HTMLSelectElement
      select.selectedIndex = 0
      await wrapper.find('select').trigger('input')

      const emitted = wrapper.emitted('update:modelValue') as unknown[][]
      expect(emitted[0][0]).toBe('__vibe_null__')
      expect(emitted[0][0]).not.toBeNull()
    })

    it('handles two options with identical values without collision (first wins on encode)', () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: 'Apple A', value: 'fruit' },
            { text: 'Apple B', value: 'fruit' }
          ],
          modelValue: 'fruit'
        }
      })

      const select = wrapper.find('select').element as HTMLSelectElement
      // Either index 0 or 1 selected since values match; first should win.
      expect(select.selectedIndex).toBe(0)
    })

    it('preserves typed primitives across re-render cycles', async () => {
      const wrapper = mount(VibeFormSelect, {
        props: {
          id: 'select',
          options: [
            { text: 'None', value: null },
            { text: 'Zero', value: 0 },
            { text: 'False', value: false }
          ],
          modelValue: 0
        }
      })

      // Switch to false
      const select = wrapper.find('select').element as HTMLSelectElement
      select.selectedIndex = 2
      await wrapper.find('select').trigger('input')

      const emitted = wrapper.emitted('update:modelValue') as unknown[][]
      expect(emitted[0][0]).toBe(false)
      expect(typeof emitted[0][0]).toBe('boolean')

      await wrapper.setProps({ modelValue: null })
      expect(select.selectedIndex).toBe(0)

      await wrapper.setProps({ modelValue: 0 })
      expect(select.selectedIndex).toBe(1)
    })
  })
})
