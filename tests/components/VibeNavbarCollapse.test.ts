import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref, nextTick } from 'vue'
import VibeNavbar from '../../src/components/VibeNavbar.vue'
import VibeNavbarToggle from '../../src/components/VibeNavbarToggle.vue'
import VibeCollapse from '../../src/components/VibeCollapse.vue'
import VibeNavbarNav from '../../src/components/VibeNavbarNav.vue'

describe('VibeNavbar collapse integration', () => {
  it('VibeNavbarToggle toggles VibeCollapse visibility via provide/inject', async () => {
    const wrapper = mount(VibeNavbar, {
      props: { variant: 'dark', expand: 'lg' },
      slots: {
        default: `
          <VibeNavbarToggle target="test-nav" />
          <VibeCollapse id="test-nav" is-nav>
            <span class="inner-content">Hello</span>
          </VibeCollapse>
        `
      },
      global: {
        components: { VibeNavbarToggle, VibeCollapse }
      }
    })

    const collapse = wrapper.find('#test-nav')

    // Initially collapsed (no 'show' class)
    expect(collapse.classes()).toContain('collapse')
    expect(collapse.classes()).not.toContain('show')

    // Click the toggle
    await wrapper.find('.navbar-toggler').trigger('click')

    // Now expanded
    expect(collapse.classes()).toContain('show')

    // Click again to collapse
    await wrapper.find('.navbar-toggler').trigger('click')
    expect(collapse.classes()).not.toContain('show')
  })

  it('VibeCollapse adds navbar-collapse class when isNav is true', () => {
    const wrapper = mount(VibeNavbar, {
      slots: {
        default: `
          <VibeCollapse id="nav1" is-nav>
            <span>Nav content</span>
          </VibeCollapse>
        `
      },
      global: {
        components: { VibeCollapse }
      }
    })

    const collapse = wrapper.find('#nav1')
    expect(collapse.classes()).toContain('navbar-collapse')
    expect(collapse.classes()).toContain('collapse')
  })

  it('VibeCollapse does not add navbar-collapse class when isNav is false', () => {
    const wrapper = mount(VibeCollapse, {
      props: { id: 'plain-collapse' }
    })

    expect(wrapper.classes()).toContain('collapse')
    expect(wrapper.classes()).not.toContain('navbar-collapse')
  })

  it('slot content with v-if reacts to state changes inside VibeCollapse', async () => {
    const TestComponent = defineComponent({
      components: { VibeNavbar, VibeNavbarToggle, VibeCollapse, VibeNavbarNav },
      setup() {
        const isAuthenticated = ref(false)
        return { isAuthenticated }
      },
      template: `
        <VibeNavbar variant="dark" expand="lg">
          <VibeNavbarToggle target="main-nav" />
          <VibeCollapse id="main-nav" is-nav>
            <VibeNavbarNav class="ms-auto">
              <template v-if="isAuthenticated">
                <li class="nav-item">
                  <span class="nav-link auth-content">Logged In</span>
                </li>
              </template>
              <template v-else>
                <li class="nav-item">
                  <span class="nav-link guest-content">Login</span>
                </li>
              </template>
            </VibeNavbarNav>
          </VibeCollapse>
        </VibeNavbar>
      `
    })

    const wrapper = mount(TestComponent)

    // Initially not authenticated — should show guest content
    expect(wrapper.find('.guest-content').exists()).toBe(true)
    expect(wrapper.find('.auth-content').exists()).toBe(false)

    // Change reactive state
    wrapper.vm.isAuthenticated = true
    await nextTick()

    // Should now show authenticated content
    expect(wrapper.find('.auth-content').exists()).toBe(true)
    expect(wrapper.find('.guest-content').exists()).toBe(false)

    // Toggle back
    wrapper.vm.isAuthenticated = false
    await nextTick()

    expect(wrapper.find('.guest-content').exists()).toBe(true)
    expect(wrapper.find('.auth-content').exists()).toBe(false)
  })

  it('computed arrays inside VibeCollapse slot react to changes', async () => {
    const TestComponent = defineComponent({
      components: { VibeNavbar, VibeCollapse, VibeNavbarNav },
      setup() {
        const isAdmin = ref(false)
        const items = ref([
          { text: 'Home', to: '/' }
        ])
        const addAdminItems = () => {
          items.value.push({ text: 'Admin', to: '/admin' })
          isAdmin.value = true
        }
        return { items, isAdmin, addAdminItems }
      },
      template: `
        <VibeNavbar variant="dark" expand="lg">
          <VibeCollapse id="test-nav" is-nav>
            <VibeNavbarNav>
              <li v-for="item in items" :key="item.to" class="nav-item">
                <span class="nav-link">{{ item.text }}</span>
              </li>
            </VibeNavbarNav>
          </VibeCollapse>
        </VibeNavbar>
      `
    })

    const wrapper = mount(TestComponent)

    // Initially one item
    expect(wrapper.findAll('.nav-item')).toHaveLength(1)

    // Add admin items
    wrapper.vm.addAdminItems()
    await nextTick()

    // Should now show two items
    expect(wrapper.findAll('.nav-item')).toHaveLength(2)
    expect(wrapper.findAll('.nav-link')[1].text()).toBe('Admin')
  })

  it('VibeNavbarToggle does not use data-bs-toggle attribute', () => {
    const wrapper = mount(VibeNavbar, {
      slots: {
        default: '<VibeNavbarToggle target="nav" />'
      },
      global: {
        components: { VibeNavbarToggle }
      }
    })

    const button = wrapper.find('.navbar-toggler')
    expect(button.attributes('data-bs-toggle')).toBeUndefined()
    expect(button.attributes('data-bs-target')).toBeUndefined()
  })

  it('VibeNavbarToggle updates aria-expanded reactively', async () => {
    const wrapper = mount(VibeNavbar, {
      slots: {
        default: `
          <VibeNavbarToggle target="test-nav" />
          <VibeCollapse id="test-nav" is-nav>
            <span>Content</span>
          </VibeCollapse>
        `
      },
      global: {
        components: { VibeNavbarToggle, VibeCollapse }
      }
    })

    const toggle = wrapper.find('.navbar-toggler')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('VibeCollapse works standalone with v-model (no VibeNavbar)', async () => {
    const TestComponent = defineComponent({
      components: { VibeCollapse },
      setup() {
        const show = ref(false)
        return { show }
      },
      template: `
        <VibeCollapse id="standalone" v-model="show">
          <span class="content">Collapsible</span>
        </VibeCollapse>
      `
    })

    const wrapper = mount(TestComponent)

    expect(wrapper.find('#standalone').classes()).not.toContain('show')

    wrapper.vm.show = true
    await nextTick()

    expect(wrapper.find('#standalone').classes()).toContain('show')
  })
})
