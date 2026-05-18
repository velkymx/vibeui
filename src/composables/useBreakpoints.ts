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

  const cleanups: Array<() => void> = []

  // Cache MediaQueryList objects at setup time to avoid throwaway objects on every update()
  let mqls: Record<string, MediaQueryList> | null = null

  if (typeof window !== 'undefined') {
    mqls = {
      sm:  window.matchMedia(`(min-width: ${breakpoints.sm}px)`),
      md:  window.matchMedia(`(min-width: ${breakpoints.md}px)`),
      lg:  window.matchMedia(`(min-width: ${breakpoints.lg}px)`),
      xl:  window.matchMedia(`(min-width: ${breakpoints.xl}px)`),
      xxl: window.matchMedia(`(min-width: ${breakpoints.xxl}px)`)
    }
  }

  const update = () => {
    if (!mqls) return
    isSm.value  = mqls.sm.matches
    isMd.value  = mqls.md.matches
    isLg.value  = mqls.lg.matches
    isXl.value  = mqls.xl.matches
    isXxl.value = mqls.xxl.matches
  }

  // Initial update
  update()

  const isXs = computed(() => !isSm.value)
  const isMobile = computed(() => !isMd.value)
  const isTablet = computed(() => isMd.value && !isLg.value)

  if (mqls) {
    // Register change listeners on cached MediaQueryList objects
    const listener = () => update()
    Object.values(mqls).forEach((mql) => {
      mql.addEventListener('change', listener)
      cleanups.push(() => mql.removeEventListener('change', listener))
    })

    if (getCurrentInstance()) {
      onUnmounted(() => cleanups.forEach(fn => fn()))
    } else {
      console.warn('[useBreakpoints] Called outside component context. Call the returned cleanup() function manually to prevent listener leaks.')
    }
  }

  const cleanup = () => cleanups.forEach(fn => fn())

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isMobile,
    isTablet,
    cleanup
  }
}
