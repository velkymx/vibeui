# Versioning & Stability Policy

VibeUI follows [Semantic Versioning](https://semver.org/). This page defines what is covered by that promise so you can embed VibeUI in a long-lived project with confidence.

## The promise

Within a major version (e.g. all of `1.x`), the **public API does not break**. You can upgrade minor and patch releases without code changes.

- **MAJOR** (`2.0.0`) — breaking changes to the public API.
- **MINOR** (`1.1.0`) — new components, props, events, or composables, backwards-compatible.
- **PATCH** (`1.0.1`) — bug fixes, internal changes, no API change.

## What counts as public API

Covered by the SemVer promise:

- **Component names** and their registration (global plugin install + named exports).
- **Props** — names, types, and documented default behavior.
- **Events** (`emits`) — names and payload shapes.
- **Slots** — names and slot-prop shapes.
- **Composables** exported from the package entry (`useColorMode`, `useToast`, `useForm`, `useFormValidation`, `useBreakpoints`, `useId`, `usePosition`, `useBackButton`, etc.) — their call signatures and return shapes.
- **Directives** exported from the entry (e.g. `vTooltip`).
- **Published TypeScript types** for all of the above.

## What is explicitly NOT covered

These may change in any release, including patches:

- **Escape hatches prefixed `_unsafe_`** (e.g. `_unsafe_bsInstance`). They expose the underlying Bootstrap/Quill instance and are not a stable interface — using them couples you to third-party internals at your own risk.
- **Internal modules** not exported from the package entry (anything under `src/utils`, `src/injectionKeys`, internal composables, etc.).
- **Generated DOM structure / CSS class composition** beyond what Bootstrap itself defines. We target Bootstrap 5.3 markup; we don't promise the exact wrapper nesting.
- **Console warnings** (dev-only deprecation/validation messages).

## Deprecation policy

When a public API needs to change:

1. The old form keeps working and emits a **dev-only deprecation warning** for at least one **minor** release.
2. The replacement is documented alongside the deprecation.
3. Removal happens only in the next **major**.

(Example already in the codebase: the tooltip/popover `content` prop is deprecated in favor of `text` and still functions.)

## Peer dependency policy

VibeUI declares its framework requirements as peer dependencies:

- **`vue` (required, `^3.5`)** and **`bootstrap` (required, `^5.3`)** — supported ranges. Raising the **minimum** supported version of either is a **major** change.
- **`quill`, `dompurify`, `bootstrap-icons` (optional)** — needed only for `VibeFormWysiwyg` (quill + dompurify) and `VibeIcon` (bootstrap-icons). Absent unless you use those features.

A new major of an upstream peer (Bootstrap 6, Quill 3, Vue 4) is adopted in a **major** VibeUI release, never a minor.

## Recommendations for long-lived projects

- **Pin a version** (`"@velkymx/vibeui": "1.4.2"`) or a tilde range (`~1.4.0`) rather than a wide caret, and upgrade deliberately.
- Read `CHANGELOG.md` before upgrading minors.
- The full test suite ships with the source — if you ever need to fork and patch, you inherit the regression safety net (unit + real-browser tests).
