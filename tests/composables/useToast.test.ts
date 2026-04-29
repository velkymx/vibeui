import { describe, it, expect, beforeEach } from 'vitest'
import { useToast, __resetToastStoreForTests, __toastStore } from '../../src/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    __resetToastStoreForTests()
  })

  it('show pushes a toast onto the store with auto-generated id', () => {
    const { show } = useToast()
    const spec = show('Hello')

    expect(__toastStore.toasts).toHaveLength(1)
    expect(__toastStore.toasts[0].id).toBe(spec.id)
    expect(spec.id).toMatch(/^vibe-toast-\d+$/)
    expect(spec.body).toBe('Hello')
  })

  it('honors caller-provided id', () => {
    const { show } = useToast()
    const spec = show('x', { id: 'my-toast' })
    expect(spec.id).toBe('my-toast')
  })

  it.each([
    ['success', 'success'],
    ['error', 'danger'],
    ['warn', 'warning'],
    ['info', 'info']
  ] as const)('%s sets variant to %s', (method, variant) => {
    const api = useToast()
    const spec = api[method]('msg')
    expect(spec.variant).toBe(variant)
  })

  it('passes through title, placement, autohide, delay', () => {
    const { show } = useToast()
    const spec = show('msg', {
      title: 'T',
      placement: 'bottom-start',
      autohide: false,
      delay: 9000
    })
    expect(spec).toMatchObject({
      title: 'T',
      placement: 'bottom-start',
      autohide: false,
      delay: 9000
    })
  })

  it('dismiss removes a toast by id and returns true', () => {
    const { show, dismiss } = useToast()
    const a = show('a')
    show('b')

    expect(__toastStore.toasts).toHaveLength(2)
    expect(dismiss(a.id)).toBe(true)
    expect(__toastStore.toasts).toHaveLength(1)
    expect(__toastStore.toasts[0].body).toBe('b')
  })

  it('dismiss returns false for unknown id without mutating store', () => {
    const { show, dismiss } = useToast()
    show('a')
    expect(dismiss('nope')).toBe(false)
    expect(__toastStore.toasts).toHaveLength(1)
  })

  it('clear empties the store', () => {
    const { show, clear } = useToast()
    show('a')
    show('b')
    clear()
    expect(__toastStore.toasts).toHaveLength(0)
  })

  it('toasts accessor returns the current list (read-only view)', () => {
    const { show, toasts } = useToast()
    show('a')
    show('b')
    expect(toasts).toHaveLength(2)
    expect(toasts[0].body).toBe('a')
  })

  it('multiple useToast() calls share the same store', () => {
    const a = useToast()
    const b = useToast()
    a.show('from-a')
    b.show('from-b')
    expect(__toastStore.toasts.map(t => t.body)).toEqual(['from-a', 'from-b'])
  })

  it('id counter is stable within a session', () => {
    const { show } = useToast()
    const s1 = show('1')
    const s2 = show('2')
    expect(s2.id).not.toBe(s1.id)
  })
})
