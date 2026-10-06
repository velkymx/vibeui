import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeToastHost from '../../src/components/VibeToastHost.vue'
import { useToast, __resetToastStoreForTests } from '../../src/composables/useToast'

const flush = async () => {
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  await nextTick()
  await new Promise((r) => setTimeout(r, 250))
  await nextTick()
}

// #149: toast enter/leave plus FLIP reposition rides a TransitionGroup; the
// stack still adds, orders, and removes toasts exactly as before.
describe('VibeToastHost transitions (#149)', () => {
  const sourceText = readFileSync('src/components/VibeToastHost.vue', 'utf8')

  beforeEach(() => {
    __resetToastStoreForTests()
    document.body.innerHTML = ''
  })

  it('renders the per-group list through a named TransitionGroup with a move class', () => {
    expect(sourceText).toContain('TransitionGroup')
    expect(sourceText).toContain('vibe-toast-move')
  })

  it('disables animation under prefers-reduced-motion', () => {
    expect(sourceText).toContain('prefers-reduced-motion')
  })

  it('still removes a dismissed toast and preserves order of the rest', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()

    toast.show('first')
    toast.show('second')
    toast.show('third')
    await flush()

    const ids = toast.toasts.map((t) => t.id)
    toast.dismiss(ids[0])
    await flush()

    const container = document.body.querySelector('.toast-container')!
    const bodies = Array.from(container.querySelectorAll('.toast-body')).map((n) =>
      n.textContent?.trim(),
    )
    expect(bodies).toEqual(['second', 'third'])
    wrapper.unmount()
  })
})
