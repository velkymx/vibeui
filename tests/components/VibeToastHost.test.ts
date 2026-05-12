import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeToastHost from '../../src/components/VibeToastHost.vue'
import { useToast, __resetToastStoreForTests } from '../../src/composables/useToast'

const flush = async () => {
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

describe('VibeToastHost (C4)', () => {
  beforeEach(() => {
    __resetToastStoreForTests()
    document.body.innerHTML = ''
  })

  it('renders exactly ONE .toast-container per placement, regardless of toast count', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()

    toast.success('a')
    toast.success('b')
    toast.success('c')
    await flush()

    const containers = document.body.querySelectorAll('.toast-container')
    expect(containers.length).toBe(1)
    wrapper.unmount()
  })

  it('renders multiple .toast elements inside the single container', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()

    toast.show('one')
    toast.show('two')
    toast.show('three')
    await flush()

    const container = document.body.querySelector('.toast-container')!
    expect(container).not.toBeNull()
    const toasts = container.querySelectorAll('.toast')
    expect(toasts.length).toBe(3)
    wrapper.unmount()
  })

  it('renders one container per distinct placement', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()

    toast.show('top', { placement: 'top-end' })
    toast.show('bottom', { placement: 'bottom-start' })
    toast.show('top2', { placement: 'top-end' })
    await flush()

    const containers = Array.from(document.body.querySelectorAll('.toast-container'))
    expect(containers.length).toBe(2)
    // top-end container should hold 2 toasts; bottom-start holds 1
    const bodyTexts = containers.map(c => c.querySelectorAll('.toast').length).sort()
    expect(bodyTexts).toEqual([1, 2])
    wrapper.unmount()
  })

  it('container carries the correct Bootstrap positioning classes for its placement', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()
    toast.show('msg', { placement: 'top-end' })
    await flush()

    const container = document.body.querySelector('.toast-container')!
    expect(container.classList.contains('position-fixed')).toBe(true)
    expect(container.classList.contains('top-0')).toBe(true)
    expect(container.classList.contains('end-0')).toBe(true)
    wrapper.unmount()
  })

  it('toasts in the same container preserve insertion order', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()
    toast.show('first')
    toast.show('second')
    toast.show('third')
    await flush()

    const container = document.body.querySelector('.toast-container')!
    const bodies = Array.from(container.querySelectorAll('.toast-body')).map(n => n.textContent?.trim())
    expect(bodies).toEqual(['first', 'second', 'third'])
    wrapper.unmount()
  })
})
