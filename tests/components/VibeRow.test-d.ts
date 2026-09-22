import { describe, it, assertType } from 'vitest'
import type { Tag } from '../../src/types'

describe('Tag type', () => {
  it('accepts "form" so grid components (VibeRow/VibeCol/VibeContainer) can render a <form>', () => {
    // Regression for the 1.1.2 compile bug: `Tag` excluded 'form', so
    // <VibeRow tag="form"> failed vue-tsc with
    // Type '"form"' is not assignable to type 'Tag'.
    assertType<Tag>('form')
  })
})
