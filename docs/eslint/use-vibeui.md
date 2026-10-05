# ESLint rule: use-vibeui

Flags raw HTML elements that already have a VibeUI equivalent, so the component library is actually used instead of being bypassed with hand-rolled markup. It is a denylist, not an allowlist: only a small set of elements is flagged, and plain markup with no VibeUI equivalent (`div`, `span`, `p`, headings, lists, `img`, and so on) stays allowed.

The plugin lives in the repository at `eslint-plugin/` and is validated by the test suite (`tests/eslint/`).

## Default deny map

| Element | Use instead |
|---------|-------------|
| `button` | `VibeButton` |
| `a` | `VibeLink` |
| `input` / `select` / `textarea` | `VibeFormInput` / `VibeFormSelect` / `VibeFormTextarea` |
| `table` / `thead` / `tbody` / `tfoot` / `tr` / `td` / `th` | `VibeDataTable` |
| `nav` | `VibeNavbar` |

## Setup (flat config, ESLint 9+)

The rule walks Vue SFC templates, so it needs `vue-eslint-parser` (already configured by `eslint-plugin-vue`).

```js
// eslint.config.js
import vibeui from '@velkymx/eslint-plugin-vibeui'
import vue from 'eslint-plugin-vue'

export default [
  ...vue.configs['flat/recommended'],
  vibeui.configs.recommended, // enables vibeui/use-vibeui as a warning
]
```

Or register the rule yourself:

```js
export default [
  {
    plugins: { vibeui },
    rules: { 'vibeui/use-vibeui': 'error' },
  },
]
```

## Options

`denyMap` replaces the default map entirely, so teams can trim or extend it:

```js
{
  'vibeui/use-vibeui': ['error', {
    denyMap: {
      button: 'VibeButton',
      marquee: 'VibeMarquee', // extend
      // omit `a` to allow raw anchors
    },
  }]
}
```

## Suggestions

Each report offers a suggestion that renames the element to its component (for example `<button>...</button>` to `<VibeButton>...</VibeButton>`). It is a suggestion, not an autofix, because attributes and semantics usually need a human pass.

## Escape hatch

Use a standard inline ESLint disable comment in the template:

```vue
<template>
  <!-- eslint-disable-next-line vibeui/use-vibeui -->
  <button>Intentional raw button</button>
</template>
```
