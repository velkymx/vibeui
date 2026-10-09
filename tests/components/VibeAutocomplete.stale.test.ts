import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeAutocomplete from '../../src/components/VibeAutocomplete.vue'

const flush = async (ms = 0) => {
  await new Promise((r) => setTimeout(r, ms))
  await nextTick()
}

// #150: stale-result handling is a BEHAVIORAL guarantee (last query wins, nothing
// stale renders, nothing renders after unmount), so it is asserted only through
// rendered output and emitted events.
//
// The previous version of this file also asserted the component's source text:
//   expect(readFileSync('...').toContain('onWatcherCleanup'))
//   expect(sourceText).not.toContain('queryToken')
// That tested the implementation, not the behavior: it stayed green if the
// stale-result logic were deleted outright, and it failed on any equally valid
// alternative (request id, AbortController, active flag). Do not reintroduce
// source-text assertions here.
describe('VibeAutocomplete stale handling (#150)', () => {
  const makeControllable = () => {
    const calls: Array<{ query: string; resolve: (v: string[]) => void; reject: (e: unknown) => void }> = []
    const source = (query: string) =>
      new Promise<string[]>((resolve, reject) => {
        calls.push({ query, resolve, reject })
      })
    return { source, calls }
  }

  const mountAC = (source: (q: string) => Promise<string[]>, props: Record<string, unknown> = {}) => {
    const wrapper = mount(VibeAutocomplete, {
      props: { source, minChars: 1, debounce: 0, ...props },
    })
    return { wrapper, input: wrapper.find('input') }
  }

  it('last of three overlapping queries wins regardless of resolve order', async () => {
    const { source, calls } = makeControllable()
    const { wrapper, input } = mountAC(source)

    await input.setValue('a')
    await flush(0)
    await input.setValue('ab')
    await flush(0)
    await input.setValue('abc')
    await flush(0)
    expect(calls.map((c) => c.query)).toEqual(['a', 'ab', 'abc'])

    // Resolve out of order: oldest first, newest last.
    calls[0].resolve(['stale-a'])
    await flush(0)
    calls[1].resolve(['stale-ab'])
    await flush(0)
    expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
    calls[2].resolve(['live-abc'])
    await flush(0)
    expect(wrapper.findAll('.vibe-autocomplete-item').map((i) => i.text())).toEqual([
      'live-abc',
    ])
    wrapper.unmount()
  })

  // Covers the invalidation the manual queryToken previously provided on the
  // clear path: dropping below minChars must discard the in-flight result even
  // though that query itself was scheduled.
  it('discards an in-flight result when the input is cleared below minChars', async () => {
    const { source, calls } = makeControllable()
    const { wrapper, input } = mountAC(source, { minChars: 2 })

    await input.setValue('ab')
    await flush(0)
    expect(calls).toHaveLength(1)

    await input.setValue('a')
    await flush(0)
    expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)

    calls[0].resolve(['should-not-render'])
    await flush(0)
    expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })

  // Covers the unmount guard: a source that resolves after teardown must not
  // write results or throw.
  it('renders nothing when a source resolves after unmount', async () => {
    const { source, calls } = makeControllable()
    const { wrapper, input } = mountAC(source)

    await input.setValue('lon')
    await flush(0)
    expect(calls).toHaveLength(1)

    wrapper.unmount()
    calls[0].resolve(['post-unmount'])
    await flush(10)

    // The wrapper is gone; the assertion is that nothing threw and no select
    // event escaped. A stale-write regression surfaces here as an unhandled
    // error or a stray emit.
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  // #226: a rejecting source emits error (silent close is indistinguishable
  // from no matches, so the consumer needs the signal for retry UI).
  it('emits error when the source rejects', async () => {
    const failing = (_query: string): Promise<string[]> =>
      Promise.reject(new Error('backend 500'))
    const { wrapper, input } = mountAC(failing)

    await input.setValue('abc')
    await flush(10)

    const emitted = wrapper.emitted('error')
    expect(emitted).toBeDefined()
    expect((emitted as unknown[][])[0][0]).toBeInstanceOf(Error)
    expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
    wrapper.unmount()
  })
})
