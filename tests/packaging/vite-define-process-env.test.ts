import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// #297: @tanstack/table-core reads process.env.NODE_ENV at runtime and the
// main library build bundles it inline, so without a build-time replacement
// the shipped ESM/UMD bundles throw `ReferenceError: process is not defined`
// for plain-browser (no bundler) consumers on the first DataTable mount.
// This fences the build-time replacement at the source.
describe('vite build replaces process.env.NODE_ENV (#297)', () => {
  const config = readFileSync('vite.config.ts', 'utf8')

  it('defines process.env.NODE_ENV for the library build', () => {
    expect(config).toContain('process.env.NODE_ENV')
  })

  it('replaces it with the production literal', () => {
    expect(config).toMatch(/process\.env\.NODE_ENV.*production/)
  })
})
