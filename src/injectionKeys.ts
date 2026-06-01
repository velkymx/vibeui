import type { InjectionKey, ComputedRef } from 'vue'

// ── VibeFormGroup ─────────────────────────────────────────────────────────────
// Provided by VibeFormGroup, consumed by all form control components.

export interface FormGroupContext {
  /** The group's computed element id — shared with the first control that calls consumeId(). */
  id: ComputedRef<string>
  /**
   * Claim the group id for label association.
   * Only the first control that calls this receives the id — subsequent calls get null.
   * Prevents duplicate id attributes when multiple controls are inside one group.
   */
  consumeId: () => string | null
  hasLabel: ComputedRef<boolean>
  hasValidation: ComputedRef<boolean>
  hasHelp: ComputedRef<boolean>
}

export const FORM_GROUP_KEY: InjectionKey<FormGroupContext | null> = Symbol('vibeFormGroup')

// ── VibeNavbar ────────────────────────────────────────────────────────────────
// Provided by VibeNavbar, consumed by VibeNavbarToggle and VibeCollapse.

export interface NavbarCollapseContext {
  collapseStates: Record<string, boolean>
  toggleCollapse: (id: string) => void
}

export const NAVBAR_COLLAPSE_KEY: InjectionKey<NavbarCollapseContext | null> = Symbol('vibeNavbarCollapse')

// ── VibeTabs ──────────────────────────────────────────────────────────────────
// Provided by VibeTabs, consumed by VibeTab.

export interface TabsContext {
  register: (name: string, label: string, disabled: boolean) => void
  unregister: (name: string) => void
  isActive: (name: string) => boolean
  hasBeenActive: (name: string) => boolean
  lazy: boolean
}

export const TABS_CONTEXT_KEY: InjectionKey<TabsContext | null> = Symbol('vibeTabsContext')
