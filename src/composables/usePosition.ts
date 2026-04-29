import {
  computePosition,
  autoUpdate,
  flip as flipMiddleware,
  shift as shiftMiddleware,
  offset as offsetMiddleware,
  type Placement
} from '@floating-ui/dom'
import { ref, watch, onBeforeUnmount, type Ref, type ComputedRef } from 'vue'

type AnchorPoint =
  | 'top start' | 'top center' | 'top end'
  | 'center start' | 'center center' | 'center end'
  | 'bottom start' | 'bottom center' | 'bottom end'

export interface UsePositionOptions {
  my?: AnchorPoint
  at?: AnchorPoint
  offset?: [number, number]
  collision?: 'flip' | 'shift' | 'flip+shift' | 'none'
  autoUpdate?: boolean
  strategy?: 'absolute' | 'fixed'
}

const POINT_TO_PLACEMENT: Record<string, Placement> = {
  // my anchor on target
  'top start at bottom start':       'bottom-start',
  'top center at bottom center':     'bottom',
  'top end at bottom end':           'bottom-end',
  'bottom start at top start':       'top-start',
  'bottom center at top center':     'top',
  'bottom end at top end':           'top-end',
  'center start at center end':      'right',
  'center end at center start':      'left',
  'top start at top end':            'right-start',
  'bottom start at bottom end':      'right-end',
  'top end at top start':            'left-start',
  'bottom end at bottom start':      'left-end'
}

const resolvePlacement = (my: AnchorPoint, at: AnchorPoint): Placement => {
  const key = `${my} at ${at}`
  if (POINT_TO_PLACEMENT[key]) return POINT_TO_PLACEMENT[key]
  // Fall back: derive from "at" alone (target side)
  const [vert, horiz] = at.split(' ')
  if (vert === 'bottom') return horiz === 'start' ? 'bottom-start' : horiz === 'end' ? 'bottom-end' : 'bottom'
  if (vert === 'top') return horiz === 'start' ? 'top-start' : horiz === 'end' ? 'top-end' : 'top'
  if (horiz === 'start') return vert === 'top' ? 'left-start' : vert === 'bottom' ? 'left-end' : 'left'
  if (horiz === 'end') return vert === 'top' ? 'right-start' : vert === 'bottom' ? 'right-end' : 'right'
  return 'bottom'
}

export interface UsePositionReturn {
  x: Ref<number>
  y: Ref<number>
  placement: Ref<Placement>
  update: () => Promise<void>
  stop: () => void
}

export function usePosition(
  target: Ref<HTMLElement | null> | ComputedRef<HTMLElement | null>,
  anchor: Ref<HTMLElement | null> | ComputedRef<HTMLElement | null>,
  options: UsePositionOptions = {}
): UsePositionReturn {
  const my = options.my ?? 'top center'
  const at = options.at ?? 'bottom center'
  const placement = ref<Placement>(resolvePlacement(my, at))
  const x = ref(0)
  const y = ref(0)

  let cleanup: (() => void) | null = null

  const buildMiddleware = () => {
    const mw = []
    if (options.offset) {
      const [skid, dist] = options.offset
      mw.push(offsetMiddleware({ mainAxis: dist, crossAxis: skid }))
    }
    const collide = options.collision ?? 'flip+shift'
    if (collide === 'flip' || collide === 'flip+shift') mw.push(flipMiddleware())
    if (collide === 'shift' || collide === 'flip+shift') mw.push(shiftMiddleware())
    return mw
  }

  const update = async (): Promise<void> => {
    const t = target.value
    const a = anchor.value
    if (!t || !a) return
    const result = await computePosition(a, t, {
      placement: resolvePlacement(my, at),
      strategy: options.strategy ?? 'absolute',
      middleware: buildMiddleware()
    })
    x.value = result.x
    y.value = result.y
    placement.value = result.placement
    Object.assign(t.style, {
      position: options.strategy ?? 'absolute',
      left: `${result.x}px`,
      top: `${result.y}px`
    })
  }

  const stop = (): void => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  watch(
    [target, anchor],
    () => {
      stop()
      const t = target.value
      const a = anchor.value
      if (!t || !a) return
      if (options.autoUpdate !== false) {
        cleanup = autoUpdate(a, t, () => {
          void update()
        })
      } else {
        void update()
      }
    },
    { immediate: true, flush: 'post' }
  )

  onBeforeUnmount(() => {
    stop()
  })

  return { x, y, placement, update, stop }
}
