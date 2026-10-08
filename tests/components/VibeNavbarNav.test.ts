import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeNavbarNav from '../../src/components/VibeNavbarNav.vue'
import * as bootstrap from 'bootstrap'
import { useEventBus } from '../../src/composables/useEventBus'

const settle = async () => {
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  await nextTick()
}

// The dynamic import resolves slower than a microtask flush in this env;
// teardown races need a generous settle (see the unmount test below).
const settleImport = async () => {
  await new Promise((r) => setTimeout(r, 150))
  await nextTick()
}

// #223: unmount during the in-flight Bootstrap import must construct nothing
// and report nothing (no isUnmounted guard existed; the post-await deref threw
// and surfaced a spurious component-error on healthy teardown).
describe('VibeNavbarNav init liveness (#223)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('constructs dropdowns for rendered toggles when mounted', async () => {
    mount(VibeNavbarNav, {
      props: {
        items: [
          { text: 'Menu', children: [{ text: 'One', href: '/one' }] },
          { text: 'Plain', href: '/plain' }
        ]
      },
      attachTo: document.body
    })
    await settle()
    expect(vi.mocked(bootstrap.Dropdown)).toHaveBeenCalledTimes(1)
  })

  it('unmount mid-import constructs nothing and emits no error', async () => {
    // The error surfaces on the bus (reportComponentError emits to both
    // channels, but test-utils does not record emits after unmount).
    const busSpy = vi.fn()
    useEventBus().on('error:component', busSpy)
    try {
      const wrapper = mount(VibeNavbarNav, {
        props: {
          items: [{ text: 'Menu', children: [{ text: 'One', href: '/one' }] }]
        },
        attachTo: document.body
      })
      // No flush: the dynamic import is still in flight here.
      wrapper.unmount()
      await settleImport()

      expect(vi.mocked(bootstrap.Dropdown)).not.toHaveBeenCalled()
      expect(busSpy).not.toHaveBeenCalled()
    } finally {
      useEventBus().off('error:component', busSpy)
    }
  })
})
