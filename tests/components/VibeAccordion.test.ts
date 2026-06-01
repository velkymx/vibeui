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
