import { render } from 'vitest-browser-vue'
import { expect, test, describe, afterEach } from 'vitest'
import VibeBadge from '../../src/components/VibeBadge.vue'
import { waitForSelector } from './helpers'

// WCAG 1.4.3: badge text must reach ≥ 4.5:1 against its own background. The bare
// `.bg-{variant}` on top of `.badge`'s default `color:#fff` rendered white on
// light/warning/info (unreadable). VibeBadge now emits Bootstrap 5.3's
// `.text-bg-{variant}`, whose foreground is contrast-computed per variant. This
// suite proves every variant clears 4.5:1 in a real browser with real Bootstrap
// CSS (happy-dom can't resolve these computed colors).

const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'] as const

const parseColor = (css: string): { r: number; g: number; b: number; a: number } => {
  const m = css.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
  if (!m) throw new Error(`unparseable color: ${css}`)
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] === undefined ? 1 : Number(m[4]) }
}

const luminance = (r: number, g: number, b: number): number => {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

// Contrast of foreground text (possibly translucent) composited over its solid
// background color.
const contrast = (fg: string, bg: string): number => {
  const f = parseColor(fg)
  const b = parseColor(bg)
  const comp = (fc: number, bc: number) => fc * f.a + bc * (1 - f.a)
  const l1 = luminance(comp(f.r, b.r), comp(f.g, b.g), comp(f.b, b.b))
  const l2 = luminance(b.r, b.g, b.b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const assertBadgeContrast = async (id: string) => {
  const el = await waitForSelector(`#${id}`)
  const cs = getComputedStyle(el)
  expect(contrast(cs.color, cs.backgroundColor)).toBeGreaterThanOrEqual(4.5)
}

afterEach(() => {
  document.documentElement.removeAttribute('data-bs-theme')
})

describe('badge text contrast ≥ 4.5:1 (WCAG 1.4.3, real browser)', () => {
  for (const variant of variants) {
    test(`${variant} — light mode`, async () => {
      // `id` is not a declared prop, so Vue routes it to $attrs → onto the badge element.
      render(VibeBadge, { props: { variant, id: `badge-${variant}` }, slots: { default: 'Badge' } })
      await assertBadgeContrast(`badge-${variant}`)
    })
  }

  for (const variant of variants) {
    test(`${variant} — dark mode`, async () => {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
      render(VibeBadge, { props: { variant, id: `badge-dark-${variant}` }, slots: { default: 'Badge' } })
      await assertBadgeContrast(`badge-dark-${variant}`)
    })
  }
})
