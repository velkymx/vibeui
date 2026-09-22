import type { InjectionKey } from 'vue'
import type { VibeWysiwygConfig } from '../types'

/** App-level WYSIWYG config provided by `app.use(VibeUI, { wysiwyg })`. */
export const VIBE_WYSIWYG_KEY: InjectionKey<VibeWysiwygConfig> = Symbol('vibe-wysiwyg')
