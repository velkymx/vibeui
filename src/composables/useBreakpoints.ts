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

  const cleanups: Array<() => void> = []

  if (typeof window !== 'undefined') {
    Object.values(breakpoints).forEach((value) => {
      const query = window.matchMedia(`(min-width: ${value}px)`)
      const listener = () => update()
      query.addEventListener('change', listener)
      cleanups.push(() => query.removeEventListener('change', listener))
    })

    if (getCurrentInstance()) {
      onUnmounted(() => cleanups.forEach(fn => fn()))
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
