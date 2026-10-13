# Event Bus Cookbook

Copy-paste recipes for building reactive, decoupled apps with the VibeUI [event bus](./event-bus.md). Each recipe is labeled:

- **Library channel** - VibeUI ships and acts on the event. Use the built-in `emit*` / `on*` helpers or `useEventBus()`.
- **Custom event** - your app owns both ends. Declare it on `VibeEventMap` (see [Your own events](./event-bus.md#your-own-events)) and use `useEventBus()`.

All `on*` subscriptions made inside a component auto-unsubscribe on unmount.

---

## 1. Notifications (library channel)

Raise a toast from anywhere, with no `useToast` import. Requires `<VibeToastHost />` mounted once at the app root.

```ts
import { emitNotificationShow } from '@velkymx/vibeui'

emitNotificationShow({ message: 'Saved', type: 'success' })
```

```vue
<!-- App.vue, once -->
<template>
  <VibeToastHost />
</template>
```

If no `VibeToastHost` is mounted, the bus reports `error:unhandled` so the missing host is caught during development.

## 2. Global modals (library channel)

Open a modal by id from anywhere, pass it a payload, and guard the close.

```ts
import { emitModalOpen, onBeforeModalClose } from '@velkymx/vibeui'

// open it from a button deep in the tree
emitModalOpen({ id: 'confirm-delete', payload: { orderId: 42 } })

// block the close while there are unsaved changes
onBeforeModalClose(({ id, cancel }) => {
  if (id === 'confirm-delete' && isDirty.value) cancel()
})
```

```vue
<VibeModal id="confirm-delete">
  <template #default="{ payload }">
    Delete order {{ payload && payload.orderId }}?
  </template>
</VibeModal>
```

## 3. Theme (library channel)

React to color-mode changes anywhere, including in non-VibeUI widgets (charts, maps, editors) that must repaint on theme flip.

```ts
import { onThemeChanged, emitThemeSet } from '@velkymx/vibeui'

onThemeChanged(({ theme }) => chart.setTheme(theme)) // 'light' | 'dark'

// set the mode from anywhere
emitThemeSet({ theme: 'dark' })
```

## 4. Authentication state (custom event)

Broadcast login/logout to the navbar, route guards, and anything else that cares.

```ts
declare module '@velkymx/vibeui' {
  interface VibeEventMap {
    'auth:loggedIn': { user: { id: string; name: string } }
    'auth:loggedOut': void
  }
}
```

```ts
import { useEventBus } from '@velkymx/vibeui'
const bus = useEventBus()

// after a successful sign-in
bus.emit('auth:loggedIn', { user })

// in the navbar
bus.on('auth:loggedIn', ({ user }) => { currentUser.value = user })
bus.on('auth:loggedOut', () => { currentUser.value = null })
```

## 5. Cart updates (custom event)

A product card publishes; the header badge and the cart page react independently.

```ts
declare module '@velkymx/vibeui' {
  interface VibeEventMap {
    'cart:add': { productId: string; qty: number }
    'cart:updated': { count: number }
  }
}
```

```ts
const bus = useEventBus()

// product card
bus.emit('cart:add', { productId, qty: 1 })

// header badge
bus.on('cart:updated', ({ count }) => { badgeCount.value = count })
```

## 6. Sidebar toggle (library channel)

A hamburger anywhere toggles the sidebar; the sidebar and layout react. Flag one `VibeOffcanvas` as the sidebar.

```vue
<VibeOffcanvas id="app-sidebar" sidebar>
  <!-- nav links -->
</VibeOffcanvas>
```

```ts
import { emitLayoutSidebarToggle, onLayoutSidebarToggled } from '@velkymx/vibeui'

emitLayoutSidebarToggle() // from the hamburger button

onLayoutSidebarToggled(({ open }) => { mainShifted.value = open })
```

Any offcanvas can also be controlled directly by id with `emitOffcanvasToggle({ id })`.

## 7. Real-time data (custom event)

A WebSocket handler publishes; dashboard widgets subscribe without coupling to the socket.

```ts
declare module '@velkymx/vibeui' {
  interface VibeEventMap {
    'realtime:message': { source: string; data: unknown }
  }
}
```

```ts
const bus = useEventBus()

socket.onmessage = (e) => bus.emit('realtime:message', { source: 'prices', data: JSON.parse(e.data) })

// a chart widget
bus.on('realtime:message', ({ source, data }) => {
  if (source === 'prices') applyTick(data)
})
```

## 8. Cross-component form sync (custom event)

A form publishes field changes; a summary panel elsewhere updates in real time.

```ts
declare module '@velkymx/vibeui' {
  interface VibeEventMap {
    'form:field-changed': { formId: string; field: string; value: unknown }
  }
}
```

```ts
const bus = useEventBus()

// in the form
bus.emit('form:field-changed', { formId: 'profile', field: 'email', value })

// in the summary panel
bus.on('form:field-changed', ({ formId, field, value }) => {
  if (formId === 'profile') summary[field] = value
})
```

## 9. Breadcrumb from a deep child (library channel)

A deep child publishes the trail; the top-level breadcrumb updates with no prop drilling. Opt the breadcrumb in with `bus-updates`.

```vue
<!-- top of the layout -->
<VibeBreadcrumb bus-updates />
```

```ts
import { emitNavBreadcrumbUpdate } from '@velkymx/vibeui'

// from a route or a deep view
emitNavBreadcrumbUpdate({
  items: [
    { label: 'Home', path: '/' },
    { label: 'Docs', path: '/docs' },
    { label: 'Event Bus', path: '/docs/event-bus' },
  ],
})
```

Explicit `:items` on `VibeBreadcrumb` always take precedence over bus updates.

## 10. Inter-plugin messaging (custom event)

A generic channel for plugins or micro-frontends to talk to each other.

```ts
declare module '@velkymx/vibeui' {
  interface VibeEventMap {
    'plugin:message': { pluginId: string; data: unknown }
  }
}
```

```ts
const bus = useEventBus()

// plugin A
bus.emit('plugin:message', { pluginId: 'analytics', data: { event: 'view' } })

// plugin B
bus.on('plugin:message', ({ pluginId, data }) => {
  if (pluginId === 'analytics') track(data)
})
```

---

## When not to use the bus

The bus is for global, decoupled signals between unrelated parts of the app. Do not use it for parent-child coordination (use `provide` / `inject`) or for local state (use `props` / `v-model`). A global event for a scoped concern crosses component instances and breaks isolation. See [When not to use the bus](./event-bus.md#when-not-to-use-the-bus).
