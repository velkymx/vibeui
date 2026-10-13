import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDebouncedRef } from '../../src/composables/useDebouncedRef'

// #158: one reusable debounced-ref primitive (customRef-based).
const makeComp = (delay: number | (() => number), initial = '') =>
  defineComponent({
    setup() {
      const debounced = useDebouncedRef(initial, delay)
      const commits: string[] = []
      return { debounced, commits }
    },
    template: '<span>{{ debounced }}</span>',
  })

describe('useDebouncedRef (#158)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not commit until the delay elapses', async () => {
    const w = mount(makeComp(300))
    const vm = w.vm as unknown as { debounced: string }
    vm.debounced = 'a'
    expect(w.text()).toBe('')
    vi.advanceTimersByTime(299)
    expect(w.text()).toBe('')
    vi.advanceTimersByTime(1)
    await w.vm.$nextTick()
    expect(w.text()).toBe('a')
  })

  it('latest write wins across rapid sets', async () => {
    const w = mount(makeComp(200))
    const vm = w.vm as unknown as { debounced: string }
    vm.debounced = 'a'
    vi.advanceTimersByTime(100)
    vm.debounced = 'b'
    vi.advanceTimersByTime(100)
    expect(w.text()).toBe('')
    vi.advanceTimersByTime(100)
    await w.vm.$nextTick()
    expect(w.text()).toBe('b')
  })

  it('commits synchronously when delay <= 0', async () => {
    const w = mount(makeComp(0))
    const vm = w.vm as unknown as { debounced: string }
    vm.debounced = 'now'
    await w.vm.$nextTick()
    expect(w.text()).toBe('now')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reads the delay through a getter on each set', async () => {
    const delay = ref(300)
    const w = mount(makeComp(() => delay.value))
    const vm = w.vm as unknown as { debounced: string }
    delay.value = 0
    vm.debounced = 'fast'
    await w.vm.$nextTick()
    expect(w.text()).toBe('fast')
  })

  it('clears a pending timer on scope dispose (no post-unmount commit)', async () => {
    const w = mount(makeComp(300))
    const vm = w.vm as unknown as { debounced: string }
    vm.debounced = 'stale'
    w.unmount()
    vi.advanceTimersByTime(1000)
    expect(vi.getTimerCount()).toBe(0)
  })
})
