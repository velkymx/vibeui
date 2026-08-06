import { expect, vi } from 'vitest'

// Poll the real DOM until a node matching `selector` exists; returns it.
// Used for Bootstrap/Quill nodes that lack a stable role (e.g. .modal-backdrop)
// and for teleported content appended to document.body.
export async function waitForSelector(selector: string, timeout = 4000): Promise<Element> {
  let found: Element | null = null
  await vi.waitFor(() => {
    found = document.querySelector(selector)
    expect(found, `expected to find "${selector}"`).not.toBeNull()
  }, { timeout })
  return found as unknown as Element
}

// Poll until no node matches `selector` (e.g. after a close/hide animation).
export async function waitForGone(selector: string, timeout = 4000): Promise<void> {
  await vi.waitFor(() => {
    expect(document.querySelector(selector), `expected "${selector}" to be gone`).toBeNull()
  }, { timeout })
}

// Resolve once `el` fires `type` exactly once. Used to await a Bootstrap transition
// event (e.g. shown.bs.modal) so interactions don't land mid-transition, where
// Bootstrap's hide() no-ops while `_isTransitioning`. Attach BEFORE triggering show.
export function onceEvent(el: Element, type: string, timeout = 4000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for "${type}"`)), timeout)
    el.addEventListener(type, () => { clearTimeout(timer); resolve() }, { once: true })
  })
}

// Poll until Bootstrap has attached an instance of `kind` to `el`.
//
// VibeUI loads Bootstrap JS on demand (`await import('bootstrap')` inside onMounted),
// so for a few frames after render the element is in the DOM but has no Bootstrap
// behaviour. Interacting during that window is silently lost — a mouseenter arrives
// before any listener exists and is never replayed, so the tooltip simply never
// appears. Await this before driving a component that depends on Bootstrap JS,
// rather than sleeping for an arbitrary duration.
export async function waitForBsInstance(
  el: Element,
  kind: 'Tooltip' | 'Popover' | 'Dropdown',
  timeout = 4000
): Promise<void> {
  const bootstrap = await import('bootstrap')
  const ctor = bootstrap[kind] as { getInstance: (e: Element) => unknown | null }
  await vi.waitFor(() => {
    expect(ctor.getInstance(el), `expected a Bootstrap ${kind} instance on the element`).not.toBeNull()
  }, { timeout })
}
