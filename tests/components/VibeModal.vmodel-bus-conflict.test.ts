import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VibeModal from '../../src/components/VibeModal.vue'
import VibeOffcanvas from '../../src/components/VibeOffcanvas.vue'
import { __resetModalRegistry } from '../../src/composables/modalChannel'
import { __resetOffcanvasRegistry } from '../../src/composables/offcanvasChannel'
import {
  emitModalOpen,
  emitModalClose,
  emitOffcanvasOpen,
  emitOffcanvasToggle,
} from '../../src/composables/eventHelpers'

// #121: v-model and the bus command channel are mutually exclusive per instance.
// Driving a v-model-bound component by bus command is a footgun (the bound ref and
// the DOM state can disagree), so it must warn in DEV. An instance driven by only
// one path must stay silent.

describe('VibeModal / VibeOffcanvas v-model + bus command conflict (#121)', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    __resetModalRegistry()
    __resetOffcanvasRegistry()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('warns when a v-model-bound VibeModal receives a bus command', async () => {
    mount(VibeModal, {
      props: { id: 'm1', teleport: false, modelValue: false, 'onUpdate:modelValue': () => {} },
    })
    await flushPromises()
    emitModalOpen({ id: 'm1' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('#121'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('VibeModal'))
  })

  it('does not warn when a VibeModal is driven by the bus alone (no v-model)', async () => {
    mount(VibeModal, { props: { id: 'm1', teleport: false } })
    await flushPromises()
    emitModalOpen({ id: 'm1' })
    emitModalClose({ id: 'm1' })
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns when a v-model-bound VibeOffcanvas receives a bus command', async () => {
    mount(VibeOffcanvas, {
      props: { id: 'o1', teleport: false, modelValue: false, 'onUpdate:modelValue': () => {} },
    })
    await flushPromises()
    emitOffcanvasOpen({ id: 'o1' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('#121'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('VibeOffcanvas'))
  })

  it('does not warn when a VibeOffcanvas is driven by the bus alone (no v-model)', async () => {
    mount(VibeOffcanvas, { props: { id: 'o1', teleport: false } })
    await flushPromises()
    emitOffcanvasToggle({ id: 'o1' })
    expect(warn).not.toHaveBeenCalled()
  })
})
