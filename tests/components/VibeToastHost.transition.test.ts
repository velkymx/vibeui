import { describe, it, expect, beforeEach } from 'vitest'
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

// #149: toast enter/leave plus FLIP reposition rides a TransitionGroup. The stack
// must still add, order, and remove toasts exactly as before.
//
// The previous version of this file asserted the component's source text
// (`toContain('TransitionGroup')`, `toContain('vibe-toast-move')`,
// `toContain('prefers-reduced-motion')`). Those pass whether or not the
// transition works, and cannot observe the real risk: a leave hook that never
// completes strands the node. Assert behavior instead. The CSS-dependent half
// (move class, prefers-reduced-motion) moved to the browser project, because
// the unit project does not compile <style> blocks.
describe('VibeToastHost transitions (#149)', () => {
  beforeEach(() => {
    __resetToastStoreForTests()
    document.body.innerHTML = ''
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

  // The core regression risk of TransitionGroup: the leaving element stays in the
  // DOM until the leave hook completes. Poll for the node to actually be removed
  // so a stranded element fails the suite instead of hiding behind a fixed wait.
  it('fully removes the leaving toast node from the DOM (no stranded element)', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()

    toast.show('only')
    await flush()
    expect(document.body.querySelectorAll('.toast').length).toBe(1)

    toast.dismiss(toast.toasts[0].id)
    await flush()

    const deadline = Date.now() + 2000
    while (document.body.querySelector('.toast') && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 50))
    }
    expect(document.body.querySelector('.toast')).toBeNull()
    wrapper.unmount()
  })

  // Rapid add/remove churns the enter and leave hooks in the same tick range,
  // which is where a TransitionGroup can drop or duplicate nodes.
  it('keeps DOM and model in sync through rapid add/remove churn', async () => {
    const wrapper = mount(VibeToastHost, { attachTo: document.body })
    const toast = useToast()

    for (let i = 0; i < 8; i++) {
      toast.show(`burst-${i}`)
      await nextTick()
    }
    await flush()
    expect(document.body.querySelectorAll('.toast').length).toBe(8)

    // Dismiss every other toast.
    const ids = toast.toasts.map((t) => t.id)
    ids.filter((_, i) => i % 2 === 0).forEach((id) => toast.dismiss(id))
    await flush()

    const deadline = Date.now() + 2000
    while (document.body.querySelectorAll('.toast').length !== 4 && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 50))
    }

    expect(document.body.querySelectorAll('.toast').length).toBe(4)
    const bodies = Array.from(document.body.querySelectorAll('.toast-body')).map((n) =>
      n.textContent?.trim(),
    )
    expect(bodies).toEqual(['burst-1', 'burst-3', 'burst-5', 'burst-7'])
    wrapper.unmount()
  })
})
