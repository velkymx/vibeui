import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VibeButton from '../../src/components/VibeButton.vue'
import VibeSpinner from '../../src/components/VibeSpinner.vue'

// #94: async action state. A `loading` prop (controlled) and an `:action` prop
// (auto-runner) give a button a spinner, disabled state, aria-busy, and a
// double-submit guard without hand-wiring a ref on every button.

// Deferred promise helper so a test can hold an action "in flight".
function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe('VibeButton loading (controlled) (#94)', () => {
  it('renders a spinner, disables, and sets aria-busy while loading', () => {
    const wrapper = mount(VibeButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.findComponent(VibeSpinner).exists()).toBe(true)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').attributes('aria-busy')).toBe('true')
  })

  it('ignores clicks while loading', async () => {
    const wrapper = mount(VibeButton, { props: { loading: true }, slots: { default: 'Save' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does not render a spinner or aria-busy when not loading', () => {
    const wrapper = mount(VibeButton, { props: { loading: false }, slots: { default: 'Save' } })
    expect(wrapper.findComponent(VibeSpinner).exists()).toBe(false)
    expect(wrapper.find('button').attributes('aria-busy')).toBeUndefined()
  })
})

describe('VibeButton :action auto-runner (#94)', () => {
  it('calls the action with the click event and shows loading until it resolves', async () => {
    const d = deferred<void>()
    const action = vi.fn(() => d.promise)
    const wrapper = mount(VibeButton, { props: { action }, slots: { default: 'Save' } })

    await wrapper.find('button').trigger('click')
    expect(action).toHaveBeenCalledTimes(1)
    expect(action.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
    expect(wrapper.findComponent(VibeSpinner).exists()).toBe(true)
    expect(wrapper.find('button').attributes('aria-busy')).toBe('true')

    d.resolve()
    await flushPromises()
    expect(wrapper.findComponent(VibeSpinner).exists()).toBe(false)
    expect(wrapper.find('button').attributes('aria-busy')).toBeUndefined()
  })

  it('clears loading and emits component-error when the action rejects', async () => {
    const err = new Error('boom')
    const action = vi.fn(() => Promise.reject(err))
    const wrapper = mount(VibeButton, { props: { action }, slots: { default: 'Save' } })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(VibeSpinner).exists()).toBe(false)
    const emitted = wrapper.emitted('component-error')
    expect(emitted).toHaveLength(1)
    expect((emitted![0][0] as { componentName: string }).componentName).toBe('VibeButton')
    expect((emitted![0][0] as { originalError: unknown }).originalError).toBe(err)
  })

  it('ignores re-entrant clicks while an action is in flight (no double-submit)', async () => {
    const d = deferred<void>()
    const action = vi.fn(() => d.promise)
    const wrapper = mount(VibeButton, { props: { action }, slots: { default: 'Save' } })

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(action).toHaveBeenCalledTimes(1)

    d.resolve()
    await flushPromises()
  })

  it('controlled loading overrides the auto-runner when both are set', async () => {
    const action = vi.fn(() => Promise.resolve())
    const wrapper = mount(VibeButton, { props: { loading: true, action }, slots: { default: 'Save' } })
    await wrapper.find('button').trigger('click')
    expect(action).not.toHaveBeenCalled()
  })
})

describe('VibeButton loadingText (#94)', () => {
  it('swaps the label while loading and restores it after', async () => {
    const d = deferred<void>()
    const action = vi.fn(() => d.promise)
    const wrapper = mount(VibeButton, {
      props: { action, loadingText: 'Saving...' },
      slots: { default: 'Save' },
    })
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.text()).not.toContain('Saving...')

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Saving...')

    d.resolve()
    await flushPromises()
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.text()).not.toContain('Saving...')
  })
})
