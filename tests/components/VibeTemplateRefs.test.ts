import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import * as bootstrap from 'bootstrap'
import VibeModal from '../../src/components/VibeModal.vue'
import VibeAlert from '../../src/components/VibeAlert.vue'
import VibeCarousel from '../../src/components/VibeCarousel.vue'
import VibeCollapse from '../../src/components/VibeCollapse.vue'
import VibeOffcanvas from '../../src/components/VibeOffcanvas.vue'
import VibeScrollspy from '../../src/components/VibeScrollspy.vue'

// NOTE: `bootstrap` resolves to tests/mocks/bootstrap.ts via the unit-project
// alias in vite.config.ts. No vi.mock() factory is needed here.

// #151: template refs use useTemplateRef() (Vue 3.5, shallow by default).
//
// The previous version of this file asserted the migration's SOURCE TEXT:
//   expect(readFileSync(...).toContain("useTemplateRef<HTMLElement>('modalRef')"))
//   /ref<[^;]+?\| null>\(null\)/g sweep with a hardcoded STATE_REFS allowlist
// Both were pass-through: they stayed green if the refs were wired wrong, and
// the allowlist turned every future nullable state ref into a confusing
// failure. Assert behavior instead: the ref resolves to a connected element,
// that element is what Bootstrap was constructed against, and teardown after
// unmount is clean.

const settle = async () => {
  await nextTick()
  await new Promise((r) => setTimeout(r, 0))
  await nextTick()
}

// The element each Bootstrap constructor received on its most recent call.
// The mock retains it as `_element` (see tests/mocks/bootstrap.ts).
const lastEl = (ctor: unknown) => {
  const fn = vi.mocked(ctor as { mock: { results: Array<{ value: unknown }> } })
  const result = fn.mock.results[fn.mock.results.length - 1]
  return (result?.value as { _element?: HTMLElement | null } | undefined)?._element
}

describe('useTemplateRef wiring (#151)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('VibeModal hands Bootstrap a connected element, not null', async () => {
    const modalWrapper = mount(VibeModal, { props: { teleport: false, modelValue: false }, attachTo: document.body })
    await settle()
    const el = lastEl(bootstrap.Modal)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el!.isConnected).toBe(true)
    expect(el!.classList.contains('modal')).toBe(true)
    modalWrapper.unmount()
  })

  it('VibeModal disposes after unmount (ref is null during teardown, must not throw)', async () => {
    const wrapper = mount(VibeModal, { props: { teleport: false, modelValue: false } })
    await settle()
    const instance = vi.mocked(bootstrap.Modal).mock.results[0].value as {
      dispose: ReturnType<typeof vi.fn>
    }
    expect(() => wrapper.unmount()).not.toThrow()
    expect(instance.dispose).toHaveBeenCalled()
  })

  it('VibeOffcanvas hands Bootstrap a connected element', async () => {
    const offcanvasWrapper = mount(VibeOffcanvas, { props: { teleport: false }, attachTo: document.body })
    await settle()
    const el = lastEl(bootstrap.Offcanvas)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el!.isConnected).toBe(true)
    offcanvasWrapper.unmount()
  })

  it('VibeCollapse hands Bootstrap a connected element', async () => {
    const collapseWrapper = mount(VibeCollapse, { props: { open: false }, attachTo: document.body })
    await settle()
    const el = lastEl(bootstrap.Collapse)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el!.isConnected).toBe(true)
    collapseWrapper.unmount()
  })

  it('VibeCarousel hands Bootstrap a connected element', async () => {
    const carouselWrapper = mount(VibeCarousel, { props: { items: [{ src: '/a.jpg', alt: 'a' }] }, attachTo: document.body })
    await settle()
    const el = lastEl(bootstrap.Carousel)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el!.isConnected).toBe(true)
    carouselWrapper.unmount()
  })

  it('VibeScrollspy hands Bootstrap a connected element', async () => {
    mount(VibeScrollspy, {
      props: { target: '#list', items: [{ href: '#a', label: 'a' }] },
      attachTo: document.body
    })
    await settle()
    const el = lastEl(bootstrap.ScrollSpy)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el!.isConnected).toBe(true)
  })

  it('VibeAlert hands Bootstrap a connected element', async () => {
    const alertWrapper = mount(VibeAlert, { props: { dismissible: true }, attachTo: document.body })
    await settle()
    const el = lastEl(bootstrap.Alert)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el!.isConnected).toBe(true)
    alertWrapper.unmount()
  })

  // The teardown sweep the old file could not express: unmounting after the ref
  // has gone null must not throw in any component that constructs Bootstrap off
  // a template ref.
  it('every ref-driven component unmounts cleanly after init', async () => {
    const cases: Array<[unknown, Record<string, unknown>]> = [
      [VibeModal, { teleport: false, modelValue: false }],
      [VibeOffcanvas, { teleport: false }],
      [VibeCollapse, { open: false }],
      [VibeAlert, { dismissible: true }],
      [VibeCarousel, { items: [{ src: '/a.jpg', alt: 'a' }] }],
      [VibeScrollspy, { target: '#list', items: [{ href: '#a', label: 'a' }] }]
    ]
    for (const [component, props] of cases) {
      const wrapper = mount(component as never, { props: props as never })
      await settle()
      expect(() => wrapper.unmount()).not.toThrow()
    }
  })
})
