interface DndState {
  payload: unknown
  group: string
  active: boolean
}

const state: DndState = {
  payload: undefined,
  group: '',
  active: false
}

export const setActiveDrag = (payload: unknown, group: string): void => {
  state.payload = payload
  state.group = group
  state.active = true
}

export const clearActiveDrag = (): void => {
  state.payload = undefined
  state.group = ''
  state.active = false
}

export const getActiveDrag = (): { payload: unknown; group: string } | null => {
  if (!state.active) return null
  return { payload: state.payload, group: state.group }
}
