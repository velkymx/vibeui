import { describe, it, expect, beforeEach } from 'vitest'
import {
  setActiveDrag,
  clearActiveDrag,
  getActiveDrag
} from '../../src/components/dndStore'

describe('dndStore (H15 staleness protection)', () => {
  beforeEach(() => {
    clearActiveDrag()
  })

  it('document dragend clears active state even if no component dragend fires', () => {
    setActiveDrag({ id: 7 }, 'cards')
    expect(getActiveDrag()).toEqual({ payload: { id: 7 }, group: 'cards' })

    document.dispatchEvent(new DragEvent('dragend', { bubbles: true }))

    expect(getActiveDrag()).toBeNull()
  })

  it('document drop also clears active state', () => {
    setActiveDrag('payload', 'g')
    document.dispatchEvent(new DragEvent('drop', { bubbles: true }))
    expect(getActiveDrag()).toBeNull()
  })

  it('does not leak listeners across multiple drag cycles', () => {
    for (let i = 0; i < 5; i++) {
      setActiveDrag(`p${i}`, 'g')
      document.dispatchEvent(new DragEvent('dragend', { bubbles: true }))
      expect(getActiveDrag()).toBeNull()
    }
    // After all the cycles, no stale listener should fire from a stray dragend
    setActiveDrag('persist', 'g')
    expect(getActiveDrag()).toEqual({ payload: 'persist', group: 'g' })
    document.dispatchEvent(new DragEvent('dragend', { bubbles: true }))
    expect(getActiveDrag()).toBeNull()
  })

  it('clearActiveDrag is idempotent', () => {
    clearActiveDrag()
    clearActiveDrag()
    expect(getActiveDrag()).toBeNull()
  })
})
