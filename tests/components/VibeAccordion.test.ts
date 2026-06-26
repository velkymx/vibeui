import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeAccordion from '../../src/components/VibeAccordion.vue'
import * as bootstrap from 'bootstrap'

describe('VibeAccordion', () => {
  const mockItems = [
    { id: 'item1', title: 'Title 1', content: 'Content 1' },
    { id: 'item2', title: 'Title 2', content: 'Content 2' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    expect(wrapper.find('.accordion').exists()).toBe(true)
    expect(wrapper.findAll('.accordion-item')).toHaveLength(2)
  })

  it('initializes bootstrap collapse for each item', async () => {
    mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: mockItems
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Collapse).toHaveBeenCalledTimes(2)
  })

  it('shows item when show property is true', async () => {
    mount(VibeAccordion, {
      props: {
        id: 'test-accordion',
        items: [
          { id: 'item1', title: 'T1', content: 'C1', show: true },
          { id: 'item2', title: 'T2', content: 'C2', show: false }
        ]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Check first instance (item1)
    const mockInstance1 = vi.mocked(bootstrap.Collapse).mock.results[0].value
    expect(mockInstance1.show).toHaveBeenCalled()
    
    // Check second instance (item2)
    const mockInstance2 = vi.mocked(bootstrap.Collapse).mock.results[1].value
    expect(mockInstance2.show).not.toHaveBeenCalled()
  })

  it('disposes all Collapse instances and reinits when items array changes', async () => {
    const items = [
      { id: 'item1', title: 'T1', content: 'C1', show: false },
      { id: 'item2', title: 'T2', content: 'C2', show: false }
    ]
    const wrapper = mount(VibeAccordion, {
      props: { id: 'test-accordion', items }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    const instance1 = vi.mocked(bootstrap.Collapse).mock.results[0].value
    const instance2 = vi.mocked(bootstrap.Collapse).mock.results[1].value

    // Replace with a new array (one item removed) — all old instances disposed, remaining reinited fresh
    await wrapper.setProps({ items: [{ id: 'item2', title: 'T2', content: 'C2', show: false }] })
    await new Promise(resolve => setTimeout(resolve, 0))

    // Both instances from the first init are disposed (dispose-all-reinit-all pattern)
    expect(instance1.dispose).toHaveBeenCalled()
    expect(instance2.dispose).toHaveBeenCalled()
    // A new Collapse instance is created for item2 on reinit
    expect(vi.mocked(bootstrap.Collapse)).toHaveBeenCalledTimes(3)
  })

  // Regression: watcher used nextTick(() => initItems()) which drops the inner Promise,
  // silently swallowing errors from initItems. Fixed: async watcher with
  // await nextTick(); await initItems(). This test verifies reinit fully completes.
  it('reinitialises all new items after rapid successive items changes', async () => {
    const items = [
      { id: 'a1', title: 'A1', content: 'C1', show: false },
      { id: 'a2', title: 'A2', content: 'C2', show: false }
    ]
    const wrapper = mount(VibeAccordion, { props: { id: 'acc', items } })
    await new Promise(resolve => setTimeout(resolve, 0))

    // Trigger two rapid items changes — second must not be lost
    const newItems1 = [{ id: 'b1', title: 'B1', content: 'CB1', show: false }]
    const newItems2 = [
      { id: 'b1', title: 'B1', content: 'CB1', show: false },
      { id: 'b2', title: 'B2', content: 'CB2', show: false }
    ]
    await wrapper.setProps({ items: newItems1 })
    await wrapper.setProps({ items: newItems2 })
    await new Promise(resolve => setTimeout(resolve, 0))

    // After settling, both new items must have Collapse instances
    const callCount = vi.mocked(bootstrap.Collapse).mock.calls.length
    // 2 initial + at least 2 for newItems2 (pendingReinit may add more — that's fine)
    expect(callCount).toBeGreaterThanOrEqual(4)
  })

  // CR8-3: isUnmounted guard — Bootstrap.Collapse must not be constructed if the
  // accordion unmounts while the async `import('bootstrap')` is in flight.
  // Without any post-import guard, accordionRef.value.querySelectorAll() throws
  // a TypeError when the ref is null (Vue nulls it after onBeforeUnmount).
  it('does not construct Bootstrap.Collapse when the component unmounts during async init', async () => {
    vi.clearAllMocks()

    const el = document.createElement('div')
    document.body.appendChild(el)

    const wrapper = mount(VibeAccordion, {
      props: { id: 'unmount-race', items: mockItems },
      attachTo: el
    })
    wrapper.unmount()

    await new Promise(resolve => setTimeout(resolve, 0))

    // With isUnmounted guard: Collapse constructor never fires
    expect(bootstrap.Collapse).not.toHaveBeenCalled()

    document.body.removeChild(el)
  })

  // CR8-6: async watcher must catch errors and emit component-error instead of
  // producing an unhandled rejection that Vue silently ignores.
  // Scenario: dispose() throws during watcher-triggered disposal of old instances.
  it('emits component-error instead of unhandled rejection when disposal throws during reinit', async () => {
    // Must use a regular function (not arrow) so `new Collapse(...)` works as a constructor.
    vi.mocked(bootstrap.Collapse).mockImplementation(function() {
      return {
        show: vi.fn(),
        hide: vi.fn(),
        toggle: vi.fn(),
        dispose: vi.fn().mockImplementation(() => { throw new Error('dispose failed') })
      }
    })

    const wrapper = mount(VibeAccordion, { props: { id: 'err-test', items: mockItems } })
    await new Promise(resolve => setTimeout(resolve, 0))

    // Change items — watcher disposes old Collapse instances, dispose() throws
    await wrapper.setProps({ items: [mockItems[0]] })
    await new Promise(resolve => setTimeout(resolve, 0))

    // Without try/catch in the watcher the error is an unhandled rejection and
    // component-error is never emitted. With the fix it is caught and emitted.
    expect(wrapper.emitted('component-error')).toBeTruthy()
  })

  // CR9-5: concurrent dispose+reinit race guard. Two rapid items changes fire two
  // async watcher calls — without reinitGuard the second watcher body may dispose
  // instances that the first watcher's init just created, leaving the accordion broken.
  // With reinitGuard the second watcher body exits immediately, first watcher runs cleanly.
  // Observable proxy: rapid double-change produces no component-error and leaves the
  // component in a valid state with the correct number of Collapse instances.
  it('reinitialises cleanly on rapid successive items changes without error (CR9-5)', async () => {
    // Reset mock to default factory — CR8-6 test may have left a throwing-dispose impl
    vi.mocked(bootstrap.Collapse).mockReset()
    vi.mocked(bootstrap.Collapse).mockImplementation(function() {
      return { show: vi.fn(), hide: vi.fn(), toggle: vi.fn(), dispose: vi.fn() }
    })

    const wrapper = mount(VibeAccordion, {
      props: { id: 'race-test', items: mockItems }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    vi.clearAllMocks()

    // Two rapid setProps — each triggers an async watcher call.
    // Both bodies dispose (first clears Map; second finds it empty) then reinit.
    // Without reinitGuard the second watcher's disposal can interleave with the
    // first's init; with reinitGuard the second body is blocked entirely.
    await wrapper.setProps({ items: [mockItems[0]] })
    await wrapper.setProps({ items: mockItems })
    await new Promise(resolve => setTimeout(resolve, 0))

    // No errors — disposal race must not surface as component-error
    expect(wrapper.emitted('component-error')).toBeFalsy()
    // Component ends in valid state: 2 items → at least 2 Collapse instances created
    expect(vi.mocked(bootstrap.Collapse).mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  // CR9-4: duplicate item.id silently overwrites Map entry, orphaning first element's
  // Collapse instance. Fix: seenIds Set guard in initItems + DEV warning on collision.
  it('warns about duplicate item.id and initialises only the first occurrence', async () => {
    vi.clearAllMocks()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const dupItems = [
      { id: 'dup-id', title: 'First', content: 'Content A' },
      { id: 'dup-id', title: 'Second', content: 'Content B' }
    ]
    mount(VibeAccordion, { props: { id: 'dup-test', items: dupItems } })
    await new Promise(resolve => setTimeout(resolve, 0))

    // Only one Collapse instance created — second duplicate id is skipped
    expect(vi.mocked(bootstrap.Collapse)).toHaveBeenCalledTimes(1)
    // DEV warning names the duplicate id so developer can fix their data
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('dup-id'))
    warnSpy.mockRestore()
  })

  // DEV warning for item.id values that break Bootstrap's querySelector.
  describe('item.id CSS-special-character warning', () => {
    it('warns when an item.id contains CSS-special characters', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(VibeAccordion, {
        props: { items: [{ id: 'bad.id', title: 'T', content: 'C' }] }
      })
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('item.id "bad.id" contains CSS-special characters')
      )
      warnSpy.mockRestore()
    })

    it('does not warn for safe item.id values', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(VibeAccordion, {
        props: { items: [{ id: 'safe-id_1', title: 'T', content: 'C' }] }
      })
      expect(warnSpy).not.toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })
})
