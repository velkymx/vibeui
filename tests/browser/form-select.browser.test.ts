import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormSelect from '../../src/components/VibeFormSelect.vue'

// Selectedness in VibeFormSelect is applied imperatively after the options are in the
// DOM. These tests run the real engine so the behaviour is confirmed against a browser's
// actual "ask for a reset" semantics, not a DOM emulator's approximation of them.
describe('VibeFormSelect in a real browser', () => {
  const mounted: Array<{ unmount: () => void }> = []
  const mountSelect = (props: Record<string, unknown>, attrs: Record<string, unknown> = {}) => {
    const wrapper = mount(VibeFormSelect, { props, attrs, attachTo: document.body })
    mounted.push(wrapper)
    return wrapper
  }

  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('renders the real option values as DOM attributes', () => {
    const wrapper = mountSelect({
      options: [
        { value: 'alpha', text: 'A' },
        { value: 42, text: 'B' },
        { value: 'plain-string', text: 'C' }
      ]
    })

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(Array.from(select.options).map(o => o.getAttribute('value')))
      .toEqual(['alpha', '42', 'plain-string'])
    expect(select.querySelector('option[value="alpha"]')).not.toBeNull()
  })

  it('submits the real value, not an internal encoding', () => {
    const wrapper = mountSelect(
      { options: [{ value: 'alpha', text: 'A' }, { value: 'beta', text: 'B' }], modelValue: 'beta' },
      { name: 'choice' }
    )

    const select = wrapper.find('select').element as HTMLSelectElement
    const form = document.createElement('form')
    select.parentNode!.insertBefore(form, select)
    form.appendChild(select)

    expect(new FormData(form).get('choice')).toBe('beta')
  })

  it('selects the matching option even when later options are appended after it', () => {
    const wrapper = mountSelect({
      options: [{ value: null, text: 'None' }, { value: 'a', text: 'A' }],
      modelValue: null
    })

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.selectedIndex).toBe(0)
  })

  it('round-trips typed primitives through a real change event', async () => {
    const wrapper = mountSelect({
      options: [{ value: null, text: 'None' }, { value: 0, text: 'Zero' }, { value: false, text: 'False' }],
      modelValue: 0
    })

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.selectedIndex).toBe(1)

    select.selectedIndex = 2
    select.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()

    const emitted = wrapper.emitted('update:modelValue') as unknown[][]
    expect(emitted[0][0]).toBe(false)
    expect(typeof emitted[0][0]).toBe('boolean')
  })

  it('falls back to the placeholder when the model matches no option', async () => {
    const wrapper = mountSelect({
      placeholder: 'Pick one',
      options: [{ value: '', text: 'Empty' }, { value: 'real', text: 'Real' }],
      modelValue: ''
    })

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.selectedIndex).toBe(1)

    await wrapper.setProps({ modelValue: 'no-match-anywhere' })
    expect(select.selectedIndex).toBe(0)
  })

  it('applies multi-select selection across the whole model array', () => {
    const wrapper = mountSelect({
      multiple: true,
      options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }, { value: 'c', text: 'C' }],
      modelValue: ['a', 'c']
    })

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(Array.from(select.selectedOptions).map(o => o.textContent?.trim())).toEqual(['A', 'C'])
  })
})
