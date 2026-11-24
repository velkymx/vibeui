# VibeUI component map

Open the doc page before using a component. The table lists the common surface; the page is the source of truth for props, events, and slots.

Doc paths are relative to `node_modules/@velkymx/vibeui/docs/` (or `docs/` in the VibeUI repo).

## Layout and content

| Component | Use | Common props / slots | Doc |
| --- | --- | --- | --- |
| `VibeContainer` | Page gutters and max width | `fluid` | `components/layout/container.md` |
| `VibeRow` | Grid row | `:gutters` | `components/layout/row.md` |
| `VibeCol` | Grid column | `:cols`, `:sm`, `:md`, `:lg`, `:xl`, `:order` | `components/layout/col.md` |
| `VibeCard` | One content surface | `title`, `variant`, `headerClass`, `bodyClass`; `#header`, `#title`, `#body`, `#footer`, `#image` | `components/card/card.md` |
| `VibeHero` | Banner / hero section | `variant`, `textVariant`, `bgImage`, `overlay`, `minHeight`; default slot | `components/hero/hero.md` |
| `VibeListGroup` | Lists of actions or content | `:items` (`ListGroupItem[]`), `flush`, `horizontal`, `numbered`, `emptyText`; `#item` | `components/list/list-group.md` |

## Actions and feedback

| Component | Use | Common props / slots | Doc |
| --- | --- | --- | --- |
| `VibeButton` | Action | `variant`, `size`, `outline`, `disabled`, `type`, `loading`, `href` / `to` | `components/core/button.md` |
| `VibeButtonGroup` | Related actions | `size`, `vertical` | `components/core/button-group.md` |
| `VibeLink` | Text navigation | `href` / `to`, `variant` | `components/core/link.md` |
| `VibeCloseButton` | Dismiss affordance | `ariaLabel`, `disabled` | `components/core/close-button.md` |
| `VibeAlert` | Inline status | `variant`, `subtle`, `message`, `dismissible`, `v-model` | `components/core/alert.md` |
| `VibeBadge` | Short status or count | `variant`, `pill` | `components/core/badge.md` |
| `VibeSpinner` | Indeterminate progress | `type`, `size` | `components/core/spinner.md` |
| `VibeSkeleton` | Content placeholder | `variant`, `width`, `height`, `lines`, `animated` | `components/core/skeleton.md` |
| `VibePlaceholder` | Bootstrap placeholder blocks | `animation`, `width` | `components/core/placeholder.md` |
| `VibeProgress` | Determinate progress | `:bars` (`ProgressBar[]`) | `components/progress/progress.md` |
| `VibeIcon` | Bootstrap Icons | `icon`, `size`, `color`, `ariaLabel` | `components/core/icon.md` |
| `VibeErrorBoundary` | Catch render errors | `#fallback` | `components/advanced/error-boundary.md` |

## Navigation

| Component | Use | Common props / slots | Doc |
| --- | --- | --- | --- |
| `VibeNav` | Pure `.nav` rendering | `:items`, `tabs`, `pills`, `underline`, `vertical`, `fill`, `justified` | `components/navigation/nav.md` |
| `VibeNavbar` | Top navigation shell | `variant`, `expand`, `position` | `components/navigation/navbar.md` |
| `VibeNavbarBrand` | Brand link | `href` / `to` | `components/navigation/navbar.md` |
| `VibeNavbarToggle` | Mobile toggle | `target` (collapse id), `ariaLabel` | `components/navigation/navbar.md` |
| `VibeNavbarNav` | Links / dropdowns | `:items`; `#item`, `#dropdown-item` | `components/navigation/navbar.md` |
| `VibeCollapse` | Collapsible region; navbar body | `v-model`, `id`, `is-nav` | `components/interactive/collapse.md` |
| `VibeBreadcrumb` | Location trail | `:items` (`BreadcrumbItem[]`) | `components/navigation/breadcrumb.md` |
| `VibePagination` | Paging | `:total-pages`, `v-model:current-page`, `size`, `:max-visible-pages` | `components/navigation/pagination.md` |
| `VibeTabs` / `VibeTab` | Tabbed content with state | `v-model`, `variant`, `lazy`; `VibeTab` panes | `components/interactive/tabs.md` |
| `VibeStepper` | Multi-step workflow | `:steps`, `v-model` | `components/interactive/stepper.md` |
| `VibeScrollspy` | Active section tracking | `target`, `rootMargin`, `smoothScroll`, `height`; default slot; `refresh()` | `components/advanced/scrollspy.md` |

## Overlays and disclosure

