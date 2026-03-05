// Type declarations for optional peer dependencies
// These modules may not be installed by consumers of the library

declare module 'bootstrap' {
  export class Modal {
    constructor(element: HTMLElement, options?: {
      backdrop?: boolean | 'static'
      keyboard?: boolean
      focus?: boolean
    })
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    handleUpdate(): void
    static getInstance(element: HTMLElement): Modal | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Modal
  }

  export class Toast {
    constructor(element: HTMLElement, options?: {
      animation?: boolean
      autohide?: boolean
      delay?: number
    })
    show(): void
    hide(): void
    dispose(): void
    isShown(): boolean
    static getInstance(element: HTMLElement): Toast | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Toast
  }

  export class Tooltip {
    constructor(element: HTMLElement, options?: {
      animation?: boolean
      container?: string | HTMLElement | false
      delay?: number | { show: number, hide: number }
      html?: boolean
      placement?: string | (() => string)
      selector?: string | false
      template?: string
      title?: string | HTMLElement | (() => string)
      trigger?: string
      offset?: string | number | (() => [number, number])
      fallbackPlacement?: string | string[]
      boundary?: string | HTMLElement
      customClass?: string | (() => string)
      sanitize?: boolean
      allowList?: object
      sanitizeFn?: () => void
      popperConfig?: object | null
    })
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    enable(): void
    disable(): void
    toggleEnabled(): void
    update(): void
    setContent(content?: object): void
    static getInstance(element: HTMLElement): Tooltip | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Tooltip
  }

  export class Popover {
    constructor(element: HTMLElement, options?: {
      animation?: boolean
      container?: string | HTMLElement | false
      content?: string | HTMLElement | (() => string)
      delay?: number | { show: number, hide: number }
      html?: boolean
      placement?: string | (() => string)
      selector?: string | false
      template?: string
      title?: string | HTMLElement | (() => string)
      trigger?: string
      offset?: string | number | (() => [number, number])
      fallbackPlacement?: string | string[]
      boundary?: string | HTMLElement
      customClass?: string | (() => string)
      sanitize?: boolean
      allowList?: object
      sanitizeFn?: () => void
      popperConfig?: object | null
    })
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    enable(): void
    disable(): void
    toggleEnabled(): void
    update(): void
    setContent(content?: object): void
    static getInstance(element: HTMLElement): Popover | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Popover
  }

  export class Carousel {
    constructor(element: HTMLElement, options?: {
      interval?: number | boolean
      keyboard?: boolean
      pause?: string | boolean
      ride?: string | boolean
      wrap?: boolean
      touch?: boolean
    })
    cycle(): void
    pause(): void
    prev(): void
    next(): void
    to(index: number): void
    dispose(): void
    static getInstance(element: HTMLElement): Carousel | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Carousel
  }

  export class Collapse {
    constructor(element: HTMLElement, options?: {
      parent?: string | HTMLElement | boolean
      toggle?: boolean
    })
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    static getInstance(element: HTMLElement): Collapse | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Collapse
  }

  export class ScrollSpy {
    constructor(element: HTMLElement, options?: {
      target?: string | HTMLElement
      offset?: number
      method?: string
      smoothScroll?: boolean
    })
    refresh(): void
    dispose(): void
    static getInstance(element: HTMLElement): ScrollSpy | null
    static getOrCreateInstance(element: HTMLElement, config?: object): ScrollSpy
  }

  export class Alert {
    constructor(element: HTMLElement)
    close(): void
    dispose(): void
    static getInstance(element: HTMLElement): Alert | null
    static getOrCreateInstance(element: HTMLElement): Alert
  }

  export class Dropdown {
    constructor(element: HTMLElement, options?: {
      offset?: string | number | (() => [number, number])
      boundary?: string | HTMLElement
      reference?: string | HTMLElement | object
      display?: string
      popperConfig?: object | null
      autoClose?: boolean | string
    })
    toggle(): void
    show(): void
    hide(): void
    update(): void
    dispose(): void
    static getInstance(element: HTMLElement): Dropdown | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Dropdown
  }

  export class Tab {
    constructor(element: HTMLElement)
    show(): void
    dispose(): void
    static getInstance(element: HTMLElement): Tab | null
    static getOrCreateInstance(element: HTMLElement): Tab
  }

  export class Offcanvas {
    constructor(element: HTMLElement, options?: {
      backdrop?: boolean | 'static'
      keyboard?: boolean
      scroll?: boolean
    })
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    static getInstance(element: HTMLElement): Offcanvas | null
    static getOrCreateInstance(element: HTMLElement, config?: object): Offcanvas
  }
}

declare module 'quill' {
  interface QuillOptions {
    theme?: string
    placeholder?: string
    readOnly?: boolean
    modules?: {
      toolbar?: unknown
      [key: string]: unknown
    }
  }

  class Quill {
    constructor(container: HTMLElement, options?: QuillOptions)
    root: HTMLElement
    getText(): string
    getSemanticHTML(): string
    setContents(delta: unknown, source?: string): void
    clipboard: {
      dangerouslyPasteHTML(html: string, source?: string): void
    }
    on(event: string, handler: (...args: unknown[]) => void): void
    off(event: string, handler: (...args: unknown[]) => void): void
    enable(enabled: boolean): void
  }

  export default Quill
}

declare module 'quill/dist/quill.snow.css' {
  const content: string
  export default content
}
