import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { registerModal } from '../../src/composables/modalChannel'
import { registerOffcanvas } from '../../src/composables/offcanvasChannel'
import { useEventBus, emitEvent, resetEventBusForSSR } from '../../src/composables/useEventBus'
import { useColorMode, _resetColorMode } from '../../src/composables/useColorMode'

// #231: one documented reset call must clear bus handlers, both channel
// registries (plus sidebarId), and theme state, so per-request SSR data never
// leaks across requests sharing one Node process.
describe('SSR isolation (#231)', () => {
  beforeEach(() => {
    _resetColorMode()
  })

  it('routes modal commands to error:unhandled after reset (no stale controller)', () => {
    const open = vi.fn()
    registerModal('req-a-modal', { open, close: vi.fn() })

    resetEventBusForSSR()

    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('modal:open', { id: 'req-a-modal' })
    off()

    expect(open).not.toHaveBeenCalled()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'modal:open', id: 'req-a-modal' })
  })

  it('drops the offcanvas sidebar designation on reset', () => {
    const toggle = vi.fn()
    registerOffcanvas('req-a-sidebar', { open: vi.fn(), close: vi.fn(), toggle }, true)

    resetEventBusForSSR()

    const onUnhandled = vi.fn()
    const off = useEventBus().on('error:unhandled', onUnhandled)
    emitEvent('layout:sidebar-toggle')
    off()

    expect(toggle).not.toHaveBeenCalled()
    expect(onUnhandled).toHaveBeenCalledTimes(1)
    expect(onUnhandled.mock.calls[0][0]).toMatchObject({ event: 'layout:sidebar-toggle' })
  })

  it('restores theme isolation on reset (mode auto, init latch cleared)', () => {
    const { setColorMode, initColorMode, colorMode } = useColorMode()
    setColorMode('dark')
    expect(colorMode.value).toBe('dark')

    resetEventBusForSSR()
    expect(colorMode.value).toBe('auto')

    // The init latch cleared: storage still holds dark, so a re-run restores
    // it. A stuck latch would early-return and leave auto.
    initColorMode()
    expect(colorMode.value).toBe('dark')
  })

  // Structural CONTRACT (not behavioral): the unit harness defines
  // import.meta.env via Vite, so a behavioral import under plain Node cannot
  // run here. This sweep pins the invariant (every env read goes through the
  // guarded isDev) that keeps plain-Node ESM imports crash-free.
  it('has no bare import.meta.env reads outside useEventBus (plain-Node ESM import safety)', () => {
    const hits: string[] = []
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
          walk(full)
        } else if (full.endsWith('.ts') || full.endsWith('.vue')) {
          const src = readFileSync(full, 'utf8')
          if (src.includes('import.meta.env') && !full.endsWith('composables/useEventBus.ts')) {
            hits.push(full)
          }
        }
      }
    }
    walk('src')
    expect(hits).toEqual([])
  })
})
