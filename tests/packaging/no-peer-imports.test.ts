import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// The whole point of the consumer-injection design: the library must contain no
// static reference to the optional peers, so a consumer's bundler never tries to
// resolve them (no "Can't resolve 'quill'/'dompurify'" warnings/errors, which
// warnings-as-errors builds turn fatal). This fences that guarantee at the source.

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

describe('no static optional-peer imports in src', () => {
  it('src references neither quill nor dompurify as an import specifier', () => {
    // Exclude ambient .d.ts shims: they are type-only module declarations for the
    // optional peers (`declare module 'quill'`), never emitted or bundled.
    const files = walk('src').filter((f) => /\.(ts|vue)$/.test(f) && !f.endsWith('.d.ts'))
    const patterns = [/['"]quill['"]/, /quill\/dist\/quill\.snow\.css/, /['"]dompurify['"]/]
    const offenders = files.filter((f) => {
      const src = readFileSync(f, 'utf8')
      return patterns.some((re) => re.test(src))
    })
    expect(offenders).toEqual([])
  })
})
