import { describe, it, expect } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useId } from '../../src/composables/useId'

// #146: useId delegates to Vue's native SSR-safe useId(), keeping the prefix API.
const makeComp = () =>
  defineComponent({
    setup() {
      const id = useId('vibe-test')
      const tick = ref(0)
      return { id, tick }
    },
    template: '<span :data-tick="tick">{{ id }}</span>',
  })

describe('useId (#146)', () => {
  it('returns a non-empty id carrying the prefix', () => {
    const w = mount(makeComp())
    const id = w.text()
    expect(id.startsWith('vibe-test-')).toBe(true)
    expect(id.length).toBeGreaterThan('vibe-test-'.length)
  })

  it('generates distinct ids for sibling instances in the same app', () => {
    const Child = makeComp()
    const Parent = defineComponent({
      components: { Child },
      template: '<div><Child class="a" /><Child class="b" /></div>',
    })
    const w = mount(Parent)
    const a = w.find('.a').text()
    const b = w.find('.b').text()
    expect(a).not.toBe(b)
  })

  it('is stable across re-renders of the same instance', async () => {
    const w = mount(makeComp())
    const first = w.text()
    ;(w.vm as unknown as { tick: number }).tick++
    await nextTick()
    expect(w.text()).toBe(first)
  })
})
