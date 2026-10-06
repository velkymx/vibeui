import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeAutocomplete from '../../src/components/VibeAutocomplete.vue'

const flush = async (ms = 0) => {
  await new Promise((r) => setTimeout(r, ms))
  await nextTick()
}

// #150: stale-result handling uses the idiomatic watcher-cleanup API instead
// of a manual token counter.
describe('VibeAutocomplete stale handling (#150)', () => {
  // Read from the repo root (vitest runs with cwd at the package root).
  const sourceText = readFileSync('src/components/VibeAutocomplete.vue', 'latin1')

  it('routes invalidation through onWatcherCleanup, not a manual token', () => {
    expect(sourceText).toContain('onWatcherCleanup')
    expect(sourceText).not.toContain('queryToken')
  })

  it('last of three overlapping queries wins regardless of resolve order', async () => {
    const calls: Array<{ query: string; resolve: (v: string[]) => void }> = []
    const source = (query: string) =>
      new Promise<string[]>((resolve) => {
        calls.push({ query, resolve })
      })
    const wrapper = mount(VibeAutocomplete, {
      props: { source, minChars: 1, debounce: 0 },
    })
    const input = wrapper.find('input')

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
  })
})