| Component | Use | Common props / slots | Doc |
| --- | --- | --- | --- |
| `VibeModal` | Focused task or confirmation | `v-model`, `title`, `size`, `centered`, `hideFooter`; `#footer` | `components/interactive/modal.md` |
| `VibeOffcanvas` | Side panel | `v-model`, `placement`, `title` | `components/interactive/offcanvas.md` |
| `VibeDropdown` | Menu of actions | `text`, `:items`, `variant`, `size`, `split`, `direction`, `menuEnd` | `components/interactive/dropdown.md` |
| `VibeTooltip` | Short hint | `text`, `placement`, `trigger` | `components/advanced/tooltip.md` |
| `VibePopover` | Rich hint | `title`, `content`, `placement`, `trigger` | `components/advanced/popover.md` |
| `v-vibe-tooltip` | Tooltip on arbitrary elements | Directive value + modifiers | `directives/v-tooltip.md` |
| `VibeAccordion` | Disclosure groups | `:items` (`AccordionItem[]`), `flush`, `alwaysOpen` | `components/interactive/accordion.md` |
| `VibeCarousel` | Slides | `:items` (`CarouselItem[]`, `src` required), `v-model`, `controls`, `indicators`, `ride`, `interval` | `components/interactive/carousel.md` |
| `VibeToast` | Component-scoped toast | `v-model`, `variant` | `components/interactive/toast.md` |
| `VibeToastHost` | Renders the `useToast` queue | Mount once at the app root | `composables/use-toast.md` |

## Data

| Component | Use | Common props / slots | Doc |
| --- | --- | --- | --- |
| `VibeDataTable` | Sortable, filterable, selectable table | `:columns`, `:items`, `row-key`, `loading`, `empty-text`, `searchable`, `sortable`, `paginated`, `selectable`, `group-by`, `virtualized`; `cell(<key>)`, `footer(<key>)`, `expanded` | `components/data/datatable.md` |
| `VibeChartLine` | Line chart | `:data`, `legend`, `height`, `showAxes`, `showGrid`, `smooth`, `fill` | `components/charts/chart-line.md` |
| `VibeChartBar` | Bar chart | `:data`, `legend`, `height`, `showAxes`, `showGrid`, `stacked` | `components/charts/chart-bar.md` |
| `VibeChartPie` | Pie / doughnut | `:data`, `legend`, `height` | `components/charts/chart-pie.md` |

## Forms

| Component | Use | Common props / slots | Doc |
| --- | --- | --- | --- |
| `VibeFormGroup` | Label, help, validation, id wiring | `label`, `help-text`, `validation-state`, `validation-message`, `floating`, `row` | `forms/form-group.md` |
| `VibeFormInput` | Text and native input types | `v-model`, `type`, `validation-state`, `validation-message`, `@validate` | `forms/form-input.md` |
| `VibeFormSelect` | Select | `v-model`, `:options` (`FormSelectOption[]`), `multiple`, `placeholder` | `forms/form-select.md` |
| `VibeFormTextarea` | Multiline text | `v-model`, `rows` | `forms/form-textarea.md` |
| `VibeFormCheckbox` | Checkbox | `v-model` | `forms/form-checkbox.md` |
| `VibeFormRadio` | Radio group | `v-model` | `forms/form-radio.md` |
| `VibeFormSwitch` | Toggle | `v-model` | `forms/form-switch.md` |
| `VibeFormSpinbutton` | Numeric stepper | `v-model`, `min`, `max`, `step` | `forms/form-spinbutton.md` |
| `VibeFormDatepicker` | Date input | `v-model`, `min`, `max` | `forms/form-datepicker.md` |
| `VibeFileInput` | File picker | `v-model`, `accept`, `multiple` | `forms/file-input.md` |
| `VibeInputGroup` | Prefix/suffix controls | `prepend` / `append` props or slots; `size` | `forms/input-group.md` |
| `VibeAutocomplete` | Async suggestions | `v-model`, `:source`, `debounce` | `forms/autocomplete.md` |
| `VibeFormWysiwyg` | Rich text | `v-model`; requires `quill` + `dompurify` peers | `forms/form-wysiwyg.md` |
| `VibeFormErrorSummary` | Error list above a form | `:errors` | `forms/form-error-summary.md` |

## Composables

| Composable | Use | Doc |
| --- | --- | --- |
| `useForm` / `validators` | Whole-form state, validation, touched, reset | `forms/validation.md` |
| `useFormValidation` | Single field validation | `forms/validation.md` |
| `useToast` | App-wide toasts (`show`, `success`, `error`, `warn`, `info`) | `composables/use-toast.md` |
| `useColorMode` | Light / dark / auto, persisted | `composables/color-mode.md` |
| `useEventBus` | Command channels (modal, notification, theme, layout, navigation) | `composables/event-bus.md` |
| `useBreakpoints` | Reactive viewport flags | `composables/breakpoints.md` |
| `useId` | SSR-safe unique ids | `llms.txt` |
| `useDebouncedRef` | Debounced ref | `composables/debounced-ref.md` |
| `usePosition` | Floating positioning | `composables/use-position.md` |
| `useBackButton` | Hybrid back-button handling | `composables/back-button.md` |
