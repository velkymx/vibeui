import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import VibeSkeleton from '../../src/components/VibeSkeleton.vue'

describe('VibeSkeleton', () => {
  describe('text variant', () => {
    it('renders single text line by default', () => {
      const wrapper = mount(VibeSkeleton)
      const lines = wrapper.findAll('.vibe-skeleton')
      expect(lines).toHaveLength(1)
      expect(lines[0].classes()).toContain('vibe-skeleton-text')
    })

    it('renders N lines when lines prop is set', () => {
      const wrapper = mount(VibeSkeleton, { props: { lines: 3 } })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines).toHaveLength(3)
    })

    it('last line is shorter when lines > 1', () => {
      const wrapper = mount(VibeSkeleton, { props: { lines: 3 } })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines[lines.length - 1].classes()).toContain('vibe-skeleton-text-last')
    })
  })

  describe('rect variant', () => {
    it('applies rect class', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'rect' } })
      expect(wrapper.find('.vibe-skeleton').classes()).toContain('vibe-skeleton-rect')
    })

    it('applies width and height styles', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'rect', width: '200px', height: '120px' }
      })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('200px')
      expect(el.style.height).toBe('120px')
    })

    it('numeric width/height becomes pixels', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'rect', width: 200, height: 100 }
      })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('200px')
      expect(el.style.height).toBe('100px')
    })
  })

  describe('circle variant', () => {
    it('applies circle class', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'circle' } })
      expect(wrapper.find('.vibe-skeleton').classes()).toContain('vibe-skeleton-circle')
    })

    it('a circle with width sets height to match (1:1)', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'circle', width: 64 } })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('64px')
      expect(el.style.height).toBe('64px')
    })

    it('M18 — circle respects explicit height when both width and height set', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'circle', width: 64, height: 32 }
      })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('64px')
      expect(el.style.height).toBe('32px')
    })
  })

  describe('card variant', () => {
    it('renders a structured card skeleton (image + lines)', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'card' } })
      expect(wrapper.find('.vibe-skeleton-card').exists()).toBe(true)
      expect(wrapper.find('.vibe-skeleton-rect').exists()).toBe(true)
      expect(wrapper.findAll('.vibe-skeleton-text').length).toBeGreaterThan(0)
    })
  })

  describe('animation', () => {
    it('animated by default', () => {
      const wrapper = mount(VibeSkeleton)
      expect(wrapper.find('.vibe-skeleton').classes()).toContain('vibe-skeleton-animated')
    })

    it('animated=false drops the animation class', () => {
      const wrapper = mount(VibeSkeleton, { props: { animated: false } })
      expect(wrapper.find('.vibe-skeleton').classes()).not.toContain('vibe-skeleton-animated')
    })
  })

  describe('accessibility', () => {
    it('has aria-busy and role=status', () => {
      const wrapper = mount(VibeSkeleton)
      const el = wrapper.find('.vibe-skeleton').element
      expect(el.getAttribute('aria-busy')).toBe('true')
      expect(el.getAttribute('role')).toBe('status')
    })
  })

  describe('attribute fallthrough', () => {
    // Multi-root (text fragment) and single-root variants must both forward
    // consumer-supplied attrs/class instead of silently dropping them.
    it('forwards class and data-* to the first line of the text variant', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'text', lines: 3 },
        attrs: { class: 'my-skeleton', 'data-testid': 'sk' }
      })
      const first = wrapper.findAll('.vibe-skeleton-text')[0]
      expect(first.classes()).toContain('my-skeleton')
      expect(first.attributes('data-testid')).toBe('sk')
    })

    // CR9-19: v-bind="$attrs" was conditional on i === 1, so lines 2+ never
    // received consumer class/data-* attrs. Applying $attrs to all lines means
    // styling, accessibility attrs, and data attributes propagate uniformly.
    it('forwards class and data-* to ALL lines of the text variant (CR9-19)', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'text', lines: 3 },
        attrs: { class: 'my-skeleton', 'data-testid': 'sk' }
      })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines).toHaveLength(3)
      for (const line of lines) {
        expect(line.classes()).toContain('my-skeleton')
        expect(line.attributes('data-testid')).toBe('sk')
      }
    })

    it('forwards class and data-* to the rect variant root', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'rect' },
        attrs: { class: 'my-skeleton', 'data-testid': 'sk' }
      })
      const root = wrapper.find('.vibe-skeleton-rect')
      expect(root.classes()).toContain('my-skeleton')
      expect(root.attributes('data-testid')).toBe('sk')
    })

    it('forwards class and data-* to the card variant root', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'card' },
        attrs: { class: 'my-skeleton', 'data-testid': 'sk' }
      })
      const root = wrapper.find('.vibe-skeleton-card')
      expect(root.classes()).toContain('my-skeleton')
      expect(root.attributes('data-testid')).toBe('sk')
    })
  })

  // #193: freeform width/height strings are untrusted. expression()/url()
  // payloads must be dropped before :style; valid values still render.
  describe('untrusted dimension strings (#193)', () => {
    it('drops expression() and url() widths on the rect variant', () => {
      // happy-dom parses :style, so syntactically invalid values never reach
      // the attribute even pre-fix. calc() is valid CSS but outside the
      // safeLength allowlist: it renders pre-fix and is dropped post-fix,
      // which is what makes this test discriminate.
      for (const payload of ['expression(alert(1))', 'url(https://evil/x)', 'calc(100% - 10px)']) {
        const wrapper = mount(VibeSkeleton, {
          props: { variant: 'rect', width: payload, height: payload }
        })
        const style = wrapper.find('.vibe-skeleton-rect').attributes('style') ?? ''
        expect(style).not.toContain('expression')
        expect(style).not.toContain('url(')
        expect(style).not.toContain('calc(')
      }
    })

    it('keeps valid widths and drops non-finite numbers', () => {
      const ok = mount(VibeSkeleton, { props: { variant: 'rect', width: '200px', height: 100 } })
      const el = ok.find('.vibe-skeleton-rect').element as HTMLElement
      expect(el.style.width).toBe('200px')
      expect(el.style.height).toBe('100px')

      const bad = mount(VibeSkeleton, {
        props: { variant: 'rect', width: Number.NaN as unknown as number }
      })
      expect((bad.find('.vibe-skeleton-rect').element as HTMLElement).style.width).toBe('')
    })
  })

  // #189: unique attrs (id), live-region semantics (role/aria-busy), and
  // listeners must land on exactly one line. class/style keep the CR9-19
  // uniform fallthrough on all lines; everything else binds once.
  describe('unique attrs bind once (#189)', () => {
    it('renders one id and one live region for lines=3', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'text', lines: 3 },
        attrs: { id: 'sk-one' }
      })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines).toHaveLength(3)
      expect(lines.filter((l) => l.attributes('id') === 'sk-one')).toHaveLength(1)
      expect(lines.filter((l) => l.attributes('role') === 'status')).toHaveLength(1)
      expect(lines.filter((l) => l.attributes('aria-busy') === 'true')).toHaveLength(1)
    })

    it('fires a click listener once, not once per line', async () => {
      let calls = 0
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'text', lines: 3 },
        attrs: { onClick: () => { calls += 1 } }
      })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines).toHaveLength(3)
      for (const line of lines) {
        await line.trigger('click')
      }
      expect(calls).toBe(1)
    })
  })

  // #228: the text loop must bind stable computed models, not fresh call
  // results plus object literals per line per render. Structural contract:
  // the template loop contains no function calls.
  describe('text loop memoization (#228)', () => {
    const textLoopOf = (): string => {
      const src = readFileSync('src/components/VibeSkeleton.vue', 'utf8')
      const start = src.indexOf('<template>')
      const end = src.indexOf('</template>')
      const tpl = src.slice(start, end)
      return tpl.slice(tpl.indexOf('v-for="i in lineCount"'))
    }

    it('binds precomputed line models instead of per-line calls', () => {
      const loop = textLoopOf()
      expect(loop).not.toContain('lineAttrs(')
      expect(loop).not.toContain('toCss(')
    })

    it('renders identical output for multi-line text with attrs', () => {
      const props = { lines: 3, width: 200, height: 14, animated: true }
      const attrs = { class: 'extra', 'data-x': '1', id: 'sk1' }
      const a = mount(VibeSkeleton, { props, attrs })
      const b = mount(VibeSkeleton, { props, attrs })
      expect(a.html()).toBe(b.html())
      const lines = a.findAll('.vibe-skeleton-text')
      expect(lines).toHaveLength(3)
      expect(lines[2].classes()).toContain('vibe-skeleton-text-last')
      expect(lines[0].attributes('id')).toBe('sk1')
      expect(lines[0].attributes('data-x')).toBe('1')
      expect(lines[1].attributes('id')).toBeUndefined()
      a.unmount()
      b.unmount()
    })
  })
})
