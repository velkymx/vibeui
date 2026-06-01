import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeModal from '../../src/components/VibeModal.vue'
import * as bootstrap from 'bootstrap'

describe('VibeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeModal, {
      props: {
        title: 'Modal Title',
        teleport: false
      },
      slots: {
        default: 'Modal Body Content'
      }
    })

    expect(wrapper.find('.modal-title').text()).toBe('Modal Title')
    expect(wrapper.find('.modal-body').text()).toBe('Modal Body Content')
  })

  it('applies centered class', () => {
    const wrapper = mount(VibeModal, {
      props: {
        centered: true,
        teleport: false
      }
    })

    expect(wrapper.find('.modal-dialog-centered').exists()).toBe(true)
  })

  it('applies fullscreen class', () => {
    const wrapper = mount(VibeModal, {
      props: {
        fullscreen: true,
        teleport: false
      }
    })

    expect(wrapper.find('.modal-fullscreen').exists()).toBe(true)
  })

  it('does not stack event listeners on re-init (staticBackdrop change)', async () => {
    const wrapper = mount(VibeModal, {
      props: { staticBackdrop: false, teleport: false }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    await wrapper.setProps({ staticBackdrop: true })
    await new Promise(resolve => setTimeout(resolve, 0))

    wrapper.find('.modal').element.dispatchEvent(new Event('shown.bs.modal'))

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual([true])
  })

  it('cleans up on unmount', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Modal).mock.results[0].value

    wrapper.unmount()
    expect(mockInstance.dispose).toHaveBeenCalled()
  })

  // Regression: isUnmounted guard — Bootstrap constructor must not run on a detached
  // element if unmount fires before the dynamic import() microtask resolves.
  it('does not construct Modal after component unmounts during async init', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false }
    })

    // Unmount synchronously before the import() microtask resolves
    wrapper.unmount()

    // Drain microtask queue; isUnmounted guard must block the constructor
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Modal).not.toHaveBeenCalled()
  })

  // WCAG 2.4.3: focus returns to the trigger element after close.
  it('returns focus to the element focused before opening', async () => {
    // A real trigger button in the document that holds focus before the modal opens
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    // attachTo document.body so .focus() actually moves activeElement
    const wrapper = mount(VibeModal, { props: { teleport: false }, attachTo: document.body })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    // show.bs.modal fires while trigger still has focus → captured as preFocusEl
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    // Simulate the modal grabbing focus (close button inside dialog)
    const closeBtn = wrapper.find('.btn-close').element as HTMLElement
    closeBtn.focus()
    expect(document.activeElement).not.toBe(trigger)

    // Close → hidden.bs.modal must restore focus to the trigger
    modalEl.dispatchEvent(new Event('hidden.bs.modal'))
    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
    document.body.removeChild(trigger)
  })
})
