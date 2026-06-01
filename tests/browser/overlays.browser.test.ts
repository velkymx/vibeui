import { defineComponent, ref } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe } from 'vitest'
import VibeModal from '../../src/components/VibeModal.vue'
import VibeOffcanvas from '../../src/components/VibeOffcanvas.vue'
import VibeToast from '../../src/components/VibeToast.vue'
import { waitForSelector, waitForGone, onceEvent } from './helpers'

describe('VibeModal', () => {
  test('ESC closes the modal and focus returns to the trigger (WCAG 2.4.3)', async () => {
    const Host = defineComponent({
      components: { VibeModal },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button type="button" @click="open = true">Open</button>
          <VibeModal v-model="open" title="Hi">Body</VibeModal>
        </div>`
    })
    const screen = render(Host)
    // The modal element is teleported into the DOM at mount (just not shown). Attach the
    // shown listener before opening so we deterministically wait out the fade transition —
    // pressing ESC mid-transition is a no-op in Bootstrap (hide() guards on _isTransitioning).
    const modalEl = await waitForSelector('.modal')
    const shown = onceEvent(modalEl, 'shown.bs.modal')
    // Clicking focuses the trigger; Bootstrap captures it as the pre-open activeElement.
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await shown
    await userEvent.keyboard('{Escape}')
    await waitForGone('.modal.show')
    await waitForGone('.modal-backdrop')
    expect(document.activeElement?.textContent).toBe('Open')
  })
})

describe('VibeOffcanvas', () => {
  test('opens with a backdrop and ESC closes it', async () => {
    const Host = defineComponent({
      components: { VibeOffcanvas },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button type="button" @click="open = true">Open panel</button>
          <VibeOffcanvas v-model="open" title="Panel">Panel body</VibeOffcanvas>
        </div>`
    })
    const screen = render(Host)
    const offcanvasEl = await waitForSelector('.offcanvas')
    const shown = onceEvent(offcanvasEl, 'shown.bs.offcanvas')
    await userEvent.click(screen.getByRole('button', { name: 'Open panel' }))
    await shown
    await waitForSelector('.offcanvas-backdrop')
    await userEvent.keyboard('{Escape}')
    await waitForGone('.offcanvas.show')
  })
})

describe('VibeToast', () => {
  test('autohide hides the toast after the delay', async () => {
    render(VibeToast, {
      props: { modelValue: true, title: 'Saved', autohide: true, delay: 150 },
      slots: { default: 'Your changes were saved' }
    })
    await waitForSelector('.toast.show')
    // delay (150ms) + Bootstrap fade — generous window via waitForGone's polling.
    await waitForGone('.toast.show')
  })
})
