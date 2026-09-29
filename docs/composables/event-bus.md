# useEventBus

A zero-dependency, zero-initialization event bus built into VibeUI. Vue 3 removed the instance event bus (`$on` / `$off` / `$once`), pushing apps to an external emitter such as mitt or to `provide` / `inject`. VibeUI brings the bus back inside the library as a first-class, always-on feature. Loading VibeUI is the only setup: import `useEventBus` and start publishing or subscribing.

The bus is yours as much as the library's. VibeUI seeds a set of typed channels (see the tiers below) and publishes to them itself, but you also declare and use your own events on the same typed, auto-cleaning channel.

## Quick start

```ts
import { useEventBus } from '@velkymx/vibeui'

const bus = useEventBus()

const off = bus.on('cart:add', (payload) => addToMiniCart(payload))
bus.emit('cart:add', { productId: 'sku_1', qty: 2 })
off() // stop listening
```

`useEventBus()` is an accessor, not an initializer. The bus is a module-level singleton created the moment VibeUI loads, so it is already live and already receiving the library's own events before any of your code runs. Calling `useEventBus()` just hands you a reference to it.

## API

`useEventBus()` returns a `VibeEventBus`:

| Method | Description |
|--------|-------------|
| `on(event, handler)` | Subscribe. Returns an unsubscribe function. When called inside a component's `setup`, it also unsubscribes automatically on unmount. |
| `once(event, handler)` | Subscribe for a single delivery, then auto-unsubscribe. Returns an unsubscribe function. |
| `off(event, handler)` | Remove a specific handler. |
| `emit(event, payload)` | Publish an event to all current subscribers. |
| `clear()` | Remove every handler (mainly for teardown in tests). |

### Auto-cleanup

When you call `on()` (or `once()`) inside a component, the subscription is torn down automatically when the component unmounts, the same way a lifecycle hook is. This makes it safe to subscribe anywhere without tracking unsubscribe functions yourself.

```ts
// Inside setup(): no manual cleanup needed.
useEventBus().on('order:placed', refreshWallet)
```

Outside a component (a Pinia store, a router guard, a plain module), keep the returned function and call it when you are done.

### Handler isolation

Each subscriber runs in its own try/catch during `emit`. A handler that throws cannot break the other handlers or the `emit` call; its error is reported on the `error:component` channel (and logged in development), never swallowed silently.

## Built-in channels

VibeUI publishes to and acts on a fixed set of channels. They fall into three tiers, so it is always clear who acts on an event.

**Tier 1 - Supported (you emit, VibeUI acts).** These require a target to be mounted. If you emit one with no target, the bus reports `error:unhandled` (and logs in development) rather than doing nothing.

| Emit | Effect | Requires |
|------|--------|----------|
| `notification:show` / `notification:dismiss` | Show or dismiss a toast | A mounted `VibeToastHost` |
| `modal:open` / `modal:close` (by `id`) | Open or close a modal | A `VibeModal` with that `id` |
| `offcanvas:open` / `offcanvas:close` / `offcanvas:toggle` (by `id`) | Control an offcanvas | A `VibeOffcanvas` with that `id` |
| `layout:sidebar-toggle` | Toggle the sidebar | A `VibeOffcanvas` with the `sidebar` prop |
| `theme:set` | Set the color mode | (always handled) |

**Tier 2 - Observable (VibeUI emits, you react).**

| Subscribe | Fires when |
|-----------|-----------|
| `error:component` | Any component reports an error |
| `error:unhandled` | A supported event was emitted with no target |
| `theme:changed` | The resolved light/dark theme changes |
| `notification:shown` / `notification:dismissed` | A toast appears or leaves |
| `modal:opened` / `modal:closed` | A modal finishes its transition |
| `modal:beforeOpen` / `modal:beforeClose` | A modal is about to open/close (cancelable) |
| `offcanvas:opened` / `offcanvas:closed` | An offcanvas finishes its transition |
| `layout:sidebar-toggled` | The sidebar's open state changed |

**Tier 3 - Your own (you emit and you react).** Anything you declare. See the next section.

For runnable, end-to-end examples of each channel, see the [event bus cookbook](./event-bus-cookbook.md).

## Your own events

The library only ships the channels above. Everything else, such as app-level `auth`, `cart`, `realtime`, or `form` events, you add yourself on the same bus. There is no separate emitter to install.

### 1. Declare your events (typed)

Augment `VibeEventMap` by declaration merging. Following the library naming convention (present-tense verb for a command, past participle for something that happened, `before` prefix for a cancelable guard) keeps your events consistent with the built-ins, but the names are yours to choose.

```ts
// types/vibe-events.d.ts
import '@velkymx/vibeui'

declare module '@velkymx/vibeui' {
  interface VibeEventMap {
    'cart:add': { productId: string; qty: number }
    'cart:updated': { count: number }
    'auth:loggedIn': { user: { id: string; name: string } }
  }
}
```

### 2. Emit

```ts
import { useEventBus } from '@velkymx/vibeui'

const bus = useEventBus()
bus.emit('cart:add', { productId: 'sku_1', qty: 2 }) // payload is type-checked
```

### 3. Listen

```ts
const bus = useEventBus()

// In setup(): auto-unsubscribes on unmount.
bus.on('cart:updated', ({ count }) => { badgeCount.value = count })

// Elsewhere: keep the returned unsubscribe.
const off = bus.on('auth:loggedIn', hydrateSession)
// ...later
off()

bus.once('auth:loggedIn', trackFirstLogin) // one-shot
```

### 4. Ad-hoc events

You do not have to declare an event to use it. Any string works; its payload is typed `unknown`, so you narrow it yourself.

```ts
bus.emit('my:one-off', { anything: true })
bus.on('my:one-off', (payload) => {
  // payload: unknown
})
```

### 5. Optional: your own on* / emit* helpers

VibeUI ships `on*` / `emit*` helpers for its built-in channels (for example `onModalOpened`, `emitNotificationShow`). For your own events, use `bus.on` / `bus.emit` directly, or write thin wrappers if you want the same ergonomics:

```ts
import { useEventBus } from '@velkymx/vibeui'
import type { VibeEventMap } from '@velkymx/vibeui'

export const onCartUpdated = (fn: (p: VibeEventMap['cart:updated']) => void) =>
  useEventBus().on('cart:updated', fn)
```

## When not to use the bus

The bus is for global, decoupled signals between unrelated parts of the app. It is not a replacement for:

- **Parent-child coordination**, which belongs in `provide` / `inject`. A global event crosses component instances and breaks isolation (two of the same component would receive each other's events).
- **Local state**, which belongs in `props` / `v-model`.

Reach for the bus when a signal genuinely needs to travel across the app without a direct parent-child path.

## SSR

The bus is a module-level singleton, so in a server runtime it is shared across requests. Call `resetEventBusForSSR()` in your per-request server entry to clear per-request subscriptions and avoid leaking handlers between requests. This is not needed in a normal single-page app.

```ts
import { resetEventBusForSSR } from '@velkymx/vibeui'

// per request, on the server
resetEventBusForSSR()
```
