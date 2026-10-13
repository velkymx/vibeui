import { vi } from 'vitest'

export const Modal = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn(),
    handleUpdate: vi.fn()
  }
})

export const Tooltip = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    dispose: vi.fn(),
    setContent: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    toggle: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    toggleEnabled: vi.fn(),
    update: vi.fn()
  }
})

export const Popover = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    dispose: vi.fn(),
    setContent: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    toggle: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    toggleEnabled: vi.fn(),
    update: vi.fn()
  }
})

export const Offcanvas = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    show: vi.fn(),
    hide: vi.fn(),
    toggle: vi.fn(),
    dispose: vi.fn()
  }
})

export const Carousel = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    to: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    pause: vi.fn(),
    cycle: vi.fn(),
    dispose: vi.fn()
  }
})

export const Collapse = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    show: vi.fn(),
    hide: vi.fn(),
    toggle: vi.fn(),
    dispose: vi.fn(),
    getOrCreateInstance: vi.fn(() => ({
      toggle: vi.fn(),
      show: vi.fn(),
      hide: vi.fn()
    }))
  }
})
// Static method for Collapse
Collapse.getOrCreateInstance = vi.fn(() => ({
  toggle: vi.fn(),
  show: vi.fn(),
  hide: vi.fn()
}))

export const Dropdown = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    toggle: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn()
  }
})

export const Alert = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    close: vi.fn(),
    dispose: vi.fn()
  }
})

export const ScrollSpy = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    refresh: vi.fn(),
    dispose: vi.fn()
  }
})

export const Tab = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    show: vi.fn(),
    dispose: vi.fn()
  }
})

export const Toast = vi.fn(function (element?: Element) {
  return {
    _element: element ?? null,
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn(),
    isShown: vi.fn()
  }
})
