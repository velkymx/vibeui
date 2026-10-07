import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { installErrorHandler } from '../../src/utils/installErrorHandler'
import { useEventBus, __resetEventBusForTests } from '../../src/composables/useEventBus'

// #154: opt-in routing of uncaught Vue render/lifecycle errors into the bus
// error:component channel, chaining (never clobbering) any existing handler.
const Thrower = defineComponent({
  name: 'Thrower',
  setup() {
    throw new Error('render boom')
  },
})

const mountThrowing = (app: ReturnType<typeof createApp>) => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  app.mount(el)
  return () => {
    app.unmount()
    el.remove()
  }
}

describe('installErrorHandler (#154)', () => {
  beforeEach(() => {
    __resetEventBusForTests()
  })

  it('routes an uncaught child error to the bus error:component channel', () => {
    const onBus: unknown[] = []
    useEventBus().on('error:component', (payload) => {
      onBus.push(payload)
    })
    const app = createApp({ render: () => h(Thrower) })
    installErrorHandler(app)
    const cleanup = mountThrowing(app)
    expect(onBus).toHaveLength(1)
    expect(onBus[0]).toMatchObject({ componentName: 'Thrower' })
    cleanup()
  })

  it('chains a pre-existing consumer handler instead of overwriting it', () => {
    const previous = vi.fn()
    const app = createApp({ render: () => h(Thrower) })
    app.config.errorHandler = previous
    installErrorHandler(app)
    const onBus: unknown[] = []
    useEventBus().on('error:component', (payload) => {
      onBus.push(payload)
    })
    const cleanup = mountThrowing(app)
    expect(previous).toHaveBeenCalledTimes(1)
    const [err, , info] = previous.mock.calls[0] as [Error, unknown, string]
    expect(err).toBeInstanceOf(Error)
    expect(typeof info).toBe('string')
    expect(onBus).toHaveLength(1)
    cleanup()
  })

  it('returns an uninstall that restores the previous handler', () => {
    const app = createApp({ render: () => h('div') })
    expect(app.config.errorHandler).toBeUndefined()
    const uninstall = installErrorHandler(app)
    expect(typeof app.config.errorHandler).toBe('function')
    uninstall()
    expect(app.config.errorHandler).toBeUndefined()
  })

  it('reports non-Error throws with their string form and original value', () => {
    const StringThrower = defineComponent({
      name: 'StringThrower',
      setup(): never {
        throw 'plain string failure' as never
      },
    })
    const onBus: Array<{ message: string; originalError: unknown }> = []
    useEventBus().on('error:component', (payload) => {
      onBus.push(payload as { message: string; originalError: unknown })
    })
    const app = createApp({ render: () => h(StringThrower) })
    installErrorHandler(app)
    const cleanup = mountThrowing(app)
    expect(onBus).toHaveLength(1)
    expect(onBus[0].message).toBe('plain string failure')
    expect(onBus[0].originalError).toBe('plain string failure')
    cleanup()
  })
})
