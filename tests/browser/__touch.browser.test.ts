import { test, expect } from 'vitest'

// TEMPORARY diagnostic — removed in the follow-up commit.
// VibeTooltip swaps its trigger from hover to click when it thinks the device is
// touch-capable. Establishing what that heuristic actually sees on CI.
test('probe touch signals', () => {
  const isTouchLegacy = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const info = {
    ontouchstart: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints,
    isTouchLegacy,
    hoverNone: window.matchMedia('(hover: none)').matches,
    pointerCoarse: window.matchMedia('(pointer: coarse)').matches,
    ua: navigator.userAgent.slice(0, 70)
  }
  // Deliberate failure: surfaces the values in the CI log.
  expect(JSON.stringify(info)).toBe('DIAGNOSTIC')
})
