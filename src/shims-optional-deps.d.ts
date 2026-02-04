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
