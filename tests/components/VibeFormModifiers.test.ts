import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormInput from '../../src/components/VibeFormInput.vue'
import VibeFormTextarea from '../../src/components/VibeFormTextarea.vue'
import VibeFormSpinbutton from '../../src/components/VibeFormSpinbutton.vue'

// #148: native v-model modifiers work on VibeUI form inputs.
describe('v-model modifiers (#148)', () => {
  it('VibeFormInput .trim trims the committed value', async () => {
    const wrapper = mount({
      components: { VibeFormInput },
      data: () => ({ v: '' }),
      template: '<VibeFormInput v-model.trim="v" />',
    })
    await wrapper.find('input').setValue('  hi  ')
    const emitted = wrapper.findComponent(VibeFormInput).emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1][0]).toBe('hi')
  })

  it('VibeFormInput .number yields a number, empty stays empty', async () => {
    const wrapper = mount({
      components: { VibeFormInput },
      data: () => ({ v: '' as string | number }),
      template: '<VibeFormInput v-model.number="v" />',
    })
    const input = wrapper.find('input')
    await input.setValue('42')
    let emitted = wrapper.findComponent(VibeFormInput).emitted('update:modelValue') as unknown[][]
    expect(emitted[emitted.length - 1][0]).toBe(42)
    await input.setValue('')
    emitted = wrapper.findComponent(VibeFormInput).emitted('update:modelValue') as unknown[][]
    expect(emitted[emitted.length - 1][0]).toBe('')
  })

  it('VibeFormInput .lazy commits on change, not on input', async () => {
    const wrapper = mount({
      components: { VibeFormInput },
      data: () => ({ v: '' }),
      template: '<VibeFormInput v-model.lazy="v" />',
    })
    // NB: wrapper.setValue() fires both input and change, so drive the native
    // input event directly to prove the commit waits for change.
    const nativeInput = wrapper.find('input')
    ;(nativeInput.element as HTMLInputElement).value = 'abc'
    await nativeInput.trigger('input')
    expect(wrapper.findComponent(VibeFormInput).emitted('update:modelValue')).toBeUndefined()
    await nativeInput.trigger('change')
    const emitted = wrapper.findComponent(VibeFormInput).emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1][0]).toBe('abc')
  })

  it('VibeFormTextarea honors .trim and .lazy', async () => {
    const trimWrapper = mount({
      components: { VibeFormTextarea },
      data: () => ({ v: '' }),
      template: '<VibeFormTextarea v-model.trim="v" />',
    })
    await trimWrapper.find('textarea').setValue('  padded  ')
    const trimEmitted = trimWrapper.findComponent(VibeFormTextarea).emitted('update:modelValue') as string[][]
    expect(trimEmitted[trimEmitted.length - 1][0]).toBe('padded')

    const lazyWrapper = mount({
      components: { VibeFormTextarea },
      data: () => ({ v: '' }),
      template: '<VibeFormTextarea v-model.lazy="v" />',
    })
    const lazyArea = lazyWrapper.find('textarea')
    ;(lazyArea.element as HTMLTextAreaElement).value = 'deferred'
    await lazyArea.trigger('input')
    expect(lazyWrapper.findComponent(VibeFormTextarea).emitted('update:modelValue')).toBeUndefined()
    await lazyArea.trigger('change')
    const lazyEmitted = lazyWrapper.findComponent(VibeFormTextarea).emitted('update:modelValue') as string[][]
    expect(lazyEmitted[lazyEmitted.length - 1][0]).toBe('deferred')
  })

  it('VibeFormSpinbutton .lazy commits on change, not on input', async () => {
    const wrapper = mount({
      components: { VibeFormSpinbutton },
      data: () => ({ v: 0 }),
      template: '<VibeFormSpinbutton v-model.lazy="v" />',
    })
    const spinInput = wrapper.find('input')
    ;(spinInput.element as HTMLInputElement).value = '5'
    await spinInput.trigger('input')
    expect(wrapper.findComponent(VibeFormSpinbutton).emitted('update:modelValue')).toBeUndefined()
    await spinInput.trigger('change')
    const emitted = wrapper.findComponent(VibeFormSpinbutton).emitted('update:modelValue') as number[][]
    expect(emitted[emitted.length - 1][0]).toBe(5)
  })
})
