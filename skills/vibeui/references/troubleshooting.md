# VibeUI troubleshooting

Work from symptom to cause. Read the component page before changing code; most issues are a prop or a control path, not a CSS problem.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Button renders outlined but the variant looks wrong, or a dev warning fires | Passed `variant="outline-primary"` | `variant="primary" outline` (`outline` is boolean) |
| Icon is blank | Used `name=` or forgot the peer | `<VibeIcon icon="house" />`; install `bootstrap-icons` |
| Carousel has no slides | Passed `:slides` or items without `src` | `:items` with `{ src, alt?, caption? }` |
| Modal or offcanvas will not open | Two control paths, or Bootstrap JS never loaded | Use `v-model` or a ref (`show()` / `hide()`), not both. On no-build pages add the `bootstrap` import map. |
| Modal opens but Escape/backdrop misbehaves | A manual Bootstrap instance or `data-bs-toggle` is also controlling it | Remove the manual path; VibeUI owns the lifecycle |
| Toast service shows nothing | `<VibeToastHost />` is not mounted | Mount one host at the app root; call `useToast()` |
| Form errors never appear | Validation state/message not bound | Bind `:validation-state` and `:validation-message` on `VibeFormGroup` or the control, and call `validate()` / `validateField()` |
| Browser native validation fights the form | Missing `novalidate` | `<form novalidate @submit.prevent="…">` |
| `DataTableColumn<Row>[]` rejects `{ key: 'name' }` | The `columns` array is not annotated, or `key` is a string | Annotate `const columns: DataTableColumn<Row>[] = [...]` and use real row keys |
| A render-only column (actions) fails the type | `key` must be a row key | Add an optional field to the row type (`actions?: never`) or type the column array explicitly |
| Per-key `#cell(key)` props are untyped or unions | Older package | Requires VibeUI ≥ 1.3.1 (`DataTableColumnCellSlotProps`) |
| Table empty state has no action | `empty-text` is text only; there is no `#empty` slot today | Put the primary action in the page header |
| Table shows stale rows while fetching | `loading` not set | `:loading="pending"`; keep `:items` as the last good page |
| Selection/paging does not sync | Passed props without the model | Use `v-model:selected-rows`, `v-model:current-page`, `v-model:per-page` |
| Pagination ignores the page | Bound the wrong prop | `v-model:current-page` (camel-case kebab in templates) |
| Theme flashes on load | Color mode read after mount | `app.use(VibeUI)` applies it; otherwise call `initColorMode()` before mount |
| Dark mode colors are wrong | Custom colors instead of theme tokens | Use `data-bs-theme` / `useColorMode` and Bootstrap tokens |
| Bootstrap behaves twice (two backdrops, double events) | Bootstrap JS imported by the app | Remove `import 'bootstrap'`; VibeUI loads it on demand |
| Dynamic import fails in a plain browser page | No import map for the peer | Add `{ "imports": { "bootstrap": "https://esm.sh/bootstrap@5.3" } }` |
| `VibeRow` / `VibeCol` spans do nothing | Wrong prop names | `:cols`, `:sm`, `:md`, `:lg`, `:xl` |
| Layout breaks at 320 px | Fixed widths, non-wrapping flex rows, or a wide table | Wrap tables in the responsive container; allow wrapping and shrinking |
| Styles need `!important` | Overriding component CSS instead of using props | Use `variant`/`size`/`class`; if still blocked, check the component doc before adding CSS |
| A custom one-off style is ignored | Scoped styles do not pierce child components | Pass `class` to the component root, or use `:deep()` in app CSS |

For exact props and events, open the component page in `docs/`. For the setup model (CSS vs JS, import map), read `docs/best-practices.md` §1.
