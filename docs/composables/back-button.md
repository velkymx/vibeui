# useBackButton

A composable to handle the Android hardware back button in hybrid mobile environments (like Capacitor or WebView apps).

## Basic Usage

```javascript
import { useBackButton } from '@velkymx/vibeui'

// Automatically closes this logic when the back button is pressed
useBackButton(() => {
  console.log('Back button pressed!')
  closeMyOverlay()
})
```

## How it Works
- It listens for the native `backbutton` event emitted by hybrid wrappers.
- It maintains an internal stack of "closeable" actions.
- When the back button is pressed, it executes the most recently registered action and prevents the default app-exit behavior.
- It automatically handles cleanup when the component using it is unmounted.

## Integrated Components
The following VibeUI components have `useBackButton` integrated automatically:
- `VibeModal`
- `VibeOffcanvas`

You don't need to manually use this composable if you are using these components; they will "just work" on Android devices.
