import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import VibeButton from '../../src/components/VibeButton.vue'
import VibeLink from '../../src/components/VibeLink.vue'
import VibeNav from '../../src/components/VibeNav.vue'
import VibeNavbarNav from '../../src/components/VibeNavbarNav.vue'
import VibeNavbarBrand from '../../src/components/VibeNavbarBrand.vue'
import VibeListGroup from '../../src/components/VibeListGroup.vue'
import VibeDropdown from '../../src/components/VibeDropdown.vue'
import VibeBreadcrumb from '../../src/components/VibeBreadcrumb.vue'

// These mount against a REAL vue-router rather than a `router-link` stub.
// Stubs render whatever props they are handed, so they cannot catch the class of
// bug this file guards: an explicit `href: undefined` in the fallthrough attrs
// silently erasing the href RouterLink resolved from `to`.
const withRouter = async (Component: unknown, props: Record<string, unknown>) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/target', component: { template: '<div />' } }
    ]
  })
  router.push('/')
  await router.isReady()

  return mount(Component as never, {
    props,
    slots: { default: 'label' },
    global: { plugins: [router] }
  })
}

const routedCases: Array<[string, unknown, Record<string, unknown>]> = [
  ['VibeButton (string to)', VibeButton, { to: '/target' }],
  ['VibeButton (object to)', VibeButton, { to: { path: '/target' } }],
  ['VibeLink (string to)', VibeLink, { to: '/target' }],
  ['VibeLink (object to)', VibeLink, { to: { path: '/target' } }],
  ['VibeNavbarBrand', VibeNavbarBrand, { to: '/target' }],
  ['VibeNav', VibeNav, { items: [{ text: 'label', to: '/target' }] }],
  ['VibeNavbarNav', VibeNavbarNav, { items: [{ text: 'label', to: '/target' }] }],
  ['VibeListGroup', VibeListGroup, { items: [{ text: 'label', to: '/target' }] }],
  ['VibeDropdown', VibeDropdown, { items: [{ text: 'label', to: '/target' }] }],
  ['VibeBreadcrumb', VibeBreadcrumb, { items: [{ text: 'label', to: '/target' }] }]
]

describe('router-link integration: the `to` prop resolves a real href', () => {
  for (const [name, Component, props] of routedCases) {
    it(`${name} renders an anchor with the resolved href`, async () => {
      const wrapper = await withRouter(Component, props)
      const anchor = wrapper.find('a')

      expect(anchor.exists()).toBe(true)
      expect(anchor.attributes('href')).toBe('/target')
    })
  }

  it('VibeButton navigates through the router when clicked', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/target', component: { template: '<div />' } }
      ]
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(VibeButton, {
      props: { to: '/target' },
      slots: { default: 'label' },
      global: { plugins: [router] }
    })

    await wrapper.find('a').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/target')
  })

  it('a plain href still wins over to when both are supplied to VibeButton', async () => {
    const wrapper = await withRouter(VibeButton, { href: '/target', to: '/ignored' })

    expect(wrapper.find('a').attributes('href')).toBe('/target')
    expect(wrapper.find('a').attributes('to')).toBeUndefined()
  })

  it('a disabled VibeButton with to renders no navigable anchor', async () => {
    const wrapper = await withRouter(VibeButton, { to: '/target', disabled: true })

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('span').classes()).toContain('disabled')
  })
})
