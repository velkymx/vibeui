import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import vibeui from './eslint-plugin/index.mjs'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'stress/**',
      'tests/browser/__screenshots__/**',
      'e2e/.cache/**'
    ]
  },
  // Plain JS (config, plugin, scripts): core recommended.
  {
    files: ['**/*.mjs', '**/*.cjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node }
    }
  },
  // TypeScript sources plus tests: the non-type-checked sets keep the lint
  // gate fast; vue-tsc (typecheck plus test:types) remains the type gate.
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['src/**/*.ts', 'tests/**/*.ts']
  })),
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // tsc (noUnusedLocals) already rejects dead symbols; the linter only
      // warns so editor feedback stays without failing the gate twice.
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  // SFC templates: vue-eslint-parser so the custom rule can walk them.
  // The vibeui/use-vibeui rule is OFF for src: library components implement
  // the raw elements (a VibeButton template cannot itself render VibeButton),
  // so flagging them would demand self-recursion. It stays wired here and is
  // enforced at error level on consumer-style example code, where a raw
  // element genuinely means a missed VibeUI equivalent.
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { vibeui },
    rules: {
      'vibeui/use-vibeui': 'off'
    }
  },
  {
    files: ['examples/**/*.vue', 'docs/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: { vibeui },
    rules: {
      'vibeui/use-vibeui': 'error'
    }
  }
)
