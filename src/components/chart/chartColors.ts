import type { ChartDataset } from '../../types'

const BS_VARS = [
  '--bs-primary',
  '--bs-success',
  '--bs-danger',
  '--bs-warning',
  '--bs-info',
  '--bs-secondary',
  '--bs-dark',
  '--bs-light',
]

export function resolveColors(datasets: ChartDataset[], el: HTMLElement): string[] {
  const style = getComputedStyle(el)
  return datasets.map(
    (ds, i) => ds.color ?? style.getPropertyValue(BS_VARS[i % BS_VARS.length]).trim()
  )
}

export function resolveSliceColors(count: number, el: HTMLElement): string[] {
  const style = getComputedStyle(el)
  return Array.from({ length: count }, (_, i) =>
    style.getPropertyValue(BS_VARS[i % BS_VARS.length]).trim()
  )
}
