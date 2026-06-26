import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormErrorSummary from '../../src/components/VibeFormErrorSummary.vue'

describe('VibeFormErrorSummary', () => {
  it('renders nothing when errors object is empty', () => {
    const wrapper = mount(VibeFormErrorSummary, { props: { errors: {} } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('renders an alert block when errors are present', () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Email is required', name: 'Name is required' } }
    })

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('alert-danger')
  })

  it('renders one list item per non-empty error', () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Email is required', name: 'Name is required' } }
    })

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Email is required')
    expect(items[1].text()).toContain('Name is required')
  })

  it('omits entries with empty string error messages', () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Required', name: '' } }
    })

    expect(wrapper.findAll('li')).toHaveLength(1)
  })

  it('disappears when all errors are cleared', async () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Required' } }
    })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.setProps({ errors: {} })

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('emits focus event with field key when a link is clicked', async () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Email is required' } }
    })

    await wrapper.find('a').trigger('click')

    expect(wrapper.emitted('focus')).toBeTruthy()
    expect(wrapper.emitted('focus')![0]).toEqual(['email'])
  })

  it('each link has href pointing to #field-{key}', () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Required', password: 'Too short' } }
    })

    const links = wrapper.findAll('a')
    expect(links[0].attributes('href')).toBe('#field-email')
    expect(links[1].attributes('href')).toBe('#field-password')
  })

  it('has aria-live="polite" for non-disruptive announcements', () => {
    const wrapper = mount(VibeFormErrorSummary, {
      props: { errors: { email: 'Required' } }
    })

    expect(wrapper.find('[role="alert"]').attributes('aria-live')).toBe('polite')
  })
})
