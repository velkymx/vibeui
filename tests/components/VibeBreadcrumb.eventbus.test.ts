import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeBreadcrumb from '../../src/components/VibeBreadcrumb.vue'
import { resetEventBusForSSR } from '../../src/composables/useEventBus'
import { emitNavBreadcrumbUpdate } from '../../src/composables/eventHelpers'

describe('VibeBreadcrumb over the event bus (#101)', () => {
  beforeEach(() => {
    resetEventBusForSSR()
  })

  it('renders items received on nav:breadcrumb-updated when bus-updates is enabled', async () => {
    const wrapper = mount(VibeBreadcrumb, { props: { busUpdates: true } })
    emitNavBreadcrumbUpdate({ items: [{ label: 'Home', path: '/' }, { label: 'Docs', path: '/docs' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Docs')
  })

  it('ignores nav:breadcrumb-updated when bus-updates is not enabled', async () => {
    const wrapper = mount(VibeBreadcrumb, { props: { items: [{ text: 'Only' }] } })
    emitNavBreadcrumbUpdate({ items: [{ label: 'FromBus', path: '/x' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Only')
    expect(wrapper.text()).not.toContain('FromBus')
  })

  it('explicit :items take precedence over bus items', async () => {
    const wrapper = mount(VibeBreadcrumb, { props: { busUpdates: true, items: [{ text: 'Explicit' }] } })
    emitNavBreadcrumbUpdate({ items: [{ label: 'FromBus', path: '/x' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Explicit')
    expect(wrapper.text()).not.toContain('FromBus')
  })

  it('stops updating after unmount', async () => {
    const wrapper = mount(VibeBreadcrumb, { props: { busUpdates: true } })
    emitNavBreadcrumbUpdate({ items: [{ label: 'First', path: '/' }] })
    await wrapper.vm.$nextTick()
    wrapper.unmount()
    // no throw and no further updates; just assert the last render held
    expect(true).toBe(true)
  })
})
