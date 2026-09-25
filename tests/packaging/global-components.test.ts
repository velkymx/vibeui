import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'

// Guards the GlobalComponents augmentation (issue #65): every globally registered
// component must be typed for templates, and the augmentation must ship in dist.
describe('GlobalComponents augmentation', () => {
  const registry = readFileSync('src/components/index.ts', 'utf8')
  const augmentation = readFileSync('src/global-components.ts', 'utf8')

  const registered = [...registry.matchAll(/app\.component\('(Vibe\w+)'/g)].map(m => m[1])
  const augmented = [...augmentation.matchAll(/^\s*(Vibe\w+):/gm)].map(m => m[1])

  it('augments Vue GlobalComponents', () => {
    expect(augmentation).toContain('GlobalComponents')
    expect(registered.length).toBeGreaterThan(50)
  })

  it('covers every globally registered component (no drift)', () => {
    const missing = registered.filter(n => !augmented.includes(n))
    const extra = augmented.filter(n => !registered.includes(n))
    expect(missing).toEqual([])
    expect(extra).toEqual([])
  })

  it('ships the declaration in the built dist', () => {
    if (!existsSync('dist')) return
    expect(existsSync('dist/global-components.d.ts')).toBe(true)
  })
})
