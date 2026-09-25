import { describe, it, expect } from 'vitest'
import pkg from '../../package.json'

// Regression guard for the package.json subpath. An `exports` map makes ONLY
// listed subpaths importable, so without an explicit `"./package.json"` entry,
// `require('@velkymx/vibeui/package.json')` / `import '@velkymx/vibeui/package.json'`
// throws ERR_PACKAGE_PATH_NOT_EXPORTED — breaking tooling that reads a
// dependency's manifest (bundler plugins, version tools, some resolvers).
describe('package.json export', () => {
  const exportsMap = pkg.exports as Record<string, unknown>

  it('exposes the package.json subpath', () => {
    expect(exportsMap['./package.json']).toBe('./package.json')
  })
})
