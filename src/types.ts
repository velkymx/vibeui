// Shared TypeScript types for VibeUI components

export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'

export type Size = 'sm' | 'lg'

export type ButtonType = 'button' | 'submit' | 'reset'

export type Placement = 'top' | 'bottom' | 'start' | 'end'

export type Tag = 'div' | 'span' | 'section' | 'article' | 'nav' | 'aside' | 'header' | 'footer' | 'main'

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

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  formatter?: (value: any, row: any) => string | number
  class?: string
  headerClass?: string
  thStyle?: Record<string, string>
  tdStyle?: Record<string, string>
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
  active?: boolean
  disabled?: boolean
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
}

export interface AccordionItem {
  id: string
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

// Form types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color'

export type ValidationState = 'valid' | 'invalid' | null

export type ValidatorFunction = (value: any) => boolean | string | Promise<boolean | string>

export interface ValidationRule {
  validator: ValidatorFunction
  message?: string
}

export interface FormValidationResult {
  valid: boolean
  message?: string
}

export interface FormSelectOption {
  value: string | number
  text: string
  disabled?: boolean
}
