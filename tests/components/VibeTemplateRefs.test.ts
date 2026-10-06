import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

// #151: template refs use useTemplateRef() (Vue 3.5, shallow by default)
// instead of ref(null). Plain state refs are out of scope.
const COMPONENTS = readdirSync('src/components').filter((f) => f.endsWith('.vue'))

// Nullable refs that are plain state, not template refs: must stay ref().
const STATE_REFS = new Set([
  'attachedEl',
  'draggingIndex',
  'focusedIso',
  'activeHandle',
  'loadError',
  'debounceTimer',
  'searchDebounceTimer',
])

describe('template refs (#151)', () => {
  it('no template-ref-shaped ref(null) declarations remain', () => {
    const leftovers: string[] = []
    for (const file of COMPONENTS) {
      const text = readFileSync(`src/components/${file}`, 'utf8')
      for (const match of text.matchAll(/const (\w+) = ref<[^;]+?\| null>\(null\)/g)) {
        if (!STATE_REFS.has(match[1])) leftovers.push(`${file}:${match[1]}`)
      }
    }
    expect(leftovers).toEqual([])
  })

  it('VibeModal resolves its element ref via useTemplateRef', () => {
    const text = readFileSync('src/components/VibeModal.vue', 'utf8')
    expect(text).toContain("useTemplateRef<HTMLElement>('modalRef')")
  })
})
