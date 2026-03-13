import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'

const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
}

/**
 * Composable for programmatic breakpoint detection using Bootstrap standard sizes.
 */
export function useBreakpoints() {
  const isSm = ref(false)
  const isMd = ref(false)
  const isLg = ref(false)
  const isXl = ref(false)
  const isXxl = ref(false)

  const queries: Record<string, MediaQueryList> = {}

  const update = () => {
    if (typeof window === 'undefined') return
    isSm.value = window.matchMedia(`(min-width: ${breakpoints.sm}px)`).matches
    isMd.value = window.matchMedia(`(min-width: ${breakpoints.md}px)`).matches
    isLg.value = window.matchMedia(`(min-width: ${breakpoints.lg}px)`).matches
    isXl.value = window.matchMedia(`(min-width: ${breakpoints.xl}px)`).matches
    isXxl.value = window.matchMedia(`(min-width: ${breakpoints.xxl}px)`).matches
  }

  // Initial update
  update()

  const isXs = computed(() => !isSm.value)
  const isMobile = computed(() => !isMd.value)
  const isTablet = computed(() => isMd.value && !isLg.value)

  // Use matchMedia listeners for efficiency
  if (typeof window !== 'undefined') {
    Object.entries(breakpoints).forEach(([key, value]) => {
      const query = window.matchMedia(`(min-width: ${value}px)`)
      const listener = () => {
        update()
      }
      query.addEventListener('change', listener)
      
      // Automatic cleanup if in component context
      if (getCurrentInstance()) {
        onUnmounted(() => query.removeEventListener('change', listener))
      }
    })
  }

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isMobile,
    isTablet
  }
}
