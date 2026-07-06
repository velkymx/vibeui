import { render } from 'vitest-browser-vue'
import { expect, test, describe } from 'vitest'
import VibeFormInput from '../../src/components/VibeFormInput.vue'
import VibeFormTextarea from '../../src/components/VibeFormTextarea.vue'
import VibeAutocomplete from '../../src/components/VibeAutocomplete.vue'
import VibeDatePicker from '../../src/components/VibeDatePicker.vue'
import { waitForSelector } from './helpers'

// WCAG 1.4.3: placeholder text must reach ≥ 4.5:1 contrast. Bootstrap 5.3's own
// `.form-control::placeholder { color: var(--bs-secondary-color); opacity: 1 }`
// provides this (≈ 6.8:1 on white) — this suite is the regression guard proving
// every placeholder-bearing VibeUI control actually receives that rule in a real
// browser with the real Bootstrap CSS loaded (happy-dom can't resolve
// pseudo-element styles). If a future refactor drops `.form-control` from one of
// these inputs, or a scoped style overrides the color, this fails.

// Parse "rgb(r, g, b)" / "rgba(r, g, b, a)" into channels + alpha.
const parseColor = (css: string): { r: number; g: number; b: number; a: number } => {
  const m = css.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
  if (!m) throw new Error(`unparseable color: ${css}`)
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] === undefined ? 1 : Number(m[4]) }
}

// WCAG relative luminance of an sRGB channel triple.
const luminance = (r: number, g: number, b: number): number => {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

// Contrast of the placeholder color composited onto a white input background
// (the Bootstrap light-mode default these tests run under).
const contrastOnWhite = (css: string): number => {
  const { r, g, b, a } = parseColor(css)
  const blend = (c: number) => c * a + 255 * (1 - a)
  const l1 = luminance(blend(r), blend(g), blend(b))
  const l2 = luminance(255, 255, 255)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const assertCompliantPlaceholder = (el: Element) => {
  const cs = getComputedStyle(el, '::placeholder')
  // Bootstrap forces opacity 1 — Firefox's default 0.54 alpha must not survive.
  expect(cs.opacity).toBe('1')
  expect(contrastOnWhite(cs.color)).toBeGreaterThanOrEqual(4.5)
}

describe('placeholder contrast ≥ 4.5:1 (WCAG 1.4.3, real browser)', () => {
  test('VibeFormInput', async () => {
    render(VibeFormInput, { props: { id: 'pc-input', placeholder: 'https://…' } })
    assertCompliantPlaceholder(await waitForSelector('#pc-input'))
  })

  test('VibeFormTextarea', async () => {
    render(VibeFormTextarea, { props: { id: 'pc-textarea', placeholder: 'Your note…' } })
    assertCompliantPlaceholder(await waitForSelector('#pc-textarea'))
  })

  test('VibeAutocomplete input', async () => {
    render(VibeAutocomplete, { props: { id: 'pc-auto', placeholder: 'Search…', source: [] } })
    assertCompliantPlaceholder(await waitForSelector('#pc-auto'))
  })

  test('VibeDatePicker input', async () => {
    render(VibeDatePicker, { props: { id: 'pc-date', placeholder: 'Pick a date' } })
    assertCompliantPlaceholder(await waitForSelector('#pc-date'))
  })
})
