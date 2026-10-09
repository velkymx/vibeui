// Shared TypeScript types for VibeUI components

/** Payload emitted by the `component-error` event on all Bootstrap-backed components. */
export interface ComponentError {
  message: string
  componentName: string
  originalError: unknown
}

/**
 * Payload for the bus `error:unhandled` event: a Tier 1 supported event was
 * emitted with no target to act on it (e.g. `notification:show` with no
 * `VibeToastHost` mounted).
 */
export interface UnhandledEventError {
  event: string
  id?: string
  message: string
}

/**
 * The typed event catalog for the VibeUI event bus. Library channels are
 * declared here; consumers add their own events by declaration merging:
 *
 * ```ts
 * declare module '@velkymx/vibeui' {
 *   interface VibeEventMap { 'cart:add': { productId: string; qty: number } }
 * }
 * ```
 *
 * Events not listed here still work via the string-key fallback on the bus,
 * with an `unknown` payload.
 */
export interface VibeEventMap {
  /** Any component reported an error (the anchor channel; always present). */
  'error:component': ComponentError
  /** A supported event was emitted with no handler/target to act on it. */
  'error:unhandled': UnhandledEventError

  // Notification channel. Command events are handled by a mounted VibeToastHost;
  // lifecycle events are published by the toast store.
  /** Command: raise a toast from anywhere (needs a mounted VibeToastHost). */
  'notification:show': { message: string; type: 'success' | 'error' | 'info' }
  /** Command: dismiss a toast by id. */
  'notification:dismiss': { id: string }
  /** Lifecycle: a toast was created. */
  'notification:shown': { id: string }
  /** Lifecycle: a toast was removed. */
  'notification:dismissed': { id: string }

  // Modal channel. Command events are handled by the VibeModal with the given id;
  // guard events are cancelable; lifecycle events fire after the transition.
  /** Command: open the modal with this id, optionally passing a payload. */
  'modal:open': { id: string; payload?: unknown }
  /** Command: close the modal with this id. */
  'modal:close': { id: string }
  /** Guard: about to open; call `cancel()` to veto. */
  'modal:beforeOpen': { id: string; cancel: () => void }
  /** Guard: about to close; call `cancel()` to veto. */
  'modal:beforeClose': { id: string; cancel: () => void }
  /** Lifecycle: the modal finished opening. */
  'modal:opened': { id: string }
  /** Lifecycle: the modal finished closing. */
  'modal:closed': { id: string }

  // Theme channel. Command sets the color mode; lifecycle fires when the
  // resolved (light/dark) theme changes, including OS changes in auto mode.
  /** Command: set the color mode to light or dark. */
  'theme:set': { theme: 'light' | 'dark' }
  /** Lifecycle: the resolved theme changed. */
  'theme:changed': { theme: 'light' | 'dark' }

  // Layout / offcanvas channel. Command events are handled by the VibeOffcanvas
  // with the given id; layout:sidebar-toggle targets the offcanvas flagged as the
  // sidebar. Lifecycle events fire after the transition.
  /** Command: open the offcanvas with this id. */
  'offcanvas:open': { id: string }
  /** Command: close the offcanvas with this id. */
  'offcanvas:close': { id: string }
  /** Command: toggle the offcanvas with this id. */
  'offcanvas:toggle': { id: string }
  /** Lifecycle: the offcanvas finished opening. */
  'offcanvas:opened': { id: string }
  /** Lifecycle: the offcanvas finished closing. */
  'offcanvas:closed': { id: string }
  /** Command: toggle the designated sidebar offcanvas. */
  'layout:sidebar-toggle': void
  /** Lifecycle: the sidebar's open state changed. */
  'layout:sidebar-toggled': { open: boolean }

  // Navigation channel. The app publishes breadcrumb updates from anywhere; a
  // VibeBreadcrumb with `bus-updates` subscribes and renders them.
  /** Publish the current breadcrumb trail. */
  'nav:breadcrumb-updated': { items: { label: string; path: string }[] }
}

export type ColorMode = 'light' | 'dark' | 'auto'

export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
export type ButtonVariant = Variant | 'link'

export type Size = 'sm' | 'lg'

export type ButtonType = 'button' | 'submit' | 'reset'

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end'

export type Tag = 'div' | 'span' | 'section' | 'article' | 'nav' | 'aside' | 'header' | 'footer' | 'main' | 'form'

export type Direction = 'up' | 'down' | 'start' | 'end'

export type SpinnerType = 'border' | 'grow'

export type PlaceholderAnimation = 'glow' | 'wave'

export type OffcanvasPlacement = 'start' | 'end' | 'top' | 'bottom'

export type ToastPlacement = 'top-start' | 'top-center' | 'top-end' | 'middle-start' | 'middle-center' | 'middle-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'

export type NavbarPosition = 'fixed-top' | 'fixed-bottom' | 'sticky-top'

// Layout types
export type ContainerType = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ColSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto'
export type GutterSize = 0 | 1 | 2 | 3 | 4 | 5
export type RowColsSize = 1 | 2 | 3 | 4 | 5 | 6
export type OrderValue = 0 | 1 | 2 | 3 | 4 | 5 | 'first' | 'last'
export type AlignItems = 'start' | 'center' | 'end' | 'baseline' | 'stretch'
export type JustifyContent = 'start' | 'center' | 'end' | 'around' | 'between' | 'evenly'

// DataTable types
export type SortDirection = 'asc' | 'desc' | null

