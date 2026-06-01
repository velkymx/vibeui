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

let activeListenerInstalled = false

const onDocumentDragEnd = () => {
  // Either dragend or drop on the document marks the end of any drag operation,
  // even when the originating component unmounted mid-drag or the user pressed
  // Escape on a touch device. Without this, state.active could remain true
  // forever and a later drop on a VibeDroppable would receive the stale payload.
  state.payload = undefined
  state.group = ''
  state.active = false
  removeListener()
}

const installListener = () => {
  if (activeListenerInstalled || typeof document === 'undefined') return
  activeListenerInstalled = true
  // Bubble phase so the droppable's own @drop reads state before we clear it.
  document.addEventListener('dragend', onDocumentDragEnd)
  document.addEventListener('drop', onDocumentDragEnd)
}

const removeListener = () => {
  if (!activeListenerInstalled || typeof document === 'undefined') return
  activeListenerInstalled = false
  document.removeEventListener('dragend', onDocumentDragEnd)
  document.removeEventListener('drop', onDocumentDragEnd)
}

export const setActiveDrag = (payload: unknown, group: string): void => {
  state.payload = payload
  state.group = group
  state.active = true
  installListener()
}

export const clearActiveDrag = (): void => {
  state.payload = undefined
  state.group = ''
  state.active = false
  removeListener()
}

export const getActiveDrag = (): { payload: unknown; group: string } | null => {
  if (!state.active) return null
  return { payload: state.payload, group: state.group }
}
