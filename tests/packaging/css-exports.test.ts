import { describe, it, expect } from 'vitest'
import pkg from '../../package.json'

// Regression guard for the CSS import path. The package's `exports` map means
// ONLY listed subpaths are importable. Previously the sole CSS entry was the
// phantom `./dist/style.css` (no such physical file), so the real
// `./dist/vibeui.css` and a clean `./style.css` both failed with
// ERR_PACKAGE_PATH_NOT_EXPORTED.
describe('package CSS exports', () => {
  const exportsMap = pkg.exports as Record<string, unknown>

  it('exposes the canonical @velkymx/vibeui/style.css', () => {
    expect(exportsMap['./style.css']).toBe('./dist/vibeui.css')
  })

  it('exposes the real dist/vibeui.css path', () => {
    expect(exportsMap['./dist/vibeui.css']).toBe('./dist/vibeui.css')
  })

  it('keeps the legacy dist/style.css alias for back-compat', () => {
    expect(exportsMap['./dist/style.css']).toBe('./dist/vibeui.css')
  })

  it('declares the top-level style field pointing at the shipped stylesheet', () => {
    expect((pkg as { style?: string }).style).toBe('./dist/vibeui.css')
  })
})
