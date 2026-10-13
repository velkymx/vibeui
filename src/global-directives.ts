// Augments Vue's GlobalDirectives so the directive registered by
// `app.use(VibeUI)` is typed in templates (value checking, autocomplete, typo
// flagging) under vue-tsc/Volar. Mirrors src/global-components.ts.
declare module '@vue/runtime-core' {
  export interface GlobalDirectives {
    vVibeTooltip: typeof import('./directives/vTooltip')['vTooltip']
  }
}

export {}
