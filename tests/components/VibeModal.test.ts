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

  // Issue 1 — WCAG 2.4.3: auto-focus first form field on open
  it('auto-focuses the first focusable field on open when autoFocus is true (default)', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      slots: { default: '<input id="auto-focus-input" />' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    expect(document.activeElement).toBe(wrapper.find('#auto-focus-input').element)

    wrapper.unmount()
  })

  // V111-8 — button-only modals (delete confirms etc.) must still receive focus:
  // fall back to the first focusable element when there is no form control.
  it('auto-focuses the first focusable element when the modal has no form controls', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false, hideHeader: true, hideFooter: true },
      slots: { default: '<button id="confirm-btn">Delete</button>' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    expect(document.activeElement).toBe(wrapper.find('#confirm-btn').element)

    wrapper.unmount()
  })

  // V111-8 — a disabled input must not swallow autofocus (focus() would no-op).
  it('skips disabled form controls when auto-focusing', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      slots: { default: '<input id="dead-input" disabled /><input id="live-input" />' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    expect(document.activeElement).toBe(wrapper.find('#live-input').element)

    wrapper.unmount()
  })

  it('re-focuses the first field on repeated opens', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      slots: { default: '<input id="reopen-input" />' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    // First open
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))
    expect(document.activeElement).toBe(wrapper.find('#reopen-input').element)

    // Close then reopen
    modalEl.dispatchEvent(new Event('hidden.bs.modal'))
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))
    expect(document.activeElement).toBe(wrapper.find('#reopen-input').element)

    wrapper.unmount()
  })

  it('does not auto-focus when autoFocus prop is false', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()

    const wrapper = mount(VibeModal, {
      props: { teleport: false, autoFocus: false },
      slots: { default: '<input id="no-focus-input" />' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    expect(document.activeElement).not.toBe(wrapper.find('#no-focus-input').element)

    wrapper.unmount()
    document.body.removeChild(outside)
  })

  // Issue 2 — WCAG 2.1.2: focus trap within open modal
  it('Tab from last focusable element wraps to first (focus trap)', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false, hideHeader: true, hideFooter: true },
      slots: { default: '<button id="trap-btn-a">A</button><button id="trap-btn-b">B</button>' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    const btnB = wrapper.find('#trap-btn-b').element as HTMLElement
    btnB.focus()

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    btnB.dispatchEvent(tabEvent)

    expect(document.activeElement).toBe(wrapper.find('#trap-btn-a').element)
    expect(tabEvent.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('Shift+Tab from first focusable element wraps to last (focus trap)', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false, hideHeader: true, hideFooter: true },
      slots: { default: '<button id="trap-btn-c">C</button><button id="trap-btn-d">D</button>' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    const btnC = wrapper.find('#trap-btn-c').element as HTMLElement
    btnC.focus()

    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    btnC.dispatchEvent(shiftTabEvent)

    expect(document.activeElement).toBe(wrapper.find('#trap-btn-d').element)
    expect(shiftTabEvent.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('applies inert to sibling elements of the modal when open', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    // Add a sibling to the modal's DOM parent so we can verify inert is applied
    const modalEl = wrapper.find('.modal').element
    const container = modalEl.parentElement!
    const sibling = document.createElement('div')
    container.appendChild(sibling)

    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    expect((sibling as HTMLElement).inert).toBe(true)

    modalEl.dispatchEvent(new Event('hidden.bs.modal'))

    expect((sibling as HTMLElement).inert).toBe(false)

    sibling.remove()
    wrapper.unmount()
  })

  // Issue 3 — WCAG 2.1.1: Cmd/Ctrl+Enter submits the first form inside the modal
  it('Cmd+Enter submits the first form inside the modal', async () => {
    const submitHandler = vi.fn((e: Event) => e.preventDefault())
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      slots: { default: '<form id="modal-form"><input id="form-input" /><button type="submit">Save</button></form>' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const formEl = wrapper.find('#modal-form').element
    formEl.addEventListener('submit', submitHandler)

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    const input = wrapper.find('#form-input').element as HTMLElement
    input.focus()

    const metaEnter = new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true, cancelable: true })
    input.dispatchEvent(metaEnter)

    expect(submitHandler).toHaveBeenCalledOnce()

    wrapper.unmount()
  })

  it('Ctrl+Enter submits the first form inside the modal', async () => {
    const submitHandler = vi.fn((e: Event) => e.preventDefault())
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      slots: { default: '<form id="ctrl-form"><textarea id="ctrl-textarea"></textarea></form>' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const formEl = wrapper.find('#ctrl-form').element
    formEl.addEventListener('submit', submitHandler)

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    const textarea = wrapper.find('#ctrl-textarea').element as HTMLElement
    textarea.focus()

    const ctrlEnter = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true, cancelable: true })
    textarea.dispatchEvent(ctrlEnter)

    expect(submitHandler).toHaveBeenCalledOnce()

    wrapper.unmount()
  })

  it('does not submit when submitOnMetaEnter is false', async () => {
    const submitHandler = vi.fn((e: Event) => e.preventDefault())
    const wrapper = mount(VibeModal, {
      props: { teleport: false, submitOnMetaEnter: false },
      slots: { default: '<form id="opt-out-form"><input id="opt-out-input" /></form>' },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const formEl = wrapper.find('#opt-out-form').element
    formEl.addEventListener('submit', submitHandler)

    const modalEl = wrapper.find('.modal').element
    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    const input = wrapper.find('#opt-out-input').element as HTMLElement
    input.focus()

    const metaEnter = new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true, cancelable: true })
    input.dispatchEvent(metaEnter)

    expect(submitHandler).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('clears inert from siblings on unmount while modal is open', async () => {
    const wrapper = mount(VibeModal, {
      props: { teleport: false },
      attachTo: document.body
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const modalEl = wrapper.find('.modal').element
    const container = modalEl.parentElement!
    const sibling = document.createElement('div')
    container.appendChild(sibling)

    modalEl.dispatchEvent(new Event('show.bs.modal'))
    modalEl.dispatchEvent(new Event('shown.bs.modal'))

    expect((sibling as HTMLElement).inert).toBe(true)

    // Unmount without closing — inert must still be cleared
    wrapper.unmount()

    expect((sibling as HTMLElement).inert).toBe(false)
    sibling.remove()
  })
})
