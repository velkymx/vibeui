import { describe, it, expect } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useId } from '../../src/composables/useId'

// #146: the internal useId delegates to Vue's native SSR-safe useId(), so
// server-rendered ids are deterministic per app (no module-counter divergence
// between server and client) and unique per instance.
const Single = defineComponent({
  setup() {
    const id = useId('vibe-ssr')
    return () => h('span', { id }, id)
  },
})

const Pair = defineComponent({
  setup() {
    const a = useId('vibe-ssr')
    const b = useId('vibe-ssr')
    return () => h('div', [h('span', { id: a }, a), h('span', { id: b }, b)])
  },
})

const renderOnce = (comp: unknown) => renderToString(createSSRApp(comp as never))

describe('useId SSR (#146)', () => {
  it('renders identical ids across independent SSR passes (hydration-safe)', async () => {
    const first = await renderOnce(Single)
    const second = await renderOnce(Single)
    expect(first).toBe(second)
    expect(first).toContain('vibe-ssr-')
  })

  it('keeps sibling instance ids distinct within one SSR pass', async () => {
    const html = await renderOnce(Pair)
    const ids = [...html.matchAll(/id="(vibe-ssr-[^"]+)"/g)].map((m) => m[1])
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
  })
})
