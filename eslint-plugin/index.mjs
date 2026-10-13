/**
 * @velkymx ESLint plugin for VibeUI (#92).
 *
 * Ships the `use-vibeui` rule, which flags raw HTML elements that already have a
 * VibeUI equivalent. Pair with `vue-eslint-parser` (as eslint-plugin-vue sets up)
 * so the rule can walk SFC templates and so inline `eslint-disable` comments in a
 * template are honored as the escape hatch.
 */
import useVibeui from './rules/use-vibeui.mjs'

const plugin = {
  meta: { name: '@velkymx/eslint-plugin-vibeui' },
  rules: {
    'use-vibeui': useVibeui,
  },
}

// Flat-config (ESLint 9+) recommended preset. Assumes the consumer's Vue config
// already registers vue-eslint-parser for .vue files.
plugin.configs = {
  recommended: {
    plugins: { vibeui: plugin },
    rules: {
      'vibeui/use-vibeui': 'warn',
    },
  },
}

export default plugin
export const { rules, configs } = plugin
