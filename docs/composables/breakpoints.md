# useBreakpoints

A composable for programmatic breakpoint detection using standard Bootstrap grid sizes.

## Basic Usage

```javascript
import { useBreakpoints } from '@velkymx/vibeui'

const { isMobile, isTablet, isLg, isXxl } = useBreakpoints()
```

## API

| Property | Type | Description |
|---|---|---|
| `isXs` | `ComputedRef<boolean>` | `true` if width < 576px |
| `isSm` | `Ref<boolean>` | `true` if width >= 576px |
| `isMd` | `Ref<boolean>` | `true` if width >= 768px |
| `isLg` | `Ref<boolean>` | `true` if width >= 992px |
| `isXl` | `Ref<boolean>` | `true` if width >= 1200px |
| `isXxl` | `Ref<boolean>` | `true` if width >= 1400px |
| `isMobile` | `ComputedRef<boolean>` | `true` if screen is `xs` or `sm` (width < 768px) |
| `isTablet` | `ComputedRef<boolean>` | `true` if screen is exactly `md` (768px - 991px) |

## Performance
This composable uses `window.matchMedia` listeners instead of `resize` events, making it highly performant and efficient. It automatically cleans up listeners when the component is unmounted.

## Example: Adaptive Layout

```vue
<template>
  <div>
    <!-- Show offcanvas navigation on mobile, standard nav on desktop -->
    <VibeOffcanvas v-if="isMobile" v-model="showSidebar">
      <MySidebarContent />
    </VibeOffcanvas>
    
    <VibeRow v-else>
      <VibeCol cols="3">
        <MySidebarContent />
      </VibeCol>
      <VibeCol cols="9">
        <slot />
      </VibeCol>
    </VibeRow>
  </div>
</template>

<script setup>
import { useBreakpoints } from '@velkymx/vibeui'
const { isMobile } = useBreakpoints()
</script>
```
