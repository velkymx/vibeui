import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import pkg from '../../package.json'

// Regression guard: the `types` entry must point at a declaration file that is
// actually emitted into dist. 1.2.0 shipped `./dist/src/index.d.ts` while the
// dts plugin emits `./dist/index.d.ts` at the root — so TypeScript resolved no
// types for any consumer.
describe('package types path', () => {
  const TYPES = './dist/index.d.ts'

  it('`types` points at the emitted declaration entry', () => {
    expect(pkg.types).toBe(TYPES)
  })

  it('`exports["."].types` matches', () => {
    expect((pkg.exports as Record<string, { types?: string }>)['.'].types).toBe(TYPES)
  })

  it('the referenced declaration file exists in the built dist', () => {
    // Only meaningful after a build; skip when dist is absent (fresh checkout/CI pre-build).
    if (!existsSync('dist')) return
    expect(existsSync(pkg.types)).toBe(true)
  })
})
