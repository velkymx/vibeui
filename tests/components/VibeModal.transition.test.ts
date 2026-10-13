import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeModal from '../../src/components/VibeModal.vue'
import * as bootstrap from 'bootstrap'

const flush = async () => {
  await new Promise((r) => setTimeout(r, 0))
}

interface MockModal {
  show: ReturnType<typeof vi.fn>
  hide: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
  handleUpdate: ReturnType<typeof vi.fn>
}

const instanceOf = () =>
  vi.mocked(bootstrap.Modal).mock.results[0].value as unknown as MockModal

const mountClosed = async () => {
  const wrapper = mount(VibeModal, {
    props: { title: 't', teleport: false },
    attachTo: document.body,
  })
  await flush()
  return { wrapper, el: wrapper.find('.modal').element }
}

// #183: Bootstrap drops show()/hide() issued mid-transition. Intents arriving
// mid-transition must be honored once the transition settles, not lost.
describe('VibeModal transition intent (#183)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('honors a close requested during the opening transition', async () => {
    const { wrapper, el } = await mountClosed()
    const inst = instanceOf()

    // Open starts a transition; close arrives before it settles.
    await wrapper.setProps({ modelValue: true })
    expect(inst.show).toHaveBeenCalledTimes(1)
    await wrapper.setProps({ modelValue: false })

    // The in-flight transition settles: the queued close must run exactly once.
    el.dispatchEvent(new Event('show.bs.modal'))
    el.dispatchEvent(new Event('shown.bs.modal'))
    expect(inst.hide).toHaveBeenCalledTimes(1)
    el.dispatchEvent(new Event('hide.bs.modal'))
    el.dispatchEvent(new Event('hidden.bs.modal'))
    expect(wrapper.emitted('hidden')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('queues an Escape pressed during the opening transition', async () => {
    const { wrapper, el } = await mountClosed()
    const inst = instanceOf()

    // Open starts a transition; Escape arrives before it settles.
    await wrapper.setProps({ modelValue: true })
    expect(inst.show).toHaveBeenCalledTimes(1)
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(inst.hide).not.toHaveBeenCalled()

    // The in-flight transition settles: the queued close must run exactly once.
    el.dispatchEvent(new Event('show.bs.modal'))
    el.dispatchEvent(new Event('shown.bs.modal'))
    expect(inst.hide).toHaveBeenCalledTimes(1)
    el.dispatchEvent(new Event('hide.bs.modal'))
    el.dispatchEvent(new Event('hidden.bs.modal'))
    expect(wrapper.emitted('hidden')).toHaveLength(1)
    wrapper.unmount()
  })

  it('catches Escape at document level while focus sits outside mid-transition', async () => {
    const { wrapper, el } = await mountClosed()
    const inst = instanceOf()

    // Open starts a transition; focus stays on the trigger outside the modal,
    // so only a document-level listener can observe the Escape keypress.
    await wrapper.setProps({ modelValue: true })
    expect(inst.show).toHaveBeenCalledTimes(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(inst.hide).not.toHaveBeenCalled()

    // The in-flight transition settles: the queued close must run exactly once.
    el.dispatchEvent(new Event('show.bs.modal'))
    el.dispatchEvent(new Event('shown.bs.modal'))
    expect(inst.hide).toHaveBeenCalledTimes(1)
    el.dispatchEvent(new Event('hide.bs.modal'))
    el.dispatchEvent(new Event('hidden.bs.modal'))
    expect(wrapper.emitted('hidden')).toHaveLength(1)
    wrapper.unmount()
  })

  it('defers an open requested during the closing transition', async () => {
    const { wrapper, el } = await mountClosed()
    const inst = instanceOf()
    await wrapper.setProps({ modelValue: true })
    el.dispatchEvent(new Event('show.bs.modal'))
    el.dispatchEvent(new Event('shown.bs.modal'))
    expect(inst.show).toHaveBeenCalledTimes(1)

    // Close starts a transition; reopen arrives mid-flight and must wait.
    await wrapper.setProps({ modelValue: false })
    expect(inst.hide).toHaveBeenCalledTimes(1)
    ;(wrapper.vm as unknown as { show: () => void }).show()
    expect(inst.show).toHaveBeenCalledTimes(1)

    // The in-flight transition settles: the queued open runs, then completes.
    el.dispatchEvent(new Event('hidden.bs.modal'))
    expect(inst.show).toHaveBeenCalledTimes(2)
    el.dispatchEvent(new Event('show.bs.modal'))
    el.dispatchEvent(new Event('shown.bs.modal'))
    expect(wrapper.emitted('shown')).toHaveLength(2)
    wrapper.unmount()
  })
})
