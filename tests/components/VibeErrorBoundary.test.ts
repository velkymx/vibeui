import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref, nextTick } from 'vue'
import VibeErrorBoundary from '../../src/components/VibeErrorBoundary.vue'
import { useEventBus, __resetEventBusForTests } from '../../src/composables/useEventBus'

// #157: an error boundary contains a failing subtree, shows a fallback, and
// reports to the error bus, with reset() recovery.
const shouldThrow = ref(true)
const Thrower = defineComponent({
  setup() {
    if (shouldThrow.value) throw new Error('child blew up')
    return () => 'recovered content'
  },
})

describe('VibeErrorBoundary (#157)', () => {
  beforeEach(() => {
    __resetEventBusForTests()
    shouldThrow.value = true
  })

  it('catches a throwing child and renders the default fallback instead', async () => {
    const wrapper = mount(VibeErrorBoundary, {
      slots: { default: Thrower },
    })
    // The capture schedules an async re-render of the fallback branch.
    await nextTick()
    expect(wrapper.text()).not.toContain('child blew up')
    expect(wrapper.find('.alert').exists()).toBe(true)
  })

  it('emits error locally and publishes error:component on the bus', () => {
    const onBus: unknown[] = []
    useEventBus().on('error:component', (payload) => {
      onBus.push(payload)
    })
    const wrapper = mount(VibeErrorBoundary, {
      slots: { default: Thrower },
    })
    const emitted = wrapper.emitted('error') as unknown[][]
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toBeInstanceOf(Error)
    expect(onBus).toHaveLength(1)
    expect(onBus[0]).toMatchObject({ componentName: 'VibeErrorBoundary' })
  })

  it('exposes error and reset to the #fallback scoped slot', async () => {
    const wrapper = mount(VibeErrorBoundary, {
      slots: {
        default: Thrower,
        fallback: '<div class="custom-fallback">oops: {{ error.message }} <button class="retry" @click="reset">retry</button></div>',
      },
    })
    await nextTick()
    expect(wrapper.find('.custom-fallback').exists()).toBe(true)
    expect(wrapper.text()).toContain('oops: child blew up')
  })

  it('reset() clears the error and re-renders recovered content', async () => {
    const wrapper = mount(VibeErrorBoundary, {
      slots: { default: Thrower },
    })
    await nextTick()
    expect(wrapper.find('.alert').exists()).toBe(true)
    shouldThrow.value = false
    ;(wrapper.vm as unknown as { reset: () => void }).reset()
    await nextTick()
    expect(wrapper.text()).toContain('recovered content')
    expect(wrapper.find('.alert').exists()).toBe(false)
  })
})
