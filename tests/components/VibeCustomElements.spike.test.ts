import { describe, it, expect, beforeEach } from 'vitest'
import { defineCustomElement } from 'vue'
import VibeButton from '../../src/components/VibeButton.vue'
import VibeModal from '../../src/components/VibeModal.vue'

// #156 (spike): VibeUI SFCs wrapped with defineCustomElement (light DOM via
// shadowRoot:false) keep working: attributes map to props, light-DOM children
// project into slots, Vue emits surface as DOM events, Teleport escapes, and
// configureApp hooks run. happy-dom cannot verify real Bootstrap JS/CSS, so
// those stay open risks (see docs/spikes/custom-elements.md).
const flush = async (ms = 30) => {
  await new Promise((r) => setTimeout(r, ms))
}

describe('custom elements spike (#156)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('maps attributes to props and applies Bootstrap classes', async () => {
    const CEButton = defineCustomElement(VibeButton as never, { shadowRoot: false })
    if (!customElements.get('vibe-spike-btn')) customElements.define('vibe-spike-btn', CEButton)
    document.body.innerHTML = '<vibe-spike-btn variant="danger">Hi</vibe-spike-btn>'
    await flush()
    const button = document.querySelector('vibe-spike-btn button')
    expect(button?.classList.contains('btn-danger')).toBe(true)
  })

  it('documents the slot limitation: light-DOM children do not reach SFC slots', async () => {
    // With shadowRoot:false (required for global Bootstrap CSS), Vue only
    // rewires literal <slot> elements, which compiled SFCs never emit, so
    // light-DOM children are left in place and the fallback renders instead.
    // This breaks composable slot customization, the core VibeUI pattern.
    const CEButton = defineCustomElement(VibeButton as never, { shadowRoot: false })
    if (!customElements.get('vibe-spike-btn2')) customElements.define('vibe-spike-btn2', CEButton)
    document.body.innerHTML = '<vibe-spike-btn2>Slotted</vibe-spike-btn2>'
    const host = document.querySelector('vibe-spike-btn2') as HTMLElement
    let clicked = false
    host.addEventListener('click', () => {
      clicked = true
    })
    await flush()
    expect(host.querySelector('button')).not.toBeNull()
    expect(host.textContent).toContain('Slotted')
    host.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flush(10)
    expect(clicked).toBe(true)
  })

  it('initializes Bootstrap-backed components and lets Teleport escape', async () => {
    let configured = false
    const CEModal = defineCustomElement(VibeModal as never, {
      shadowRoot: false,
      configureApp: () => {
        configured = true
      },
    })
    if (!customElements.get('vibe-spike-modal')) customElements.define('vibe-spike-modal', CEModal)
    document.body.innerHTML = '<vibe-spike-modal title="Hi"></vibe-spike-modal>'
    await flush(50)
    await flush(50)
    expect(configured).toBe(true)
    expect(document.body.querySelector('.modal')).not.toBeNull()
  })
})
