import { useEventBus } from '../../src/composables/useEventBus'

// Consumers add their own events by declaration merging on VibeEventMap.
declare module '../../src/types' {
  interface VibeEventMap {
    'cart:add': { productId: string; qty: number }
  }
}

const bus = useEventBus()

// Declared event: payload is strict.
bus.emit('cart:add', { productId: 'sku_1', qty: 2 })
bus.on('cart:add', (p) => {
  const qty: number = p.qty
  void qty
})

// Wrong payload for a declared event is rejected (no string fallback rescues it).
// @ts-expect-error qty is required
bus.emit('cart:add', { productId: 'sku_1' })

// Built-in library channel is typed.
bus.on('error:component', (e) => {
  const msg: string = e.message
  const name: string = e.componentName
  void msg
  void name
})
bus.on('error:unhandled', (e) => {
  const ev: string = e.event
  void ev
})

// Ad-hoc, undeclared event still works, with an unknown payload.
bus.on('some:adhoc', (p) => {
  void p // p: unknown
})
bus.emit('some:adhoc', 123)
