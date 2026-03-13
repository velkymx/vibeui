# Release Notes - v0.8.0

## Mobile Optimized & Hybrid Ready

v0.8 transforms VibeUI into a mobile-first library with first-class support for hybrid environments (Capacitor/WebView) and the latest Bootstrap 5.3 features.

## New Components

### `VibeInputGroup`
Easily prepend and append elements to form inputs.
- Supports `.input-group-text`, buttons, and custom slots.
- Integrates seamlessly with `VibeFormInput` using the new `noWrapper` prop.

### `VibeLink`
A dedicated link component supporting all new Bootstrap 5.3 utilities.
- **Underline variants:** `link-underline-0` through `link-underline-3`.
- **Opacity & Offset:** Full control over link opacity and underline offset.
- **Focus Ring:** Built-in support for the `.focus-ring` utility.

## New Composables

### `useBreakpoints`
Performant programmatic breakpoint detection.
- Uses `matchMedia` listeners for high efficiency.
- Reactive refs for `isMobile`, `isTablet`, `isLg`, etc.

### `useBackButton`
First-class support for the Android hardware back button.
- Maintains a stack of active overlays.
- Automatically integrated into `VibeModal` and `VibeOffcanvas`.

## Mobile Enhancements

### Safe Area Support
- `VibeNavbar`, `VibeOffcanvas`, and `VibeModal` now automatically respect device notches/safe areas in hybrid apps.

### Touch Optimization
- `VibeTooltip` and `VibePopover` now intelligently switch triggers to `click` on touch devices.

### DataTable "Stack" Mode
- Transform complex tables into mobile-friendly card views with the new `stack` prop.

### WYSIWYG Mobile UI
- `VibeFormWysiwyg` now features a simplified mobile toolbar that activates automatically on small screens.

## Bootstrap 5.3 Alignment

### Subtle & Emphasis Variants
- `VibeBadge` and `VibeAlert` now support the `subtle` prop, utilizing Bootstrap's new `.bg-*-subtle` and `.text-*-emphasis` classes.

### System Theme Reactivity
- `useColorMode` now reactively follows OS theme changes when set to `auto`.
- Added `onColorModeChange` callback for native UI synchronization.

### Focus Ring Support
- Added `focusRing` prop to `VibeButton`, `VibeFormInput`, and `VibeLink`.

### Nav Underline
- `VibeNav` now supports the `.nav-underline` style via the `underline` prop.

## Bootswatch & Theme Support

VibeUI is now fully compatible with custom Bootstrap themes (like Bootswatch **Darkly**).
- **CSS Variables:** Replaced all remaining hardcoded hex colors in components (like `VibeDataTable` and `VibeFormWysiwyg`) with standard Bootstrap CSS variables (`--bs-border-color`, `--bs-body-bg`, etc.).
- **Dynamic Adaptability:** Components will now automatically match the color palette of any included Bootstrap-compatible CSS theme.

## Bug Fixes & Improvements
- **Modal/Offcanvas Height:** Switched to `dvh` (dynamic viewport height) units to fix layout issues with mobile browser bars.
- **Improved Type Safety:** Refined TypeScript interfaces for all new props and components.
- **Atomic Initialization:** Refactored internal JS logic to ensure reliable initialization across all component variants.
