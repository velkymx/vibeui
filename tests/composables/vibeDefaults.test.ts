import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, defineComponent, computed } from 'vue'
import { renderToString } from 'vue/server-renderer'
import VibeUIPlugin from '../../src/components'
import { VIBE_DEFAULTS_KEY, useVibeDefaults, resolveProp } from '../../src/composables/vibeDefaults'

// #159: explicit prop beats injected global beats builtin; bare installs behave
// exactly as before.
describe('global defaults (#159)', () => {
  it('resolveProp prefers prop, then global, then builtin', () => {
    expect(resolveProp('a', 'b', 'c')).toBe('a')
    expect(resolveProp(undefined, 'b', 'c')).toBe('b')
    expect(resolveProp(undefined, undefined, 'c')).toBe('c')
  })

  it('resolveProp keeps explicit falsy values intact', () => {
    expect(resolveProp(false, true, true)).toBe(false)
    expect(resolveProp('', 'b', 'c')).toBe('')
    expect(resolveProp(0, 5, 10)).toBe(0)
  })

  it('resolves builtin without a provider, global with one, prop over both', () => {
    const Probe = defineComponent({
      props: { variant: { type: String, default: undefined } },
      setup(props) {
        const defaults = useVibeDefaults()
        const resolved = computed(() => resolveProp(props.variant as string | undefined, defaults.variant, 'primary'))
        return () => resolved.value
      },
    })
    expect(mount(Probe).text()).toBe('primary')
    const withGlobal = mount(Probe, {
      global: { provide: { [VIBE_DEFAULTS_KEY as symbol]: { variant: 'danger' } } },
    })
    expect(withGlobal.text()).toBe('danger')
    const withProp = mount(Probe, {
      props: { variant: 'success' },
      global: { provide: { [VIBE_DEFAULTS_KEY as symbol]: { variant: 'danger' } } },
    })
    expect(withProp.text()).toBe('success')
  })

  it('plugin install provides options.defaults to the tree', async () => {
    const Probe = defineComponent({
      setup() {
        const defaults = useVibeDefaults()
        return () => String(defaults.toastPosition ?? 'none')
      },
    })
    const app = createApp(Probe)
    app.use(VibeUIPlugin, { defaults: { toastPosition: 'bottom-start' } })
    const el = document.createElement('div')
    app.mount(el)
    expect(el.textContent).toBe('bottom-start')
    app.unmount()
  })

  it('resolves globals during server rendering', async () => {
    const Probe = defineComponent({
      setup() {
        const defaults = useVibeDefaults()
        return () => String(defaults.size ?? 'none')
      },
    })
    const app = createApp(Probe)
    app.use(VibeUIPlugin, { defaults: { size: 'sm' } })
    expect(await renderToString(app)).toContain('sm')
  })
})
