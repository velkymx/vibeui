import { describe, it, expect } from 'vitest'
// @ts-expect-error - plugin is authored in plain JS (no d.ts).
import plugin from '../../eslint-plugin/index.mjs'

// #92: the plugin exposes the rule and a recommended config consumers can extend.
describe('@velkymx/eslint-plugin-vibeui', () => {
  it('registers the use-vibeui rule', () => {
    expect(plugin.rules['use-vibeui']).toBeTruthy()
    expect(typeof plugin.rules['use-vibeui'].create).toBe('function')
  })

  it('ships a recommended flat config that enables the rule', () => {
    const recommended = plugin.configs.recommended
    expect(recommended.plugins.vibeui).toBe(plugin)
    expect(recommended.rules['vibeui/use-vibeui']).toBe('warn')
  })
})