export interface DataTableColumn<T extends object = Record<string, unknown>> {
  key: keyof T & string
  label: string
  sortable?: boolean
  searchable?: boolean
  formatter?: (value: T[keyof T], row: T) => string | number
  // #70: text to search for this column. Use it when the displayed value comes
  // from a #cell slot (not visible to the filter) or differs from the raw value.
  // Takes precedence over `formatter`, which is itself searched when present.
  searchValue?: (row: T) => string | number
  class?: string
  headerClass?: string
  thStyle?: Record<string, string>
  tdStyle?: Record<string, string>
  // #283 Phase 2b: per-column filter control rendered in the filter row.
  // 'text' (displayed-text contains), 'select' (equals a faceted unique value),
  // 'range' (numeric min/max). Omitted = no filter input for this column.
  filter?: 'text' | 'select' | 'range'
  // #283 Phase 3a: cell/header text alignment (Bootstrap text-* utility) and a
  // validated column width (number = px, string = any safe CSS length).
  align?: 'start' | 'center' | 'end'
  width?: string | number
  // #283 Phase 3b: pin to the logical start/end (sticky) and allow resizing.
  pinned?: 'start' | 'end'
  resizable?: boolean
}

export interface DataTableCellSlotProps<T extends object = Record<string, unknown>> {
  item: T
  value: T[keyof T]
  index: number
}

export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}

// Component item types
export interface BreadcrumbItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
}

export interface NavItem {
  text: string
  href?: string
  to?: string | object
  /** Tab panel ID (e.g. '#panel-id') for tabs/pills mode when using router-link */
  target?: string
  active?: boolean
  disabled?: boolean
  children?: DropdownItem[]
}

export interface PaginationItem {
  page: number
  text?: string
  active?: boolean
  disabled?: boolean
}

export interface ListGroupItem {
  text: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  variant?: Variant
  // #34: override the auto-chosen wrapper element (e.g. 'button' for an
  // actionable row). Defaults to a/router-link/li based on href/to.
  // Narrowed to inert elements: this value is resolved by `<component :is>`,
  // so an arbitrary string from API data would let a caller pick any tag
  // name (see #199).
  tag?: 'li' | 'button' | 'div' | 'span' | 'a'
  // #34: extra classes merged onto the list-group-item element.
  class?: string
}

export interface AccordionItem {
  // Optional: when omitted, VibeAccordion generates a stable id per item.
  id?: string
  title: string
  content: string
  show?: boolean
}

export interface DropdownItem {
  text?: string
  href?: string
  to?: string | object
  active?: boolean
  disabled?: boolean
  divider?: boolean
  header?: boolean
}

export interface CarouselItem {
  src: string
  alt?: string
  caption?: string
  captionText?: string
  active?: boolean
  interval?: number
}

export interface ProgressBar {
  value: number
  max?: number
  variant?: Variant
  striped?: boolean
  animated?: boolean
  label?: string
  showValue?: boolean
}

export interface TabPane {
  id: string
  title: string
  content?: string
  active?: boolean
  disabled?: boolean
}

// Form types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color'

export type AutocompleteType =
  | 'off' | 'on'
  | 'name' | 'honorific-prefix' | 'given-name' | 'additional-name' | 'family-name' | 'honorific-suffix'
  | 'nickname' | 'username' | 'email' | 'new-password' | 'current-password' | 'one-time-code'
  | 'organization-title' | 'organization' | 'street-address'
  | 'address-line1' | 'address-line2' | 'address-line3'
  | 'address-level4' | 'address-level3' | 'address-level2' | 'address-level1'
  | 'country' | 'country-name' | 'postal-code'
  | 'cc-name' | 'cc-given-name' | 'cc-additional-name' | 'cc-family-name'
  | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc' | 'cc-type'
  | 'transaction-currency' | 'transaction-amount'
  | 'language' | 'bday' | 'bday-day' | 'bday-month' | 'bday-year'
  | 'sex' | 'tel' | 'tel-country-code' | 'tel-national' | 'tel-area-code'
  | 'tel-local' | 'tel-extension' | 'impp' | 'url' | 'photo'

export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'

export type ValidationState = 'valid' | 'invalid' | null

/** Return true for valid, false for invalid (uses rule.message), or a non-empty string as the error message (also invalid). */
export type ValidatorFunction = (value: unknown) => boolean | string | Promise<boolean | string>

export interface ValidationRule {
  validator: ValidatorFunction
  message?: string
}

export interface FormValidationResult {
  valid: boolean
  message?: string
}

export type FormSelectOptionValue = string | number | boolean | null | undefined

export interface FormSelectOption {
  value: FormSelectOptionValue
  text: string
  disabled?: boolean
}

// WYSIWYG peer injection — VibeFormWysiwyg's Quill and sanitizer are provided by
// the consumer so the library never imports the optional peers itself.
export type QuillLoader = () => Promise<unknown>
export type Sanitizer = (html: string) => string
export interface VibeWysiwygConfig {
  quillLoader?: QuillLoader
  sanitizer?: Sanitizer
}
export interface VibeUIOptions {
  wysiwyg?: VibeWysiwygConfig
  defaults?: VibeDefaults
}

/**
 * #159: library-wide prop defaults set once at `app.use(VibeUI, { defaults })`.
 * Every key is opt-in; an explicit per-instance prop always wins, then the
 * global default, then the component builtin. Variant/size apply only where
 * the prop type accepts them (standard Variant/Size components; Skeleton and
 * Tabs keep their specialized variants).
 */
export interface VibeDefaults {
  variant?: Variant
  size?: Size
  toastPosition?: ToastPlacement
  teleport?: string | boolean
  debounce?: number
  hideOptional?: boolean
}

// Chart types
export interface ChartDataset {
  label: string
  data: number[]
  color?: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export type ChartLegendPosition = 'top' | 'bottom' | 'none'
